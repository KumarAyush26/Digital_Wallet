const express = require('express');
const router = express.Router();
const {
  getWallet,
  validateRecipient,
  addMoney,
  withdrawMoney,
  transferMoney
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
const { transactionLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.get('/', getWallet);
router.post('/validate-recipient', validateRecipient);
router.post('/add-money', addMoney);
router.post('/withdraw', withdrawMoney);
router.post('/transfer', transactionLimiter, transferMoney);

module.exports = router;
