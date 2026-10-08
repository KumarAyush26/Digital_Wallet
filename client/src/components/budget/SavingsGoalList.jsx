import React, { useState } from 'react';
import { Target, Plus, ArrowUpRight, ArrowDownLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { useWallet } from '../../context/WalletContext';
import toast from 'react-hot-toast';

export const SavingsGoalList = ({ goals = [], onCreateGoal, onContributeGoal, onWithdrawGoal }) => {
  const { wallet } = useWallet();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);
  const [actionType, setActionType] = useState('DEPOSIT'); // 'DEPOSIT' | 'WITHDRAW'
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // New goal form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#6366F1');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const num = Number(targetAmount);
    if (!title || !num || num <= 0) return;

    try {
      setLoading(true);
      await onCreateGoal({
        title,
        targetAmount: num,
        targetDate: targetDate || undefined,
        color
      });
      toast.success(`Savings goal "${title}" created!`);
      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      setIsCreateOpen(false);
    } catch (err) {
      toast.error('Failed to create savings goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0 || !activeGoal) return;

    try {
      setLoading(true);
      if (actionType === 'DEPOSIT') {
        if (num > (wallet?.balance || 0)) {
          toast.error('Insufficient wallet balance.');
          return;
        }
        await onContributeGoal(activeGoal._id, num);
        toast.success(`₹${num.toLocaleString('en-IN')} deposited to "${activeGoal.title}"!`);
      } else {
        if (num > activeGoal.currentAmount) {
          toast.error('Amount exceeds savings goal balance.');
          return;
        }
        await onWithdrawGoal(activeGoal._id, num);
        toast.success(`₹${num.toLocaleString('en-IN')} returned to wallet!`);
      }
      setAmount('');
      setActiveGoal(null);
    } catch (err) {
      toast.error('Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Savings Goals & Vault Pots</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Save for gadgets, travel & safety funds</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-bold transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400 italic">
            No savings goals active. Create your first goal to start stashing funds!
          </div>
        ) : (
          goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

            return (
              <div
                key={g._id}
                className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {g.title}
                    </span>
                    {g.isCompleted || pct >= 100 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {pct}%
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(g.currentAmount)}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Target: {formatCurrency(g.targetAmount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden my-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: g.color || '#6366F1'
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                  <button
                    onClick={() => {
                      setActiveGoal(g);
                      setActionType('DEPOSIT');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/80 hover:bg-brand-100 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>

                  {g.currentAmount > 0 && (
                    <button
                      onClick={() => {
                        setActiveGoal(g);
                        setActionType('WITHDRAW');
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Release</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Goal Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Savings Goal">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Goal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MacBook Pro M3, Goa Vacation, Emergency Fund"
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Target Amount (₹)
            </label>
            <input
              type="number"
              min="500"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !title || !targetAmount}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all mt-2"
          >
            {loading ? 'Creating...' : 'Create Savings Goal Pot'}
          </button>
        </form>
      </Modal>

      {/* Deposit / Withdraw Action Modal */}
      <Modal
        isOpen={!!activeGoal}
        onClose={() => {
          setActiveGoal(null);
          setAmount('');
        }}
        title={actionType === 'DEPOSIT' ? `Deposit to "${activeGoal?.title}"` : `Release Funds from "${activeGoal?.title}"`}
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
            <span className="text-slate-400">
              {actionType === 'DEPOSIT' ? 'Wallet Available:' : 'Goal Balance:'}
            </span>
            <strong className="text-slate-900 dark:text-white">
              {actionType === 'DEPOSIT'
                ? formatCurrency(wallet?.balance || 0)
                : formatCurrency(activeGoal?.currentAmount || 0)}
            </strong>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 text-lg font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all mt-2"
          >
            {loading ? 'Processing...' : actionType === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Release to Wallet'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
