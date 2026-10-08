const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Contact = require('../models/Contact');
const Notification = require('../models/Notification');
const { generateWalletAccountNo, generateTxnId } = require('./idGenerator');
const { connectDB, disconnectDB } = require('../config/db');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await SavingsGoal.deleteMany({});
    await Contact.deleteMany({});
    await Notification.deleteMany({});

    console.log('🧹 Old data wiped cleanly.');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@wallet',
      phone: '9999999999',
      password: 'admin123',
      upiId: 'admin@wallet',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'
    });

    const adminWallet = await Wallet.create({
      userId: adminUser._id,
      accountNumber: 'WLT_ADMIN01',
      balance: 500000,
      currency: 'INR',
      status: 'ACTIVE'
    });

    // 2. Create Regular Demo Users
    const kumar = await User.create({
      name: 'Kumar Sharma',
      email: 'kumar@gmail.com',
      phone: '9876543210',
      password: 'kumar123',
      upiId: 'kumar@wallet',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kumar'
    });

    const kumarWallet = await Wallet.create({
      userId: kumar._id,
      accountNumber: generateWalletAccountNo(),
      balance: 12450,
      totalSent: 18500,
      totalReceived: 35000,
      currency: 'INR',
      status: 'ACTIVE'
    });

    const rahul = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@gmail.com',
      phone: '9876543211',
      password: 'rahul123',
      upiId: 'rahul@wallet',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul'
    });

    const rahulWallet = await Wallet.create({
      userId: rahul._id,
      accountNumber: generateWalletAccountNo(),
      balance: 5000,
      totalSent: 4200,
      totalReceived: 9200,
      currency: 'INR',
      status: 'ACTIVE'
    });

    const amit = await User.create({
      name: 'Amit Patel',
      email: 'amit@gmail.com',
      phone: '9876543212',
      password: 'amit123',
      upiId: 'amit@wallet',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit'
    });

    const amitWallet = await Wallet.create({
      userId: amit._id,
      accountNumber: generateWalletAccountNo(),
      balance: 8500,
      currency: 'INR',
      status: 'ACTIVE'
    });

    const priya = await User.create({
      name: 'Priya Nair',
      email: 'priya@gmail.com',
      phone: '9876543213',
      password: 'priya123',
      upiId: 'priya@wallet',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya'
    });

    const priyaWallet = await Wallet.create({
      userId: priya._id,
      accountNumber: generateWalletAccountNo(),
      balance: 15000,
      currency: 'INR',
      status: 'ACTIVE'
    });

    const suspiciousUser = await User.create({
      name: 'Unknown Operator',
      email: 'suspicious@gmail.com',
      phone: '9876543299',
      password: 'test1234',
      upiId: 'suspicious@wallet',
      role: 'user',
      isFrozen: false,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Suspicious'
    });

    const suspiciousWallet = await Wallet.create({
      userId: suspiciousUser._id,
      accountNumber: generateWalletAccountNo(),
      balance: 100000,
      currency: 'INR',
      status: 'ACTIVE'
    });

    console.log('👤 Users & Wallets created successfully.');

    // 3. Create Favorite Contacts for Kumar
    await Contact.create([
      { userId: kumar._id, contactUserId: rahul._id, nickname: 'Rahul (Work)', isFavorite: true },
      { userId: kumar._id, contactUserId: amit._id, nickname: 'Amit (Roommate)', isFavorite: true },
      { userId: kumar._id, contactUserId: priya._id, nickname: 'Priya', isFavorite: true }
    ]);

    // 4. Create Current Month Budgets for Kumar
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await Budget.create([
      { userId: kumar._id, category: 'Food & Dining', limitAmount: 5000, month: currentMonth, year: currentYear },
      { userId: kumar._id, category: 'Shopping', limitAmount: 4000, month: currentMonth, year: currentYear },
      { userId: kumar._id, category: 'Bills & Utilities', limitAmount: 3000, month: currentMonth, year: currentYear },
      { userId: kumar._id, category: 'Entertainment', limitAmount: 2000, month: currentMonth, year: currentYear }
    ]);

    // 5. Create Savings Goals for Kumar
    await SavingsGoal.create([
      {
        userId: kumar._id,
        title: 'Emergency Fund',
        targetAmount: 50000,
        currentAmount: 18500,
        category: 'Safety Net',
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        color: '#10B981'
      },
      {
        userId: kumar._id,
        title: 'MacBook Pro M3',
        targetAmount: 120000,
        currentAmount: 45000,
        category: 'Gadgets',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        color: '#6366F1'
      },
      {
        userId: kumar._id,
        title: 'Goa Weekend Trip',
        targetAmount: 15000,
        currentAmount: 12000,
        category: 'Travel',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        color: '#F59E0B'
      }
    ]);

    // 6. Create Historical Transactions for Kumar across multiple categories and dates
    const dayMs = 24 * 60 * 60 * 1000;
    const sampleTransactions = [
      {
        transactionId: generateTxnId(),
        sender: kumar._id,
        receiver: rahul._id,
        senderWallet: kumarWallet._id,
        receiverWallet: rahulWallet._id,
        amount: 500,
        type: 'TRANSFER',
        category: 'Food & Dining',
        status: 'SUCCESS',
        description: 'Sent to Rahul Verma (rahul@wallet)',
        note: 'Team lunch split',
        createdAt: new Date(Date.now() - 1 * dayMs)
      },
      {
        transactionId: generateTxnId(),
        sender: amit._id,
        receiver: kumar._id,
        senderWallet: amitWallet._id,
        receiverWallet: kumarWallet._id,
        amount: 2000,
        type: 'TRANSFER',
        category: 'Salary & Income',
        status: 'SUCCESS',
        description: 'Received from Amit Patel (amit@wallet)',
        note: 'Apartment utility reimbursement',
        createdAt: new Date(Date.now() - 2 * dayMs)
      },
      {
        transactionId: generateTxnId(),
        receiver: kumar._id,
        receiverWallet: kumarWallet._id,
        amount: 5000,
        type: 'CREDIT',
        category: 'Wallet Top-up',
        status: 'SUCCESS',
        description: 'Wallet top-up via Card',
        paymentMethod: 'CARD_SIMULATION',
        createdAt: new Date(Date.now() - 3 * dayMs)
      },
      {
        transactionId: generateTxnId(),
        sender: kumar._id,
        senderWallet: kumarWallet._id,
        amount: 1200,
        type: 'DEBIT',
        category: 'Bills & Utilities',
        status: 'SUCCESS',
        description: 'Electricity Bill Payment - BSES',
        note: 'Home Power Bill',
        createdAt: new Date(Date.now() - 4 * dayMs)
      },
      {
        transactionId: generateTxnId(),
        sender: kumar._id,
        receiver: priya._id,
        senderWallet: kumarWallet._id,
        receiverWallet: priyaWallet._id,
        amount: 750,
        type: 'TRANSFER',
        category: 'Entertainment',
        status: 'SUCCESS',
        description: 'QR Payment to Priya Nair (priya@wallet)',
        note: 'Movie tickets IMAX',
        paymentMethod: 'UPI_QR',
        createdAt: new Date(Date.now() - 6 * dayMs)
      },
      {
        transactionId: generateTxnId(),
        sender: kumar._id,
        senderWallet: kumarWallet._id,
        amount: 3200,
        type: 'DEBIT',
        category: 'Food & Dining',
        status: 'SUCCESS',
        description: 'Grocery Superstore - Spices & Veggies',
        note: 'Monthly pantry stock',
        createdAt: new Date(Date.now() - 8 * dayMs)
      },
      {
        transactionId: generateTxnId(),
        sender: kumar._id,
        senderWallet: kumarWallet._id,
        amount: 2500,
        type: 'DEBIT',
        category: 'Shopping',
        status: 'SUCCESS',
        description: 'Online Apparel Store - Zara Order',
        note: 'Weekend shopping',
        createdAt: new Date(Date.now() - 10 * dayMs)
      },
      {
        transactionId: generateTxnId(),
        sender: kumar._id,
        senderWallet: kumarWallet._id,
        amount: 800,
        type: 'WITHDRAWAL',
        category: 'General Transfer',
        status: 'SUCCESS',
        description: 'Withdrawal to Bank A/C ending in 8492',
        paymentMethod: 'PAYOUT_SIMULATION',
        createdAt: new Date(Date.now() - 12 * dayMs)
      },
      // Previous Month Transactions for AI Analysis Comparison
      {
        transactionId: generateTxnId(),
        sender: kumar._id,
        senderWallet: kumarWallet._id,
        amount: 2580,
        type: 'DEBIT',
        category: 'Food & Dining',
        status: 'SUCCESS',
        description: 'Supermarket & Cafe',
        createdAt: new Date(Date.now() - 35 * dayMs)
      },
      {
        transactionId: generateTxnId(),
        sender: kumar._id,
        senderWallet: kumarWallet._id,
        amount: 1800,
        type: 'DEBIT',
        category: 'Shopping',
        status: 'SUCCESS',
        description: 'Electronics & Accessories',
        createdAt: new Date(Date.now() - 38 * dayMs)
      },
      // Flagged Suspicious Transaction for Admin Review Demo
      {
        transactionId: 'TXN_SUSP_982411',
        sender: suspiciousUser._id,
        receiver: priya._id,
        senderWallet: suspiciousWallet._id,
        receiverWallet: priyaWallet._id,
        amount: 45000,
        type: 'TRANSFER',
        category: 'General Transfer',
        status: 'SUCCESS',
        description: 'High-value single transfer from new account',
        note: 'Urgent offshore transfer',
        riskScore: 85,
        riskLevel: 'HIGH',
        riskReasons: [
          'Transfer amount (₹45,000) exceeds single-transfer safety threshold',
          'First-time high-value transfer to unfamiliar recipient',
          'Unusual rapid transfer pattern on fresh account'
        ],
        isReviewed: false,
        createdAt: new Date(Date.now() - 1 * dayMs)
      }
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log('💳 Transactions created successfully.');

    // 7. Create Demo In-App Notifications for Kumar
    await Notification.create([
      {
        userId: kumar._id,
        title: 'Payment Successful',
        message: '₹500 sent to Rahul Verma (rahul@wallet).',
        type: 'TRANSFER_SENT',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * dayMs)
      },
      {
        userId: kumar._id,
        title: 'Money Received',
        message: 'You received ₹2,000 from Amit Patel (amit@wallet).',
        type: 'TRANSFER_RECEIVED',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * dayMs)
      },
      {
        userId: kumar._id,
        title: 'Wallet Credited',
        message: '₹5,000 added to your wallet successfully.',
        type: 'WALLET_CREDITED',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * dayMs)
      }
    ]);

    console.log('🔔 Notifications created.');
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

// If run directly via command line
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedDatabase };
