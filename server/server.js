const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./src/config/db');
const { initSocket } = require('./src/services/socketService');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');
const { seedDatabase } = require('./src/utils/seed');
const User = require('./src/models/User');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const qrRoutes = require('./src/routes/qrRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const scheduledTransferRoutes = require('./src/routes/scheduledTransferRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});
initSocket(io);

// Security & Body parsing middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global rate limiter
app.use('/api', apiLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Digital Wallet Core API',
    uptime: process.uptime()
  });
});

// Ensure DB is connected for serverless invocations
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scheduled-transfers', scheduledTransferRoutes);

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      await connectDB();

      // Auto seed demo data if no users exist
      const userCount = await User.countDocuments();

      if (userCount === 0) {
        console.log('⚡ Empty database detected. Auto-seeding demo users and transactions...');
        await seedDatabase();
      }

      server.listen(PORT, () => {
        console.log(
          `🚀 Digital Wallet Backend Server running on port ${PORT}`
        );
        console.log(
          `🌐 Health check endpoint: http://localhost:${PORT}/api/health`
        );
      });
    } catch (err) {
      console.error('Fatal Server Startup Error:', err);
    }
  })();
}

module.exports = app;