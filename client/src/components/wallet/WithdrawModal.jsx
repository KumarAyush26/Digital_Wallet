import React, { useState } from 'react';
import { Landmark, ArrowRight, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useWallet } from '../../context/WalletContext';
import { formatCurrency } from '../../utils/formatters';

export const WithdrawModal = ({ isOpen, onClose }) => {
  const { wallet, withdrawMoney } = useWallet();
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) return;

    if (num > (wallet?.balance || 0)) {
      return;
    }

    try {
      setLoading(true);
      await withdrawMoney({
        amount: num,
        bankAccount,
        ifscCode
      });
      setAmount('');
      setBankAccount('');
      setIfscCode('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isExceeded = Number(amount || 0) > (wallet?.balance || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw to Bank Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Available balance indicator */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available Balance:</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(wallet?.balance || 0)}
          </span>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Withdrawal Amount (₹)
          </label>
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
              <AlertCircle className="w-3.5 h-3.5" /> Amount exceeds available wallet balance.
            </p>
          )}
        </div>

        {/* Bank Account Number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Bank Account Number
          </label>
          <input
            type="text"
            required
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="e.g. 50100294829104"
            className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* IFSC Code */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            IFSC Code
          </label>
          <input
            type="text"
            required
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            placeholder="e.g. HDFC0001234"
            className="w-full px-4 py-2.5 text-xs font-medium uppercase rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || isExceeded || !amount || !bankAccount || !ifscCode}
          className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Landmark className="w-4 h-4" />
              <span>Confirm Instant Bank Payout</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};
