const Transaction = require('../models/Transaction');
const { RISK_LEVELS } = require('../config/constants');

/**
 * Evaluates fraud risk score (0-100) and risk level for an outgoing transaction
 * @param {ObjectId} senderId - ID of user sending money
 * @param {ObjectId} receiverId - ID of user receiving money
 * @param {Number} amount - Amount being transferred
 * @returns {Object} { riskScore, riskLevel, riskReasons, isFlagged }
 */
const evaluateTransactionRisk = async (senderId, receiverId, amount) => {
  let riskScore = 0;
  const riskReasons = [];

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    // 1. Calculate sender's 30-day average transaction amount
    const pastTransactions = await Transaction.find({
      sender: senderId,
      status: 'SUCCESS',
      createdAt: { $gte: thirtyDaysAgo }
    }).select('amount receiver createdAt');

    if (pastTransactions.length > 0) {
      const totalPastAmount = pastTransactions.reduce((acc, txn) => acc + txn.amount, 0);
      const avgAmount = totalPastAmount / pastTransactions.length;

      // Unusually high amount compared to average
      if (amount >= avgAmount * 5 && amount >= 5000) {
        riskScore += 40;
        riskReasons.push(`Transfer amount (₹${amount}) is >5x higher than 30-day historical average (₹${Math.round(avgAmount)})`);
      } else if (amount >= avgAmount * 3 && amount >= 3000) {
        riskScore += 20;
        riskReasons.push(`Transfer amount (₹${amount}) is >3x higher than historical average`);
      }
    } else {
      // New account or no past transactions
      if (amount >= 20000) {
        riskScore += 25;
        riskReasons.push(`High transfer amount on an account with no previous transaction history`);
      }
    }

    // 2. High single-transfer threshold checks
    if (amount >= 50000) {
      riskScore += 35;
      riskReasons.push(`High single-transfer amount exceeding ₹50,000 threshold`);
    } else if (amount >= 25000) {
      riskScore += 15;
      riskReasons.push(`Significant transfer volume (₹${amount})`);
    }

    // 3. Check recipient familiarity (Have they sent to this receiver before?)
    if (receiverId) {
      const previousToReceiver = pastTransactions.filter(
        (txn) => txn.receiver && txn.receiver.toString() === receiverId.toString()
      );

      if (previousToReceiver.length === 0 && amount >= 10000) {
        riskScore += 20;
        riskReasons.push(`First-time high-value transfer to an unfamiliar recipient`);
      }
    }

    // 4. Velocity check (Rapid consecutive transfers)
    const recentBurst = await Transaction.countDocuments({
      sender: senderId,
      createdAt: { $gte: twoMinutesAgo }
    });

    if (recentBurst >= 3) {
      riskScore += 30;
      riskReasons.push(`High transaction velocity: ${recentBurst} transactions in the last 2 minutes`);
    }

    // Normalize risk score to 100 max
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine Risk Level
    let riskLevel = RISK_LEVELS.LOW;
    if (riskScore >= 60) {
      riskLevel = RISK_LEVELS.HIGH;
    } else if (riskScore >= 30) {
      riskLevel = RISK_LEVELS.MEDIUM;
    }

    const isFlagged = riskLevel === RISK_LEVELS.HIGH;

    return {
      riskScore,
      riskLevel,
      riskReasons,
      isFlagged
    };
  } catch (error) {
    console.error('Error in fraud risk evaluation:', error);
    return {
      riskScore: 0,
      riskLevel: RISK_LEVELS.LOW,
      riskReasons: [],
      isFlagged: false
    };
  }
};

module.exports = { evaluateTransactionRisk };
