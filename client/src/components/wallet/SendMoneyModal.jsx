import React, { useState, useEffect } from 'react';
import { UserCheck, AlertCircle, ArrowRight, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useWallet } from '../../context/WalletContext';
import { walletService } from '../../services/walletService';
import { formatCurrency } from '../../utils/formatters';

export const SendMoneyModal = ({ isOpen, onClose, initialRecipient = null }) => {
  const { wallet, transferMoney } = useWallet();
  const [identifier, setIdentifier] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [validating, setValidating] = useState(false);
  const [valError, setValError] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General Transfer');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Food & Dining',
    'Shopping',
    'Bills & Utilities',
    'Transport',
    'Entertainment',
    'Investments',
    'Healthcare',
    'General Transfer'
  ];

  useEffect(() => {
    if (initialRecipient) {
      setRecipient(initialRecipient);
      setIdentifier(initialRecipient.upiId || initialRecipient.email || '');
    } else {
      setRecipient(null);
      setIdentifier('');
    }
    setAmount('');
    setNote('');
    setValError('');
  }, [initialRecipient, isOpen]);

  // Live lookup recipient when user stops typing
  const handleValidateRecipient = async (idToLookup) => {
    const term = idToLookup || identifier;
    if (!term || term.trim().length < 3) return;

    try {
      setValidating(true);
      setValError('');
      const res = await walletService.validateRecipient(term.trim());
      if (res.success && res.recipient) {
        setRecipient(res.recipient);
      }
    } catch (err) {
      setRecipient(null);
      setValError(err.response?.data?.message || 'Recipient not found.');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0 || !recipient) return;

    if (num > (wallet?.balance || 0)) {
      return;
    }

    try {
      setLoading(true);
      await transferMoney({
        recipientId: recipient._id,
        recipientUpi: recipient.upiId,
        amount: num,
        category,
        note
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isExceeded = Number(amount || 0) > (wallet?.balance || 0);
  const isHighRiskAmount = Number(amount || 0) >= 25000;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Money Instantly">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Input / Lookup */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Recipient UPI ID, Email, or Phone
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (recipient) setRecipient(null);
              }}
              onBlur={() => handleValidateRecipient()}
              placeholder="e.g. rahul@wallet or 9876543211"
              className="flex-1 px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => handleValidateRecipient()}
              disabled={validating || !identifier}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors disabled:opacity-50"
            >
              {validating ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {valError && (
            <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {valError}
            </p>
          )}

          {/* Verified Payee Preview Pill */}
          {recipient && (
            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between animate-fade-in">
              <div className="flex items-center space-x-3">
                {recipient.avatar ? (
                  <img src={recipient.avatar} alt={recipient.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                    {recipient.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{recipient.name}</p>
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{recipient.upiId}</p>
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Amount (₹)
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Wallet Balance: <strong className="text-slate-900 dark:text-white">{formatCurrency(wallet?.balance || 0)}</strong>
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              min="1"
              max={wallet?.balance || 0}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full pl-9 pr-4 py-3 text-xl font-extrabold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                isExceeded
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500'
              }`}
            />
          </div>
          {isExceeded && (
            <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Insufficient balance in your wallet.
            </p>
          )}

          {isHighRiskAmount && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>High-value transfer: Fraud engine will monitor & evaluate risk score.</span>
            </div>
          )}
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Spending Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Note / Message */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Transaction Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Lunch split, Project fee, Rent"
            className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || isExceeded || !amount || !recipient}
          className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Transfer ₹{Number(amount || 0).toLocaleString('en-IN')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};
