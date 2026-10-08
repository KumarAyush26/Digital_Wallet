module.exports = {
  TRANSACTION_TYPES: {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT',
    TRANSFER: 'TRANSFER',
    WITHDRAWAL: 'WITHDRAWAL',
    REQUEST: 'REQUEST'
  },
  TRANSACTION_STATUS: {
    SUCCESS: 'SUCCESS',
    PENDING: 'PENDING',
    FAILED: 'FAILED',
    FLAGGED: 'FLAGGED'
  },
  CATEGORIES: [
    'Food & Dining',
    'Shopping',
    'Bills & Utilities',
    'Transport',
    'Entertainment',
    'Investments',
    'Healthcare',
    'Salary & Income',
    'Wallet Top-up',
    'General Transfer'
  ],
  RISK_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
  },
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin'
  }
};
