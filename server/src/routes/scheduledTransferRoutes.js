const express = require('express');
const router = express.Router();
const {
  getScheduledTransfers,
  createScheduledTransfer,
  cancelScheduledTransfer
} = require('../controllers/scheduledTransferController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getScheduledTransfers);
router.post('/', createScheduledTransfer);
router.delete('/:id', cancelScheduledTransfer);

module.exports = router;
