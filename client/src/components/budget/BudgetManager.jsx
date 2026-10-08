import React, { useState } from 'react';
import { Target, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import toast from 'react-hot-toast';

export const BudgetManager = ({ budgets = [], onSetBudget }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('Food & Dining');
  const [limitAmount, setLimitAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Food & Dining',
    'Shopping',
    'Bills & Utilities',
    'Transport',
    'Entertainment',
    'Investments',
    'Healthcare'
  ];

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const num = Number(limitAmount);
    if (!num || num <= 0) return;

    try {
      setLoading(true);
      await onSetBudget(category, num);
      toast.success(`Budget for ${category} updated!`);
      setLimitAmount('');
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to set budget limit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-brand-500" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Category Budgets</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Track and limit spending</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-bold transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Set Limit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400 italic">
            No category budgets configured for this month. Click "Set Limit" to create one!
          </div>
        ) : (
          budgets.map((b) => {
            const isExceeded = b.percentage >= 100;
            const isWarning = b.percentage >= 80 && !isExceeded;

            return (
              <div
                key={b._id || b.category}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{b.category}</span>
                  <div className="flex items-center space-x-1">
                    {isExceeded ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Exceeded ({b.percentage}%)
                      </span>
                    ) : isWarning ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {b.percentage}% Used
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {b.percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs mt-1 font-medium">
                  <span className="text-slate-500 dark:text-slate-400">
                    Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(b.spentAmount)}</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Limit: <strong className="text-slate-900 dark:text-white">{formatCurrency(b.limitAmount)}</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Set / Update Budget Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Monthly Category Budget">
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Monthly Spending Limit (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="100"
                required
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full pl-9 pr-4 py-3 text-lg font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !limitAmount}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all mt-2"
          >
            {loading ? 'Saving...' : 'Save Budget Limit'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
