const mongoose = require('mongoose');

const scheduledTransferSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientUpi: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least ₹1']
    },
    category: {
      type: String,
      default: 'Bills & Utilities'
    },
    frequency: {
      type: String,
      enum: ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'],
      default: 'ONCE'
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'EXECUTED', 'CANCELLED'],
      default: 'SCHEDULED'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ScheduledTransfer', scheduledTransferSchema);
