const ScheduledTransfer = require('../models/ScheduledTransfer');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { generateTxnId } = require('../utils/idGenerator');
const { emitToUser } = require('../services/socketService');

// @desc Get all scheduled transfers for current user
// @route GET /api/scheduled-transfers
// @access Private
const getScheduledTransfers = async (req, res, next) => {
  try {
    const transfers = await ScheduledTransfer.find({ userId: req.user._id })
      .populate('recipientId', 'name upiId email avatar')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      transfers
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new scheduled / recurring transfer
// @route POST /api/scheduled-transfers
// @access Private
const createScheduledTransfer = async (req, res, next) => {
  try {
    const { recipientUpi, amount, category, frequency, scheduledDate, note } = req.body;
    const numAmount = Number(amount);

    if (!recipientUpi || !numAmount || numAmount <= 0 || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Please provide recipient, valid amount, and schedule date.' });
    }

    const recipient = await User.findOne({
      $or: [
        { upiId: recipientUpi.toLowerCase().trim() },
        { email: recipientUpi.toLowerCase().trim() },
        { phone: recipientUpi.trim() }
      ]
    });

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot schedule a transfer to yourself.' });
    }

    const scheduled = await ScheduledTransfer.create({
      userId: req.user._id,
      recipientId: recipient._id,
      recipientUpi: recipient.upiId,
      amount: numAmount,
      category: category || 'Bills & Utilities',
      frequency: frequency || 'ONCE',
      scheduledDate: new Date(scheduledDate),
      note: note || ''
    });

    res.status(201).json({
      success: true,
      message: `Transfer of ₹${numAmount.toLocaleString('en-IN')} to ${recipient.name} scheduled for ${new Date(scheduledDate).toLocaleDateString('en-IN')}!`,
      scheduled
    });
  } catch (error) {
    next(error);
  }
};

// @desc Cancel a scheduled transfer
// @route DELETE /api/scheduled-transfers/:id
// @access Private
const cancelScheduledTransfer = async (req, res, next) => {
  try {
    const transfer = await ScheduledTransfer.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Scheduled transfer not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Scheduled transfer cancelled.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getScheduledTransfers,
  createScheduledTransfer,
  cancelScheduledTransfer
};
