import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  ReceiptText,
  PieChart,
  Target,
  User,
  Shield,
  QrCode,
  CalendarClock,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Send & Pay', path: '/transfer', icon: ArrowLeftRight },
    { name: 'QR Code & Pay', path: '/transfer?tab=qr', icon: QrCode },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Analytics & AI', path: '/analytics', icon: PieChart },
    { name: 'Budgets & Goals', path: '/budgets', icon: Target },
    { name: 'Scheduled Transfers', path: '/scheduled', icon: CalendarClock },
    { name: 'Profile & Security', path: '/profile', icon: User }
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Console', path: '/admin', icon: Shield, adminOnly: true });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0e1424]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between px-6 lg:hidden border-b border-slate-100 dark:border-slate-800">
          <span className="font-extrabold text-lg text-slate-900 dark:text-white">
            Pay<span className="text-brand-500">Flow</span>
          </span>
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Core Banking
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${item.adminOnly ? 'mt-4 border border-brand-500/30' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.adminOnly && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-brand-700/50 text-brand-200">
                    Admin
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Security Vault Indicator footer */}
        <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              End-to-End Encrypted
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            256-bit AES Token Vault & Atomic Ledger active
          </p>
        </div>
      </aside>
    </>
  );
};
