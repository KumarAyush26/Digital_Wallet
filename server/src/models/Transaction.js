const mongoose = require('mongoose');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, RISK_LEVELS, CATEGORIES } = require('../config/constants');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    senderWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null
    },
    receiverWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least ₹1']
    },
    fee: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'General Transfer'
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.SUCCESS
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    // Fraud Detection and Risk Scoring fields
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVELS),
      default: RISK_LEVELS.LOW
    },
    riskReasons: {
      type: [String],
      default: []
    },
    isReviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    paymentMethod: {
      type: String,
      enum: ['WALLET', 'UPI_QR', 'CARD_SIMULATION', 'NETBANKING_SIMULATION', 'PAYOUT_SIMULATION'],
      default: 'WALLET'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance querying & analytics
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
