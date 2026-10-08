const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a savings goal title'],
      trim: true
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide a target amount'],
      min: [500, 'Target amount must be at least ₹500']
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    category: {
      type: String,
      default: 'General Savings'
    },
    targetDate: {
      type: Date
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: '#10B981' // emerald/teal accent
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
