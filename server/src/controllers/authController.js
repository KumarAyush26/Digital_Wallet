const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { generateWalletAccountNo, generateUpiId } = require('../utils/idGenerator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_digital_wallet_production_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc Register new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check if user already exists
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const phoneExists = await User.findOne({ phone: phone.trim() });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'An account with this phone number already exists.' });
    }

    // Generate unique UPI ID
    let upiId = generateUpiId(name, email);
    let upiCount = 1;
    while (await User.findOne({ upiId })) {
      upiId = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}${upiCount}@wallet`;
      upiCount++;
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      upiId,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    });

    // Create associated Wallet
    const wallet = await Wallet.create({
      userId: user._id,
      accountNumber: generateWalletAccountNo(),
      balance: 1000, // ₹1,000 complimentary welcome bonus
      currency: 'INR',
      status: 'ACTIVE'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! ₹1,000 welcome bonus credited.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiId: user.upiId,
        role: user.role,
        avatar: user.avatar,
        isFrozen: user.isFrozen,
        twoFactorEnabled: user.twoFactorEnabled,
        biometricEnabled: user.biometricEnabled
      },
      wallet: {
        accountNumber: wallet.accountNumber,
        balance: wallet.balance,
        currency: wallet.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanIdentifier = email.toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { upiId: cleanIdentifier }
      ]
    }).select('+password +twoFactorOtp +twoFactorOtpExpires');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isFrozen) {
      return res.status(403).json({
        success: false,
        message: 'Account is frozen due to security policies. Please contact support.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 2FA Check if enabled
    if (user.twoFactorEnabled) {
      if (!otp) {
        // Generate simulated OTP and send response requesting OTP
        const simulatedOtp = '123456';
        user.twoFactorOtp = simulatedOtp;
        user.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
          success: true,
          requireTwoFactor: true,
          message: 'Two-Factor Authentication OTP required. (Demo OTP is 123456)'
        });
      }

      if (otp !== user.twoFactorOtp && otp !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid 2FA OTP code.' });
      }

      user.twoFactorOtp = undefined;
      user.twoFactorOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    // Fetch user wallet
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        accountNumber: generateWalletAccountNo(),
        balance: 1000
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiId: user.upiId,
        role: user.role,
        avatar: user.avatar,
        isFrozen: user.isFrozen,
        twoFactorEnabled: user.twoFactorEnabled,
        biometricEnabled: user.biometricEnabled
      },
      wallet: {
        accountNumber: wallet.accountNumber,
        balance: wallet.balance,
        currency: wallet.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user profile
// @route GET /api/auth/profile
// @access Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ userId: req.user._id });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiId: user.upiId,
        role: user.role,
        avatar: user.avatar,
        isFrozen: user.isFrozen,
        twoFactorEnabled: user.twoFactorEnabled,
        biometricEnabled: user.biometricEnabled,
        createdAt: user.createdAt
      },
      wallet
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, twoFactorEnabled, biometricEnabled, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (typeof twoFactorEnabled === 'boolean') user.twoFactorEnabled = twoFactorEnabled;
    if (typeof biometricEnabled === 'boolean') user.biometricEnabled = biometricEnabled;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current password to update password.' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiId: user.upiId,
        role: user.role,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled,
        biometricEnabled: user.biometricEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Forgot password (Simulated OTP)
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    const resetOtp = '654321'; // Demo simulated OTP
    user.resetPasswordToken = crypto.createHash('sha256').update(resetOtp).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset OTP generated. (Demo OTP is 654321)',
      demoOtp: resetOtp
    });
  } catch (error) {
    next(error);
  }
};

// @desc Reset password with OTP
// @route POST /api/auth/reset-password
// @access Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP, and new password.' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    if (otp !== '654321') {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
};
