const Transaction = require('../models/Transaction');
const { generateUserAiInsights } = require('../services/aiInsightsService');

// @desc Get main spending, income, and transaction overview stats
// @route GET /api/analytics/overview
// @access Private
const getSpendingOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total sent (all time)
    const sentAgg = await Transaction.aggregate([
      {
        $match: {
          sender: userId,
          type: { $in: ['DEBIT', 'TRANSFER', 'WITHDRAWAL'] },
          status: 'SUCCESS'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Total received (all time)
    const receivedAgg = await Transaction.aggregate([
      {
        $match: {
          receiver: userId,
          type: { $in: ['CREDIT', 'TRANSFER'] },
          status: 'SUCCESS'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Current month expenses
    const currentMonthSent = await Transaction.aggregate([
      {
        $match: {
          sender: userId,
          type: { $in: ['DEBIT', 'TRANSFER', 'WITHDRAWAL'] },
          status: 'SUCCESS',
          createdAt: { $gte: currentMonthStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Current month income
    const currentMonthReceived = await Transaction.aggregate([
      {
        $match: {
          receiver: userId,
          type: { $in: ['CREDIT', 'TRANSFER'] },
          status: 'SUCCESS',
          createdAt: { $gte: currentMonthStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Top frequent recipients
    const frequentRecipients = await Transaction.aggregate([
      {
        $match: {
          sender: userId,
          type: 'TRANSFER',
          status: 'SUCCESS',
          receiver: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$receiver',
          count: { $sum: 1 },
          totalSent: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'recipientUser'
        }
      },
      { $unwind: '$recipientUser' },
      {
        $project: {
          _id: 1,
          name: '$recipientUser.name',
          upiId: '$recipientUser.upiId',
          avatar: '$recipientUser.avatar',
          count: 1,
          totalSent: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSent: sentAgg[0]?.total || 0,
        totalReceived: receivedAgg[0]?.total || 0,
        totalTransactions: (sentAgg[0]?.count || 0) + (receivedAgg[0]?.count || 0),
        monthlySpending: currentMonthSent[0]?.total || 0,
        monthlyIncome: currentMonthReceived[0]?.total || 0,
        netSavings: Math.max(0, (currentMonthReceived[0]?.total || 0) - (currentMonthSent[0]?.total || 0)),
        frequentRecipients
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get 6-month historical income vs expense comparison for Chart.js
// @route GET /api/analytics/monthly-trends
// @access Private
const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'SUCCESS',
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ createdAt: 1 });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap = {};

    // Initialize 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      monthlyDataMap[key] = { month: key, income: 0, expense: 0 };
    }

    transactions.forEach((txn) => {
      const date = new Date(txn.createdAt);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;

      if (monthlyDataMap[key]) {
        if (txn.sender && txn.sender.toString() === userId.toString()) {
          monthlyDataMap[key].expense += txn.amount;
        } else if (txn.receiver && txn.receiver.toString() === userId.toString()) {
          monthlyDataMap[key].income += txn.amount;
        }
      }
    });

    res.status(200).json({
      success: true,
      trends: Object.values(monthlyDataMap)
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get category breakdown for donut chart
// @route GET /api/analytics/category-breakdown
// @access Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          sender: userId,
          type: { $in: ['DEBIT', 'TRANSFER', 'WITHDRAWAL'] },
          status: 'SUCCESS',
          createdAt: { $gte: currentMonthStart }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      categories: categoryData.map((c) => ({
        category: c._id || 'General Transfer',
        amount: c.totalAmount,
        count: c.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get AI-powered spending insights and predictions
// @route GET /api/analytics/ai-insights
// @access Private
const getAiInsights = async (req, res, next) => {
  try {
    const insights = await generateUserAiInsights(req.user._id);
    res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSpendingOverview,
  getMonthlyTrends,
  getCategoryBreakdown,
  getAiInsights
};
