const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  requestMoney
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/request-money', requestMoney);

module.exports = router;
