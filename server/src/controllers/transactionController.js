const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateTxnId } = require('../utils/idGenerator');
const { emitToUser } = require('../services/socketService');

// @desc Get transactions with advanced filters, pagination & search
// @route GET /api/transactions
// @access Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      type,
      category,
      status,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Filter for transactions where user is sender or receiver
    const query = {
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    };

    if (type) {
      if (type === 'SENT') {
        query.sender = req.user._id;
        delete query.$or;
      } else if (type === 'RECEIVED') {
        query.receiver = req.user._id;
        delete query.$or;
      } else {
        query.type = type;
      }
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        {
          $or: [
            { transactionId: searchRegex },
            { description: searchRegex },
            { note: searchRegex }
          ]
        }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('sender', 'name email upiId avatar')
      .populate('receiver', 'name email upiId avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single transaction details
// @route GET /api/transactions/:id
// @access Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name email phone upiId avatar')
      .populate('receiver', 'name email phone upiId avatar');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc Request money from another user
// @route POST /api/transactions/request-money
// @access Private
const requestMoney = async (req, res, next) => {
  try {
    const { targetUpi, amount, note } = req.body;
    const numAmount = Number(amount);

    if (!targetUpi || !numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid UPI ID and amount.' });
    }

    const targetUser = await User.findOne({
      $or: [
        { upiId: targetUpi.toLowerCase().trim() },
        { email: targetUpi.toLowerCase().trim() },
        { phone: targetUpi.trim() }
      ]
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot request money from yourself.' });
    }

    const notif = await Notification.create({
      userId: targetUser._id,
      title: 'Payment Request Received',
      message: `${req.user.name} (${req.user.upiId}) requested ₹${numAmount.toLocaleString('en-IN')}${note ? ` for "${note}"` : ''}.`,
      type: 'PAYMENT_REQUEST',
      metadata: {
        requesterId: req.user._id,
        requesterName: req.user.name,
        requesterUpi: req.user.upiId,
        amount: numAmount,
        note: note || ''
      }
    });

    emitToUser(targetUser._id.toString(), 'notification_new', notif);

    res.status(200).json({
      success: true,
      message: `Payment request for ₹${numAmount.toLocaleString('en-IN')} sent to ${targetUser.name}!`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  requestMoney
};
