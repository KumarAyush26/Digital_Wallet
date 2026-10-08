import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingDown, Target } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MetricsGrid = ({ stats, budgetCount = 4 }) => {
  const metrics = [
    {
      title: 'Total Received',
      value: formatCurrency(stats?.totalReceived || 0),
      subtitle: 'All-time incoming money',
      icon: ArrowDownLeft,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      title: 'Total Sent',
      value: formatCurrency(stats?.totalSent || 0),
      subtitle: 'All-time outgoing payments',
      icon: ArrowUpRight,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/60'
    },
    {
      title: 'This Month Spending',
      value: formatCurrency(stats?.monthlySpending || 0),
      subtitle: 'Outflow current cycle',
      icon: TrendingDown,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      title: 'Active Budgets',
      value: `${budgetCount} Categories`,
      subtitle: 'Monitoring limits',
      icon: Target,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.title}
            className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {m.title}
              </span>
              <div className={`p-2.5 rounded-xl ${m.bgColor} ${m.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {m.value}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {m.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
