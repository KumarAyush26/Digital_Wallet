import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Repeat, Plus, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { scheduledTransferService } from '../services/scheduledTransferService';
import { walletService } from '../services/walletService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import toast from 'react-hot-toast';

export const ScheduledTransfersPage = () => {
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [recipientUpi, setRecipientUpi] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [validating, setValidating] = useState(false);
  const [valError, setValError] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bills & Utilities');
  const [frequency, setFrequency] = useState('ONCE');
  const [scheduledDate, setScheduledDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = [
    'Bills & Utilities', 'Food & Dining', 'Shopping', 'Transport',
    'Entertainment', 'Investments', 'Healthcare', 'General Transfer'
  ];

  const frequencies = [
    { value: 'ONCE', label: 'One-time Only' },
    { value: 'DAILY', label: 'Daily Recurring' },
    { value: 'WEEKLY', label: 'Weekly Recurring' },
    { value: 'MONTHLY', label: 'Monthly Recurring' }
  ];

  const frequencyColors = {
    ONCE: 'default',
    DAILY: 'success',
    WEEKLY: 'brand',
    MONTHLY: 'warning'
  };

  const loadScheduled = async () => {
    try {
      setLoading(true);
      const res = await scheduledTransferService.getScheduledTransfers();
      if (res.success) setScheduled(res.transfers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduled();
  }, []);

  const handleValidate = async () => {
    if (!recipientUpi || recipientUpi.trim().length < 3) return;
    try {
      setValidating(true);
      setValError('');
      const res = await walletService.validateRecipient(recipientUpi.trim());
      if (res.success && res.recipient) setRecipient(res.recipient);
    } catch (err) {
      setRecipient(null);
      setValError(err.response?.data?.message || 'Recipient not found.');
    } finally {
      setValidating(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!recipient || !amount || !scheduledDate) return;
    try {
      setSaving(true);
      const res = await scheduledTransferService.createScheduledTransfer({
        recipientUpi: recipient.upiId,
        amount: Number(amount),
        category,
        frequency,
        scheduledDate,
        note
      });
      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        resetForm();
        loadScheduled();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule transfer.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this scheduled transfer?')) return;
    try {
      const res = await scheduledTransferService.cancelScheduledTransfer(id);
      if (res.success) {
        toast.success(res.message);
        setScheduled(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      toast.error('Failed to cancel.');
    }
  };

  const resetForm = () => {
    setRecipientUpi('');
    setRecipient(null);
    setAmount('');
    setCategory('Bills & Utilities');
    setFrequency('ONCE');
    setScheduledDate('');
    setNote('');
    setValError('');
  };

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Scheduled & Recurring Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automate bill payments, subscriptions, and recurring transfers.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-colors flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Transfer</span>
        </button>
      </div>

      {/* Frequency Legend */}
      <div className="flex flex-wrap gap-2">
        {frequencies.map(f => (
          <div key={f.value} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <Repeat className="w-3 h-3 text-brand-500" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Scheduled Transfers List */}
      {loading ? (
        <div className="glass-card p-12 border border-slate-200/80 dark:border-slate-800/80 text-center text-sm text-slate-400">
          Loading scheduled transfers...
        </div>
      ) : scheduled.length === 0 ? (
        <div className="glass-card p-12 border border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col items-center gap-4">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No scheduled transfers yet.</p>
            <p className="text-xs text-slate-400 mt-1">Create one-time or recurring autopay rules.</p>
          </div>
          <button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 transition-colors"
          >
            Schedule Your First Transfer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduled.map(s => (
            <div
              key={s._id}
              className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-300 dark:hover:border-brand-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {s.recipientId?.avatar ? (
                    <img src={s.recipientId.avatar} alt={s.recipientId.name} className="w-10 h-10 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                      {s.recipientId?.name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{s.recipientId?.name || 'Unknown'}</p>
                    <p className="text-[11px] font-mono text-brand-600 dark:text-brand-400">{s.recipientUpi}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancel(s._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Cancel scheduled transfer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(s.amount)}
                </span>
                <Badge variant={frequencyColors[s.frequency] || 'default'} size="sm">
                  <Repeat className="w-3 h-3 mr-1" />
                  {s.frequency}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Scheduled</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(s.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Category</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{s.category}</span>
                </div>
                {s.note && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Note</span>
                    <span className="font-medium italic text-slate-600 dark:text-slate-400 truncate max-w-[150px]">"{s.note}"</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SCHEDULED — Auto-executes on due date</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule a Transfer">
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Recipient UPI ID / Email / Phone
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={recipientUpi}
                onChange={(e) => { setRecipientUpi(e.target.value); setRecipient(null); }}
                onBlur={handleValidate}
                placeholder="e.g. rahul@wallet"
                className="flex-1 px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleValidate}
                disabled={validating || !recipientUpi}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors disabled:opacity-50"
              >
                {validating ? '...' : 'Verify'}
              </button>
            </div>
            {valError && <p className="text-xs text-rose-500 mt-1">{valError}</p>}
            {recipient && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center space-x-2 text-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center">
                  {recipient.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{recipient.name}</p>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400">{recipient.upiId}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
              </div>
            )}
          </div>

          {/* Amount + Category in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number" min="1" required value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Frequency + Date in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Start Date</label>
              <input
                type="date" required min={today} value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Note (Optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly rent, Netflix subscription..."
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !recipient || !amount || !scheduledDate}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirm Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};
