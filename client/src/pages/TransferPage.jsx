import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, QrCode, Camera, ShieldCheck, UserCheck, CheckCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { walletService } from '../services/walletService';
import { MyQrCode } from '../components/qr/MyQrCode';
import { ScanQrModal } from '../components/qr/ScanQrModal';
import { formatCurrency } from '../utils/formatters';

export const TransferPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'qr' ? 'qr' : 'send';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { wallet, transferMoney } = useWallet();

  const [identifier, setIdentifier] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General Transfer');
  const [note, setNote] = useState('');
  const [validating, setValidating] = useState(false);
  const [valError, setValError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);

  const categories = [
    'Food & Dining',
    'Shopping',
    'Bills & Utilities',
    'Transport',
    'Entertainment',
    'Investments',
    'Healthcare',
    'General Transfer'
  ];

  const handleValidate = async () => {
    if (!identifier || identifier.trim().length < 3) return;
    try {
      setValidating(true);
      setValError('');
      const res = await walletService.validateRecipient(identifier.trim());
      if (res.success && res.recipient) {
        setRecipient(res.recipient);
      }
    } catch (err) {
      setRecipient(null);
      setValError(err.response?.data?.message || 'Recipient not found.');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0 || !recipient) return;

    try {
      setLoading(true);
      await transferMoney({
        recipientId: recipient._id,
        recipientUpi: recipient.upiId,
        amount: num,
        category,
        note
      });
      setAmount('');
      setNote('');
      setRecipient(null);
      setIdentifier('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isExceeded = Number(amount || 0) > (wallet?.balance || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Send & Scan Payments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Transfer money instantly via UPI ID, phone number, or QR Code.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 max-w-md">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'send'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Direct P2P Transfer</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'qr'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Payments</span>
        </button>
      </div>

      {activeTab === 'send' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Transfer Form Card */}
          <div className="md:col-span-2 glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80">
            <form onSubmit={handleSubmitTransfer} className="space-y-5">
              {/* Payee identifier */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Recipient UPI ID, Email, or Phone
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (recipient) setRecipient(null);
                    }}
                    onBlur={handleValidate}
                    placeholder="e.g. rahul@wallet, rahul@gmail.com, or 9876543211"
                    className="flex-1 px-4 py-3 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={validating || !identifier}
                    className="px-5 py-3 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs hover:bg-brand-100 transition-colors"
                  >
                    {validating ? 'Checking...' : 'Verify'}
                  </button>
                </div>
                {valError && <p className="text-xs text-rose-500 mt-1">{valError}</p>}
              </div>

              {/* Payee Verified Card */}
              {recipient && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center space-x-3">
                    {recipient.avatar ? (
                      <img src={recipient.avatar} alt={recipient.name} className="w-10 h-10 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">
                        {recipient.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{recipient.name}</p>
                      <p className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">{recipient.upiId}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              )}

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Amount (₹)
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Wallet Available: <strong className="text-slate-900 dark:text-white">{formatCurrency(wallet?.balance || 0)}</strong>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={wallet?.balance || 0}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Note / Reference
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Project payment, Rent, Dinner"
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || isExceeded || !recipient || !amount}
                className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send ₹{Number(amount || 0).toLocaleString('en-IN')}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Security & Camera CTA Card */}
          <div className="space-y-4">
            <div className="glass-card p-6 border border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Prefer to Scan a QR?</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                Scan instantly via camera or upload a QR screenshot to send money.
              </p>
              <button
                onClick={() => setScanModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Launch QR Scanner
              </button>
            </div>

            <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Instant Atomic Settlement</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Transactions execute atomically across sender and receiver wallets with automated fraud checks.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* QR Code Hub */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MyQrCode />

          <div className="glass-card p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Camera className="w-4 h-4" />
                <span>Scan to Pay</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Camera & File QR Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                You can scan any PayFlow or UPI QR code to transfer money without typing recipient details.
              </p>
            </div>

            <div className="my-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <QrCode className="w-16 h-16 text-brand-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Supports Device Camera & Image Uploads
              </p>
            </div>

            <button
              onClick={() => setScanModalOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Open Camera Scanner</span>
            </button>
          </div>
        </div>
      )}

      <ScanQrModal isOpen={scanModalOpen} onClose={() => setScanModalOpen(false)} />
    </div>
  );
};
