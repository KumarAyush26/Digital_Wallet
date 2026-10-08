const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { generateTxnId } = require('../utils/idGenerator');
const { evaluateTransactionRisk } = require('../services/fraudDetectionService');
const { emitToUser, emitToAdmin } = require('../services/socketService');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../config/constants');

// @desc Generate personal QR code payload
// @route GET /api/qr/payload
// @access Private
const getQrPayload = async (req, res, next) => {
  try {
    const { amount } = req.query;
    const user = req.user;

    let payload = `wallet://pay?upi=${user.upiId}&name=${encodeURIComponent(user.name)}`;
    if (amount && Number(amount) > 0) {
      payload += `&amount=${Number(amount)}`;
    }

    res.status(200).json({
      success: true,
      payload,
      upiId: user.upiId,
      name: user.name,
      avatar: user.avatar
    });
  } catch (error) {
    next(error);
  }
};

// @desc Parse and verify scanned QR code payload
// @route POST /api/qr/verify
// @access Private
const verifyQrCode = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid QR code data.' });
    }

    let upiId = '';
    let prefilledAmount = 0;
    let name = '';

    // Handle format: wallet://pay?upi=kumar@wallet&name=Kumar&amount=500
    if (qrData.startsWith('wallet://pay?')) {
      const urlParams = new URLSearchParams(qrData.replace('wallet://pay?', ''));
      upiId = urlParams.get('upi') || '';
      name = urlParams.get('name') || '';
      prefilledAmount = Number(urlParams.get('amount')) || 0;
    } else if (qrData.includes('@')) {
      // Plain UPI ID format e.g. "kumar@wallet"
      upiId = qrData.trim();
    } else {
      return res.status(400).json({ success: false, message: 'Unrecognized QR code format. Please scan a valid Wallet QR code.' });
    }

    const recipient = await User.findOne({ upiId: upiId.toLowerCase().trim() });

    if (!recipient) {
      return res.status(404).json({ success: false, message: `No active account found for UPI ID: ${upiId}` });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot scan and pay yourself.' });
    }

    if (recipient.isFrozen) {
      return res.status(400).json({ success: false, message: 'Recipient account is temporarily frozen.' });
    }

    res.status(200).json({
      success: true,
      recipient: {
        _id: recipient._id,
        name: recipient.name,
        upiId: recipient.upiId,
        avatar: recipient.avatar
      },
      prefilledAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc Pay via QR Scan confirmation
// @route POST /api/qr/pay
// @access Private
const payViaQr = async (req, res, next) => {
  try {
    const { recipientUpi, amount, category, note } = req.body;
    const numAmount = Number(amount);

    if (!recipientUpi || !numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid recipient UPI and amount.' });
    }

    const recipient = await User.findOne({ upiId: recipientUpi.toLowerCase().trim() });

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot transfer money to yourself.' });
    }

    if (recipient.isFrozen) {
      return res.status(400).json({ success: false, message: 'Recipient account is temporarily restricted.' });
    }

    // Evaluate Risk
    const riskAssessment = await evaluateTransactionRisk(req.user._id, recipient._id, numAmount);

    // Atomic Sender Deduction
    const senderWallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id, balance: { $gte: numAmount } },
      { $inc: { balance: -numAmount, totalSent: numAmount } },
      { new: true }
    );

    if (!senderWallet) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance for QR payment.' });
    }

    // Atomic Receiver Credit
    const receiverWallet = await Wallet.findOneAndUpdate(
      { userId: recipient._id },
      { $inc: { balance: numAmount, totalReceived: numAmount } },
      { new: true, upsert: true }
    );

    const txnId = generateTxnId();

    const transaction = await Transaction.create({
      transactionId: txnId,
      sender: req.user._id,
      receiver: recipient._id,
      senderWallet: senderWallet._id,
      receiverWallet: receiverWallet._id,
      amount: numAmount,
      type: TRANSACTION_TYPES.TRANSFER,
      category: category || 'Shopping',
      status: TRANSACTION_STATUS.SUCCESS,
      description: `QR Payment to ${recipient.name} (${recipient.upiId})`,
      note: note || 'Scanned QR Code',
      paymentMethod: 'UPI_QR',
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      riskReasons: riskAssessment.riskReasons
    });

    const senderNotif = await Notification.create({
      userId: req.user._id,
      title: 'QR Payment Successful',
      message: `₹${numAmount.toLocaleString('en-IN')} paid to ${recipient.name} via QR scan.`,
      type: 'TRANSFER_SENT',
      metadata: { transactionId: txnId, amount: numAmount }
    });

    const receiverNotif = await Notification.create({
      userId: recipient._id,
      title: 'QR Payment Received',
      message: `You received ₹${numAmount.toLocaleString('en-IN')} via QR Code from ${req.user.name}.`,
      type: 'TRANSFER_RECEIVED',
      metadata: { transactionId: txnId, amount: numAmount }
    });

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

    res.status(200).json({
      success: true,
      message: `QR Payment of ₹${numAmount.toLocaleString('en-IN')} to ${recipient.name} confirmed!`,
      wallet: senderWallet,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQrPayload,
  verifyQrCode,
  payViaQr
};
