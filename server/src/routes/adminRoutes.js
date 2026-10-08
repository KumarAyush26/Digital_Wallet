const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleFreezeUser,
  deleteUser,
  getAllTransactionsAdmin,
  reviewTransaction
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');

router.use(protect);
router.use(authorizeAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/freeze', toggleFreezeUser);
router.delete('/users/:id', deleteUser);
router.get('/transactions', getAllTransactionsAdmin);
router.patch('/transactions/:id/review', reviewTransaction);

module.exports = router;
