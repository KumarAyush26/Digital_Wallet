const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Wallet balance cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    totalSent: {
      type: Number,
      default: 0
    },
    totalReceived: {
      type: Number,
      default: 0
    },
    dailyLimit: {
      type: Number,
      default: 100000
    },
    monthlyLimit: {
      type: Number,
      default: 500000
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'FROZEN', 'CLOSED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Wallet', walletSchema);
