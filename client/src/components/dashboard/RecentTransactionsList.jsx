import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Utensils,
  Zap,
  Car,
  Film,
  TrendingUp,
  HeartPulse,
  PlusCircle,
  Receipt,
  Search,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

export const RecentTransactionsList = ({ transactions = [], onSelectTransaction }) => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryIcon = (category, type) => {
    if (type === 'CREDIT') return <PlusCircle className="w-4 h-4 text-emerald-500" />;
    switch (category) {
      case 'Food & Dining':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'Shopping':
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case 'Bills & Utilities':
        return <Zap className="w-4 h-4 text-sky-500" />;
      case 'Transport':
        return <Car className="w-4 h-4 text-blue-500" />;
      case 'Entertainment':
        return <Film className="w-4 h-4 text-pink-500" />;
      case 'Investments':
        return <TrendingUp className="w-4 h-4 text-indigo-500" />;
      case 'Healthcare':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      default:
        return <ArrowLeftRightIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  const ArrowLeftRightIcon = ArrowUpRight;

  const filtered = transactions.filter((t) => {
    const isSender = t.sender?._id === user?._id || t.sender === user?._id;
    if (filterType === 'SENT' && !isSender) return false;
    if (filterType === 'RECEIVED' && isSender) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTxn = t.transactionId?.toLowerCase().includes(q);
      const matchNote = t.note?.toLowerCase().includes(q);
      const matchRecipient = t.receiver?.name?.toLowerCase().includes(q);
      if (!matchDesc && !matchTxn && !matchNote && !matchRecipient) return false;
    }
    return true;
  });

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
      {/* Header with Title and Search/Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Recent Activity
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Real-time ledger updates
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Type Filter Pills */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
            {['ALL', 'SENT', 'RECEIVED'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === type
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {type === 'ALL' ? 'All' : type === 'SENT' ? 'Sent' : 'Received'}
              </button>
            ))}
          </div>

          <Link
            to="/transactions"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-0.5 ml-2"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by transaction ID, recipient, or note..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No transactions match your search or filter.
            </p>
          </div>
        ) : (
          filtered.slice(0, 7).map((txn) => {
            const isSender = txn.sender?._id === user?._id || txn.sender === user?._id;
            const isCredit = txn.type === 'CREDIT' || (!isSender && txn.type === 'TRANSFER');

            return (
              <div
                key={txn._id || txn.transactionId}
                onClick={() => onSelectTransaction(txn)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getCategoryIcon(txn.category, txn.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {txn.description || `${txn.type} - ${txn.category}`}
                      </p>
                      {txn.riskLevel === 'HIGH' && (
                        <span title="Flagged by Fraud Engine" className="shrink-0 text-amber-500">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {formatRelativeDate(txn.createdAt)}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {txn.category || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span
                    className={`text-xs sm:text-sm font-extrabold tracking-tight ${
                      isCredit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isCredit ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </span>
                  <div className="mt-0.5">
                    <Badge
                      variant={txn.status === 'SUCCESS' ? 'success' : txn.status === 'FAILED' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
