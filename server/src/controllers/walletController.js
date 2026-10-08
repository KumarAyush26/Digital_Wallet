const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Budget = require('../models/Budget');
const { generateTxnId } = require('../utils/idGenerator');
const { evaluateTransactionRisk } = require('../services/fraudDetectionService');
const { emitToUser, emitToAdmin } = require('../services/socketService');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../config/constants');

// @desc Get current user wallet
// @route GET /api/wallet
// @access Private
const getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        accountNumber: `WLT_${Math.floor(10000000 + Math.random() * 90000000)}`,
        balance: 1000
      });
    }

    res.status(200).json({
      success: true,
      wallet
    });
  } catch (error) {
    next(error);
  }
};

// @desc Validate recipient by UPI ID, email, or phone
// @route POST /api/wallet/validate-recipient
// @access Private
const validateRecipient = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier || identifier.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter a UPI ID, email, or phone number.' });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Find recipient by upiId, email, or phone
    const recipient = await User.findOne({
      $or: [
        { upiId: cleanId },
        { email: cleanId },
        { phone: identifier.trim() }
      ]
    }).select('name upiId email phone avatar isFrozen');

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found. Please verify the UPI ID or details.' });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot transfer money to your own wallet account.' });
    }

    if (recipient.isFrozen) {
      return res.status(400).json({ success: false, message: 'Recipient account is temporarily restricted.' });
    }

    res.status(200).json({
      success: true,
      recipient: {
        _id: recipient._id,
        name: recipient.name,
        upiId: recipient.upiId,
        avatar: recipient.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add money (Simulated Top-up)
// @route POST /api/wallet/add-money
// @access Private
const addMoney = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount greater than ₹0.' });
    }

    if (numAmount > 200000) {
      return res.status(400).json({ success: false, message: 'Maximum top-up limit per transaction is ₹2,00,000.' });
    }

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { balance: numAmount, totalReceived: numAmount } },
      { new: true, upsert: true }
    );

    const txnId = generateTxnId();

    const transaction = await Transaction.create({
      transactionId: txnId,
      receiver: req.user._id,
      receiverWallet: wallet._id,
      amount: numAmount,
      type: TRANSACTION_TYPES.CREDIT,
      category: 'Wallet Top-up',
      status: TRANSACTION_STATUS.SUCCESS,
      description: `Wallet top-up via ${paymentMethod || 'Simulated Gateway'}`,
      paymentMethod: paymentMethod || 'CARD_SIMULATION'
    });

    // In-app Notification
    const notif = await Notification.create({
      userId: req.user._id,
      title: 'Wallet Credited',
      message: `₹${numAmount.toLocaleString('en-IN')} added to your wallet successfully.`,
      type: 'WALLET_CREDITED',
      metadata: { transactionId: txnId, amount: numAmount }
    });

    // Socket.io real-time push
    emitToUser(req.user._id.toString(), 'wallet_updated', {
      balance: wallet.balance,
      transaction,
      notification: notif
    });

    res.status(200).json({
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN')} added to wallet successfully!`,
      wallet,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc Withdraw money (Simulated Payout)
// @route POST /api/wallet/withdraw
// @access Private
const withdrawMoney = async (req, res, next) => {
  try {
    const { amount, bankAccount, ifscCode, upiId } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount greater than ₹0.' });
    }

    // Atomic deduction if sufficient balance
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id, balance: { $gte: numAmount } },
      { $inc: { balance: -numAmount, totalSent: numAmount } },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance for withdrawal.' });
    }

    const txnId = generateTxnId();

    const transaction = await Transaction.create({
      transactionId: txnId,
      sender: req.user._id,
      senderWallet: wallet._id,
      amount: numAmount,
      type: TRANSACTION_TYPES.WITHDRAWAL,
      category: 'General Transfer',
      status: TRANSACTION_STATUS.SUCCESS,
      description: `Withdrawal to ${bankAccount ? `Bank A/C ending in ${bankAccount.slice(-4)}` : (upiId || 'External Account')}`,
      paymentMethod: 'PAYOUT_SIMULATION'
    });

    const notif = await Notification.create({
      userId: req.user._id,
      title: 'Withdrawal Successful',
      message: `₹${numAmount.toLocaleString('en-IN')} withdrawn from your wallet.`,
      type: 'WALLET_DEBITED',
      metadata: { transactionId: txnId, amount: numAmount }
    });

    emitToUser(req.user._id.toString(), 'wallet_updated', {
      balance: wallet.balance,
      transaction,
      notification: notif
    });

    res.status(200).json({
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN')} withdrawn successfully!`,
      wallet,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc Transfer money to another registered user (Atomic P2P Transfer)
// @route POST /api/wallet/transfer
// @access Private
const transferMoney = async (req, res, next) => {
  try {
    const { recipientId, recipientUpi, amount, category, note } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid transfer amount.' });
    }

    // Find recipient
    let recipient;
    if (recipientId) {
      recipient = await User.findById(recipientId);
    } else if (recipientUpi) {
      recipient = await User.findOne({
        $or: [
          { upiId: recipientUpi.toLowerCase().trim() },
          { email: recipientUpi.toLowerCase().trim() },
          { phone: recipientUpi.trim() }
        ]
      });
    }

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot transfer funds to yourself.' });
    }

    if (recipient.isFrozen) {
      return res.status(400).json({ success: false, message: 'Recipient account is temporarily restricted.' });
    }

    // 1. Evaluate Fraud Risk Engine
    const riskAssessment = await evaluateTransactionRisk(req.user._id, recipient._id, numAmount);

    // 2. Perform Atomic Balance Deduction on Sender
    const senderWallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id, balance: { $gte: numAmount } },
      { $inc: { balance: -numAmount, totalSent: numAmount } },
      { new: true }
    );

    if (!senderWallet) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance. Please add money to your wallet.'
      });
    }

    // 3. Perform Atomic Credit on Receiver
    const receiverWallet = await Wallet.findOneAndUpdate(
      { userId: recipient._id },
      { $inc: { balance: numAmount, totalReceived: numAmount } },
      { new: true, upsert: true }
    );

    const txnId = generateTxnId();
    const finalCategory = category || 'General Transfer';

    // 4. Create Transaction Record
    const transaction = await Transaction.create({
      transactionId: txnId,
      sender: req.user._id,
      receiver: recipient._id,
      senderWallet: senderWallet._id,
      receiverWallet: receiverWallet._id,
      amount: numAmount,
      type: TRANSACTION_TYPES.TRANSFER,
      category: finalCategory,
      status: TRANSACTION_STATUS.SUCCESS,
      description: `Transfer to ${recipient.name} (${recipient.upiId})`,
      note: note || '',
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      riskReasons: riskAssessment.riskReasons
    });

    // 5. Create In-App Notifications
    const senderNotif = await Notification.create({
      userId: req.user._id,
      title: 'Payment Successful',
      message: `₹${numAmount.toLocaleString('en-IN')} sent to ${recipient.name} (${recipient.upiId}).`,
      type: 'TRANSFER_SENT',
      metadata: { transactionId: txnId, amount: numAmount, recipientName: recipient.name }
    });

    const receiverNotif = await Notification.create({
      userId: recipient._id,
      title: 'Money Received',
      message: `You received ₹${numAmount.toLocaleString('en-IN')} from ${req.user.name} (${req.user.upiId}).`,
      type: 'TRANSFER_RECEIVED',
      metadata: { transactionId: txnId, amount: numAmount, senderName: req.user.name }
    });

    // 6. Real-Time Socket.IO Pushes
    emitToUser(req.user._id.toString(), 'wallet_updated', {
      balance: senderWallet.balance,
      transaction,
      notification: senderNotif
    });

    emitToUser(recipient._id.toString(), 'wallet_updated', {
      balance: receiverWallet.balance,
      transaction,
      notification: receiverNotif
    });

    // If flagged by fraud detection, notify Admin channel
    if (riskAssessment.isFlagged) {
      emitToAdmin('flagged_transaction_alert', {
        transactionId: txnId,
        senderName: req.user.name,
        receiverName: recipient.name,
        amount: numAmount,
        riskScore: riskAssessment.riskScore,
        riskReasons: riskAssessment.riskReasons
      });
    }

    // 7. Low Balance Warning Check
    if (senderWallet.balance < 500) {
      await Notification.create({
        userId: req.user._id,
        title: 'Low Balance Warning',
        message: `Your wallet balance is low (₹${senderWallet.balance.toLocaleString('en-IN')}). Consider adding funds.`,
        type: 'BUDGET_WARNING'
      });
    }

    // 8. Check if Category Budget limit is nearing/exceeded
    const now = new Date();
    const currentBudget = await Budget.findOne({
      userId: req.user._id,
      category: finalCategory,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    if (currentBudget) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const totalMonthSpent = await Transaction.aggregate([
        {
          $match: {
            sender: req.user._id,
            category: finalCategory,
            type: { $in: ['DEBIT', 'TRANSFER', 'WITHDRAWAL'] },
            status: 'SUCCESS',
            createdAt: { $gte: monthStart }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const spentSoFar = totalMonthSpent[0]?.total || 0;
      if (spentSoFar >= currentBudget.limitAmount) {
        const budgetNotif = await Notification.create({
          userId: req.user._id,
          title: 'Budget Exceeded',
          message: `🔴 You have exceeded your monthly ${finalCategory} budget limit of ₹${currentBudget.limitAmount.toLocaleString('en-IN')}!`,
          type: 'BUDGET_WARNING'
        });
        emitToUser(req.user._id.toString(), 'notification_new', budgetNotif);
      }
    }

    res.status(200).json({
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN')} transferred to ${recipient.name} successfully!`,
      wallet: senderWallet,
      transaction,
      riskAssessment: {
        score: riskAssessment.riskScore,
        level: riskAssessment.riskLevel
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWallet,
  validateRecipient,
  addMoney,
  withdrawMoney,
  transferMoney
};
