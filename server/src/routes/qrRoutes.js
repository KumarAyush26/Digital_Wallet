const express = require('express');
const router = express.Router();
const {
  getQrPayload,
  verifyQrCode,
  payViaQr
} = require('../controllers/qrController');
const { protect } = require('../middleware/auth');
const { transactionLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.get('/payload', getQrPayload);
router.post('/verify', verifyQrCode);
router.post('/pay', transactionLimiter, payViaQr);

module.exports = router;
