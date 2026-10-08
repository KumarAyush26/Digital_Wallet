const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

/**
 * Generates rich AI Financial Insights and spending predictions for a user
 * @param {ObjectId} userId
 * @returns {Object} Comprehensive insights object
 */
const generateUserAiInsights = async (userId) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // 1. Fetch current month expenses
  const currentMonthTxns = await Transaction.find({
    sender: userId,
    type: { $in: ['DEBIT', 'TRANSFER', 'WITHDRAWAL'] },
    status: 'SUCCESS',
    createdAt: { $gte: currentMonthStart }
  });

  // 2. Fetch previous month expenses
  const prevMonthTxns = await Transaction.find({
    sender: userId,
    type: { $in: ['DEBIT', 'TRANSFER', 'WITHDRAWAL'] },
    status: 'SUCCESS',
    createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd }
  });

  // 3. Fetch current month income
  const currentMonthIncomeTxns = await Transaction.find({
    receiver: userId,
    type: { $in: ['CREDIT', 'TRANSFER'] },
    status: 'SUCCESS',
    createdAt: { $gte: currentMonthStart }
  });

  const currentSpend = currentMonthTxns.reduce((sum, t) => sum + t.amount, 0);
  const prevSpend = prevMonthTxns.reduce((sum, t) => sum + t.amount, 0);
  const currentIncome = currentMonthIncomeTxns.reduce((sum, t) => sum + t.amount, 0);

  // Spending percentage change
  let spendDeltaPct = 0;
  if (prevSpend > 0) {
    spendDeltaPct = Math.round(((currentSpend - prevSpend) / prevSpend) * 100);
  }

  // Category breakdown for current month
  const categorySpendMap = {};
  currentMonthTxns.forEach((txn) => {
    const cat = txn.category || 'General Transfer';
    categorySpendMap[cat] = (categorySpendMap[cat] || 0) + txn.amount;
  });

  // Category breakdown for previous month
  const prevCategorySpendMap = {};
  prevMonthTxns.forEach((txn) => {
    const cat = txn.category || 'General Transfer';
    prevCategorySpendMap[cat] = (prevCategorySpendMap[cat] || 0) + txn.amount;
  });

  // Category spikes analysis
  const categorySpikes = [];
  Object.keys(categorySpendMap).forEach((cat) => {
    const current = categorySpendMap[cat];
    const prev = prevCategorySpendMap[cat] || 0;
    if (prev > 0 && current > prev) {
      const pct = Math.round(((current - prev) / prev) * 100);
      if (pct >= 15 && current >= 1000) {
        categorySpikes.push({
          category: cat,
          currentAmount: current,
          prevAmount: prev,
          increasePercentage: pct,
          message: `Your ${cat} spending is ₹${current.toLocaleString('en-IN')}, which is ${pct}% higher than last month.`
        });
      }
    }
  });

  // Weekend vs Weekday analysis
  let weekendSpend = 0;
  let weekdaySpend = 0;
  currentMonthTxns.forEach((txn) => {
    const day = new Date(txn.createdAt).getDay(); // 0 = Sun, 6 = Sat
    if (day === 0 || day === 6) {
      weekendSpend += txn.amount;
    } else {
      weekdaySpend += txn.amount;
    }
  });

  const totalAnalyzed = weekendSpend + weekdaySpend;
  const weekendPct = totalAnalyzed > 0 ? Math.round((weekendSpend / totalAnalyzed) * 100) : 0;
  const potentialWeekendSavings = Math.round(weekendSpend * 0.2);

  // Active budgets check
  const activeBudgets = await Budget.find({
    userId,
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });

  const budgetAlerts = [];
  activeBudgets.forEach((budget) => {
    const spent = categorySpendMap[budget.category] || 0;
    const usagePct = Math.round((spent / budget.limitAmount) * 100);
    if (usagePct >= 100) {
      budgetAlerts.push({
        category: budget.category,
        limit: budget.limitAmount,
        spent,
        status: 'EXCEEDED',
        severity: 'critical',
        message: `🔴 ${budget.category} budget exceeded by ₹${(spent - budget.limitAmount).toLocaleString('en-IN')}!`
      });
    } else if (usagePct >= 80) {
      budgetAlerts.push({
        category: budget.category,
        limit: budget.limitAmount,
        spent,
        status: 'WARNING',
        severity: 'warning',
        message: `⚠️ You have utilized ${usagePct}% of your ${budget.category} monthly budget.`
      });
    }
  });

  // Generate actionable personalized recommendations
  const recommendations = [];

  if (spendDeltaPct > 20) {
    recommendations.push({
      id: 'high_spend_alert',
      type: 'warning',
      title: 'Spending Velocity Alert',
      description: `Your monthly expenses increased by ${spendDeltaPct}% compared to last month. Review non-essential categories to keep your cash flow healthy.`,
      action: 'Set Category Budgets'
    });
  } else if (spendDeltaPct < -10 && currentSpend > 0) {
    recommendations.push({
      id: 'good_saving_alert',
      type: 'success',
      title: 'Great Savings Progress!',
      description: `You've spent ${Math.abs(spendDeltaPct)}% less this month compared to last month. Consider stashing the extra into a Savings Goal pot!`,
      action: 'Add to Savings Goal'
    });
  }

  if (weekendPct > 35 && potentialWeekendSavings > 300) {
    recommendations.push({
      id: 'weekend_habit',
      type: 'tip',
      title: 'Weekend Spending Optimization',
      description: `You spend ${weekendPct}% of your funds on weekends (₹${weekendSpend.toLocaleString('en-IN')}). Trimming 20% on weekend discretionary dining could save you ~₹${potentialWeekendSavings.toLocaleString('en-IN')}/month.`,
      action: 'View Weekend Transactions'
    });
  }

  if (categorySpikes.length > 0) {
    const topSpike = categorySpikes[0];
    recommendations.push({
      id: `spike_${topSpike.category}`,
      type: 'insight',
      title: `${topSpike.category} Surge`,
      description: `${topSpike.message} Try setting a monthly limit of ₹${Math.round(topSpike.prevAmount * 1.1).toLocaleString('en-IN')}.`,
      action: 'Set Budget'
    });
  }

  if (currentIncome > 0 && currentSpend < currentIncome) {
    const netSavings = currentIncome - currentSpend;
    const savingsRate = Math.round((netSavings / currentIncome) * 100);
    recommendations.push({
      id: 'savings_rate',
      type: 'success',
      title: `Healthy ${savingsRate}% Net Savings Rate`,
      description: `You've retained ₹${netSavings.toLocaleString('en-IN')} (${savingsRate}%) of this month's incoming money.`,
      action: 'Grow Savings'
    });
  }

  return {
    summary: {
      currentMonthSpend: currentSpend,
      previousMonthSpend: prevSpend,
      spendDeltaPercentage: spendDeltaPct,
      currentMonthIncome: currentIncome,
      netMonthlySavings: Math.max(0, currentIncome - currentSpend),
      weekendSpend,
      weekdaySpend,
      weekendPercentage: weekendPct,
      potentialWeekendSavings
    },
    categoryBreakdown: categorySpendMap,
    categorySpikes,
    budgetAlerts,
    recommendations
  };
};

module.exports = { generateUserAiInsights };
