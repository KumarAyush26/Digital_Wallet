import React, { useState } from 'react';
import { HandCoins, Send, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { transactionService } from '../../services/transactionService';
import toast from 'react-hot-toast';

export const RequestMoneyModal = ({ isOpen, onClose }) => {
  const [targetUpi, setTargetUpi] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0 || !targetUpi) return;

    try {
      setLoading(true);
      const res = await transactionService.requestMoney({
        targetUpi,
        amount: num,
        note
      });
      if (res.success) {
        toast.success(res.message || 'Payment request sent!');
        setTargetUpi('');
        setAmount('');
        setNote('');
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Money from a Friend">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Payer UPI ID, Email, or Phone
          </label>
          <input
            type="text"
            required
            value={targetUpi}
            onChange={(e) => setTargetUpi(e.target.value)}
            placeholder="e.g. amit@wallet or 9876543212"
            className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Requested Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-3 text-xl font-extrabold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Reason / Purpose (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Dinner bill split, Ticket repayment"
            className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !targetUpi || !amount}
          className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <HandCoins className="w-4 h-4" />
              <span>Send Payment Request</span>
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};
