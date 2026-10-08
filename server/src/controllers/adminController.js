const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { emitToUser } = require('../services/socketService');

// @desc Get platform admin executive KPI metrics
// @route GET /api/admin/stats
// @access Private (Admin Only)
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const frozenUsers = await User.countDocuments({ isFrozen: true });
    const activeUsers = totalUsers - frozenUsers;

    const totalTransactions = await Transaction.countDocuments();
    const flaggedTransactions = await Transaction.countDocuments({ riskLevel: 'HIGH' });

    // Total Platform Volume
    const totalVolumeAgg = await Transaction.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalVolume = totalVolumeAgg[0]?.total || 0;

    // Today's 24h Volume
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayVolumeAgg = await Transaction.aggregate([
      { $match: { status: 'SUCCESS', createdAt: { $gte: twentyFourHoursAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const todayVolume = todayVolumeAgg[0]?.total || 0;
    const todayTxnCount = todayVolumeAgg[0]?.count || 0;

    // Total circulating wallet balance
    const totalCirculatingAgg = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);
    const totalCirculating = totalCirculatingAgg[0]?.totalBalance || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        frozenUsers,
        totalTransactions,
        flaggedTransactions,
        totalVolume,
        todayVolume,
        todayTxnCount,
        totalCirculating
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all users with wallets & search
// @route GET /api/admin/users
// @access Private (Admin Only)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search, status } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const query = {};
    if (status === 'frozen') query.isFrozen = true;
    if (status === 'active') query.isFrozen = false;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { upiId: searchRegex }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-twoFactorOtp -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    // Attach wallet info
    const userIds = users.map((u) => u._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } }).lean();
    const walletMap = {};
    wallets.forEach((w) => {
      walletMap[w.userId.toString()] = w;
    });

    const enrichedUsers = users.map((u) => ({
      ...u,
      wallet: walletMap[u._id.toString()] || { balance: 0, accountNumber: 'N/A', status: 'ACTIVE' }
    }));

    res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      users: enrichedUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc Freeze or Unfreeze user account
// @route PATCH /api/admin/users/:id/freeze
// @access Private (Admin Only)
const toggleFreezeUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot freeze an administrator account.' });
    }

    user.isFrozen = !user.isFrozen;
    await user.save();

    // Update wallet status
    await Wallet.findOneAndUpdate(
      { userId: user._id },
      { status: user.isFrozen ? 'FROZEN' : 'ACTIVE' }
    );

    // Notify user in real-time
    const notif = await Notification.create({
      userId: user._id,
      title: user.isFrozen ? 'Account Frozen' : 'Account Re-activated',
      message: user.isFrozen
        ? 'Your account has been temporarily frozen by administrators for compliance or security review.'
        : 'Your account restrictions have been lifted. You have full access to your digital wallet.',
      type: 'SYSTEM'
    });

    emitToUser(user._id.toString(), 'notification_new', notif);

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isFrozen ? 'frozen' : 'unfrozen'}.`,
      isFrozen: user.isFrozen
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete user account
// @route DELETE /api/admin/users/:id
// @access Private (Admin Only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an administrator account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    await Wallet.findOneAndDelete({ userId: req.params.id });

    res.status(200).json({
      success: true,
      message: `User ${user.name} and associated wallet deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all platform transactions with risk inspection
// @route GET /api/admin/transactions
// @access Private (Admin Only)
const getAllTransactionsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, riskLevel, status, search } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const query = {};
    if (riskLevel) query.riskLevel = riskLevel;
    if (status) query.status = status;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ transactionId: searchRegex }, { description: searchRegex }, { note: searchRegex }];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('sender', 'name email upiId phone isFrozen')
      .populate('receiver', 'name email upiId phone isFrozen')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc Review & approve or dismiss flagged transaction
// @route PATCH /api/admin/transactions/:id/review
// @access Private (Admin Only)
const reviewTransaction = async (req, res, next) => {
  try {
    const { action } = req.body; // 'APPROVE' or 'DISMISS'
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    transaction.isReviewed = true;
    transaction.reviewedBy = req.user._id;

    if (action === 'APPROVE') {
      transaction.riskLevel = 'LOW';
      transaction.riskReasons.push('Reviewed and marked as legitimate by administrator');
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      message: `Transaction review complete. Action: ${action}`,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleFreezeUser,
  deleteUser,
  getAllTransactionsAdmin,
  reviewTransaction
};
