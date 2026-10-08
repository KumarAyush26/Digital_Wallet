const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { generateTxnId } = require('../utils/idGenerator');
const { emitToUser } = require('../services/socketService');

// @desc Get all budgets for the current month with live spending calculations
// @route GET /api/budgets
// @access Private
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({ userId: req.user._id, month, year });

    // Aggregate user spending by category for this month
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          sender: req.user._id,
          type: { $in: ['DEBIT', 'TRANSFER', 'WITHDRAWAL'] },
          status: 'SUCCESS',
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const spendMap = {};
    categorySpending.forEach((item) => {
      spendMap[item._id] = item.totalSpent;
    });

    const budgetsWithSpent = budgets.map((b) => {
      const spent = spendMap[b.category] || 0;
      const percentage = Math.round((spent / b.limitAmount) * 100);
      return {
        _id: b._id,
        category: b.category,
        limitAmount: b.limitAmount,
        spentAmount: spent,
        remainingAmount: Math.max(0, b.limitAmount - spent),
        percentage,
        isExceeded: spent > b.limitAmount,
        month: b.month,
        year: b.year
      };
    });

    res.status(200).json({
      success: true,
      budgets: budgetsWithSpent
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create or update a budget limit for a category
// @route POST /api/budgets
// @access Private
const setBudget = async (req, res, next) => {
  try {
    const { category, limitAmount, month, year } = req.body;
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    if (!category || !limitAmount || Number(limitAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid category and budget limit.' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month: targetMonth, year: targetYear },
      { limitAmount: Number(limitAmount) },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Monthly budget for ${category} set to ₹${Number(limitAmount).toLocaleString('en-IN')}.`,
      budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all savings goals
// @route GET /api/budgets/goals
// @access Private
const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new savings goal
// @route POST /api/budgets/goals
// @access Private
const createSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, targetDate, category, color } = req.body;

    if (!title || !targetAmount || Number(targetAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide goal title and target amount.' });
    }

    const goal = await SavingsGoal.create({
      userId: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      targetDate: targetDate ? new Date(targetDate) : undefined,
      category: category || 'General Savings',
      color: color || '#10B981'
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created!',
      goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc Contribute to a savings goal from wallet
// @route POST /api/budgets/goals/:id/contribute
// @access Private
const contributeSavingsGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount to contribute.' });
    }

    // Deduct from wallet balance atomically
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id, balance: { $gte: numAmount } },
      { $inc: { balance: -numAmount } },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance to deposit to savings goal.' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      // Refund wallet
      await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: numAmount } });
      return res.status(404).json({ success: false, message: 'Savings goal not found.' });
    }

    goal.currentAmount += numAmount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    await goal.save();

    const txnId = generateTxnId();
    const transaction = await Transaction.create({
      transactionId: txnId,
      sender: req.user._id,
      senderWallet: wallet._id,
      amount: numAmount,
      type: 'DEBIT',
      category: 'Investments',
      status: 'SUCCESS',
      description: `Contribution to savings goal: ${goal.title}`,
      note: 'Savings Goal Deposit'
    });

    const notif = await Notification.create({
      userId: req.user._id,
      title: 'Savings Goal Deposit',
      message: `₹${numAmount.toLocaleString('en-IN')} allocated to "${goal.title}". Current progress: ₹${goal.currentAmount.toLocaleString('en-IN')} / ₹${goal.targetAmount.toLocaleString('en-IN')}`,
      type: 'WALLET_DEBITED'
    });

    emitToUser(req.user._id.toString(), 'wallet_updated', {
      balance: wallet.balance,
      transaction,
      notification: notif
    });

    res.status(200).json({
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN')} deposited to "${goal.title}"!`,
      goal,
      wallet
    });
  } catch (error) {
    next(error);
  }
};

// @desc Withdraw funds from a savings goal back to wallet
// @route POST /api/budgets/goals/:id/withdraw
// @access Private
const withdrawFromSavingsGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount to withdraw.' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found.' });
    }

    if (goal.currentAmount < numAmount) {
      return res.status(400).json({ success: false, message: 'Withdrawal amount exceeds funds in this savings goal.' });
    }

    goal.currentAmount -= numAmount;
    if (goal.currentAmount < goal.targetAmount) {
      goal.isCompleted = false;
    }
    await goal.save();

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { balance: numAmount } },
      { new: true }
    );

    const txnId = generateTxnId();
    const transaction = await Transaction.create({
      transactionId: txnId,
      receiver: req.user._id,
      receiverWallet: wallet._id,
      amount: numAmount,
      type: 'CREDIT',
      category: 'Investments',
      status: 'SUCCESS',
      description: `Withdrawn from savings goal: ${goal.title}`,
      note: 'Savings Goal Release'
    });

    const notif = await Notification.create({
      userId: req.user._id,
      title: 'Savings Goal Released',
      message: `₹${numAmount.toLocaleString('en-IN')} returned from "${goal.title}" to your active wallet.`,
      type: 'WALLET_CREDITED'
    });

    emitToUser(req.user._id.toString(), 'wallet_updated', {
      balance: wallet.balance,
      transaction,
      notification: notif
    });

    res.status(200).json({
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN')} returned to wallet!`,
      goal,
      wallet
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setBudget,
  getSavingsGoals,
  createSavingsGoal,
  contributeSavingsGoal,
  withdrawFromSavingsGoal
};
