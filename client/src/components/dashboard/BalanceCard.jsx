import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, QrCode, ShieldCheck, ArrowUpRight, Plus, ArrowDownToLine } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const BalanceCard = ({ onAddMoney, onSendMoney, onWithdraw, onShowQr }) => {
  const { wallet, isBalanceHidden, toggleBalanceVisibility } = useWallet();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyUpiId = () => {
    if (user?.upiId) {
      navigator.clipboard.writeText(user.upiId);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl gradient-card-primary text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/15">
      {/* Subtle background glow & geometric watermark */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-brand-400/20 blur-xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase flex items-center space-x-1.5 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>PayFlow Primary Vault</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onShowQr}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-colors"
            title="Show My QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Balance Display */}
      <div className="relative z-10 mt-6 sm:mt-8">
        <div className="flex items-center space-x-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider">
          <span>Available Wallet Balance</span>
          <button
            onClick={toggleBalanceVisibility}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
            title={isBalanceHidden ? 'Show Balance' : 'Hide Balance'}
          >
            {isBalanceHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="mt-2 flex items-baseline space-x-3">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            {isBalanceHidden ? '••••••••' : formatCurrency(wallet?.balance || 0)}
          </span>
          <span className="text-xs font-bold text-indigo-200 px-2 py-0.5 rounded-md bg-white/10">
            INR
          </span>
        </div>
      </div>

      {/* UPI ID & Account Number Footer */}
      <div className="relative z-10 mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-200 block">UPI Identifier</span>
          <button
            onClick={copyUpiId}
            className="flex items-center space-x-1.5 mt-0.5 text-xs font-mono font-bold text-white hover:text-indigo-200 transition-colors group"
          >
            <span>{user?.upiId || 'user@wallet'}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />}
          </button>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-200 block">Account Number</span>
          <span className="text-xs font-mono font-semibold text-white/90">
            {wallet?.accountNumber || 'WLT_••••••••'}
          </span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={onAddMoney}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-brand-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Money</span>
          </button>

          <button
            onClick={onSendMoney}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Send</span>
          </button>

          <button
            onClick={onWithdraw}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white transition-colors"
            title="Withdraw to Bank"
          >
            <ArrowDownToLine className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
