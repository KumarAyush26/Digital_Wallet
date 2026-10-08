const express = require('express');
const router = express.Router();
const {
  getBudgets,
  setBudget,
  getSavingsGoals,
  createSavingsGoal,
  contributeSavingsGoal,
  withdrawFromSavingsGoal
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBudgets);
router.post('/', setBudget);
router.get('/goals', getSavingsGoals);
router.post('/goals', createSavingsGoal);
router.post('/goals/:id/contribute', contributeSavingsGoal);
router.post('/goals/:id/withdraw', withdrawFromSavingsGoal);

module.exports = router;
