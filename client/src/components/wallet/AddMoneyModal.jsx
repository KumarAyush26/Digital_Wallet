import React, { useState } from 'react';
import { CreditCard, Landmark, QrCode, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useWallet } from '../../context/WalletContext';

export const AddMoneyModal = ({ isOpen, onClose }) => {
  const { addMoney } = useWallet();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CARD_SIMULATION');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) return;

    try {
      setLoading(true);
      await addMoney(num, method);
      setAmount('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Money to Wallet">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Enter Top-Up Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              min="1"
              max="200000"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-3 text-xl font-extrabold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Quick Amount Pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {quickAmounts.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors border border-transparent hover:border-brand-200 dark:hover:border-brand-800"
              >
                +₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Gateway Method Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Simulation Method
          </label>
          <div className="space-y-2">
            {[
              { id: 'CARD_SIMULATION', label: 'Debit / Credit Card', desc: 'Instant deposit (Visa, Mastercard, RuPay)', icon: CreditCard },
              { id: 'UPI_SIMULATION', label: 'External UPI Apps', desc: 'Google Pay, PhonePe, Paytm simulation', icon: QrCode },
              { id: 'NETBANKING_SIMULATION', label: 'Net Banking Gateway', desc: 'HDFC, ICICI, SBI simulated portal', icon: Landmark }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = method === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setMethod(item.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/50 dark:bg-brand-950/40 border-brand-500 ring-1 ring-brand-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo Gateway Guarantee notice */}
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Demo FinTech simulation: 100% free test funds credited instantly.</span>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !amount || Number(amount) <= 0}
          className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Authorize & Add ₹{Number(amount || 0).toLocaleString('en-IN')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};
