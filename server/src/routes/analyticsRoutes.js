const express = require('express');
const router = express.Router();
const {
  getSpendingOverview,
  getMonthlyTrends,
  getCategoryBreakdown,
  getAiInsights
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', getSpendingOverview);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/ai-insights', getAiInsights);

module.exports = router;
