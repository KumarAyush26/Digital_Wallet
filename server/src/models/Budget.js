const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true
    },
    limitAmount: {
      type: Number,
      required: [true, 'Please specify a monthly budget limit'],
      min: [100, 'Budget limit must be at least ₹100']
    },
    month: {
      type: Number, // 1 to 12
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
