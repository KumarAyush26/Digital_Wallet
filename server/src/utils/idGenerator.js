const crypto = require('crypto');

/**
 * Generate a unique transaction ID in format TXN_YYYYMMDD_XXXXXX
 */
const generateTxnId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN_${dateStr}_${randomHex}`;
};

/**
 * Generate unique wallet account number in format WLT_XXXXXXXX
 */
const generateWalletAccountNo = () => {
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `WLT_${randomDigits}`;
};

/**
 * Generate UPI ID from name or email
 * e.g., "kumar" -> "kumar@wallet"
 */
const generateUpiId = (name, email) => {
  let base = '';
  if (name) {
    base = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  if (!base && email) {
    base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  if (!base) {
    base = 'user' + Math.floor(1000 + Math.random() * 9000);
  }
  return `${base}@wallet`;
};

module.exports = {
  generateTxnId,
  generateWalletAccountNo,
  generateUpiId
};
