import React from 'react';
import { Plus, ArrowUpRight, QrCode, ArrowDownToLine, HandCoins } from 'lucide-react';

export const QuickActions = ({ onAddMoney, onSendMoney, onScanQr, onWithdraw, onRequestMoney }) => {
  const actions = [
    {
      label: 'Add Money',
      sublabel: 'Simulated Top-up',
      icon: Plus,
      color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100',
      onClick: onAddMoney
    },
    {
      label: 'Send Money',
      sublabel: 'UPI or Phone',
      icon: ArrowUpRight,
      color: 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800/40 hover:bg-brand-100',
      onClick: onSendMoney
    },
    {
      label: 'Scan & Pay',
      sublabel: 'Camera Scanner',
      icon: QrCode,
      color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40 hover:bg-purple-100',
      onClick: onScanQr
    },
    {
      label: 'Withdraw',
      sublabel: 'To Bank / UPI',
      icon: ArrowDownToLine,
      color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100',
      onClick: onWithdraw
    },
    {
      label: 'Request Money',
      sublabel: 'Create Request',
      icon: HandCoins,
      color: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40 hover:bg-sky-100',
      onClick: onRequestMoney
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`p-4 rounded-2xl border text-left transition-all duration-150 hover:-translate-y-0.5 group flex flex-col justify-between ${action.color}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">{action.label}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{action.sublabel}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
