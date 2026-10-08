import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, AlertCircle, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { qrService } from '../../services/qrService';
import { useWallet } from '../../context/WalletContext';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const ScanQrModal = ({ isOpen, onClose }) => {
  const { wallet, transferMoney } = useWallet();
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualUpi, setManualUpi] = useState('');
  const [scanning, setScanning] = useState(false);
  const [paying, setPaying] = useState(false);

  const scannerRef = useRef(null);

  // Initialize camera scanner when modal opens on camera tab
  useEffect(() => {
    let html5QrCode = null;

    if (isOpen && activeTab === 'camera' && !recipient) {
      const elementId = 'reader-element';
      const container = document.getElementById(elementId);

      if (container) {
        html5QrCode = new Html5Qrcode(elementId);
        scannerRef.current = html5QrCode;
        setScanning(true);

        html5QrCode
          .start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 220, height: 220 }
            },
            (decodedText) => {
              handleQrDetected(decodedText);
              html5QrCode.stop().catch(() => {});
            },
            () => {}
          )
          .catch((err) => {
            console.warn('Camera access error:', err);
            setScanning(false);
          });
      }
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [isOpen, activeTab, recipient]);

  const handleQrDetected = async (qrData) => {
    try {
      setErrorMsg('');
      const res = await qrService.verifyQrCode(qrData);
      if (res.success && res.recipient) {
        setRecipient(res.recipient);
        if (res.prefilledAmount && res.prefilledAmount > 0) {
          setAmount(res.prefilledAmount.toString());
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or unrecognized QR Code.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode('file-scanner-temp');
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleQrDetected(decodedText);
    } catch (err) {
      setErrorMsg('Could not detect a QR Code in this image.');
    }
  };

  const handleManualVerify = () => {
    if (!manualUpi || manualUpi.trim() === '') return;
    handleQrDetected(manualUpi.trim());
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0 || !recipient) return;

    if (num > (wallet?.balance || 0)) {
      setErrorMsg('Insufficient balance in your wallet.');
      return;
    }

    try {
      setPaying(true);
      await qrService.payViaQr({
        recipientUpi: recipient.upiId,
        amount: num,
        category: 'Shopping',
        note: note || 'QR Payment'
      });
      toast.success(`₹${num.toLocaleString('en-IN')} paid to ${recipient.name}!`);
      handleReset();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleReset = () => {
    setRecipient(null);
    setAmount('');
    setNote('');
    setErrorMsg('');
    setManualUpi('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title={recipient ? 'Confirm QR Payment' : 'Scan & Pay'}
    >
      <div id="file-scanner-temp" className="hidden" />

      {/* Payment Confirmation State */}
      {recipient ? (
        <form onSubmit={handleConfirmPayment} className="space-y-4">
          {/* Verified Payee Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-brand-500/10 to-indigo-500/10 border border-brand-200 dark:border-brand-800/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {recipient.avatar ? (
                <img src={recipient.avatar} alt={recipient.name} className="w-12 h-12 rounded-2xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-base flex items-center justify-center">
                  {recipient.name[0]}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Paying To</p>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{recipient.name}</h4>
                <p className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold">{recipient.upiId}</p>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Payment Amount (₹)
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Balance: <strong>{formatCurrency(wallet?.balance || 0)}</strong>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="1"
                max={wallet?.balance || 0}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 text-xl font-extrabold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
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
              placeholder="e.g. Scanned at Store, Dinner bill"
              className="w-full px-4 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Scan Again
            </button>
            <button
              type="submit"
              disabled={paying || !amount || Number(amount) <= 0 || Number(amount) > (wallet?.balance || 0)}
              className="flex-[2] py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2"
            >
              {paying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Pay ₹{Number(amount || 0).toLocaleString('en-IN')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Scanner View */
        <div className="space-y-4">
          {/* Method Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'camera'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'manual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Manual Input</span>
            </button>
          </div>

          {/* Camera View */}
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center">
              <div
                id="reader-element"
                className="w-full max-w-[280px] h-[280px] rounded-2xl overflow-hidden bg-black/90 relative border border-slate-700 flex items-center justify-center text-white"
              >
                {!scanning && (
                  <p className="text-xs text-slate-400 p-4 text-center">
                    Camera initializing... If permission was denied, switch to Upload Image tab.
                  </p>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Point your device camera at a PayFlow or UPI QR code
              </p>
            </div>
          )}

          {/* Upload Image View */}
          {activeTab === 'upload' && (
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-brand-500 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Upload QR Code Screenshot / Image
              </p>
              <p className="text-[10px] text-slate-400 mt-1 mb-4">PNG, JPG, WEBP</p>
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 transition-colors">
                <span>Browse Files</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Manual Input View */}
          {activeTab === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Enter Scanned UPI or QR Payload
                </label>
                <input
                  type="text"
                  value={manualUpi}
                  onChange={(e) => setManualUpi(e.target.value)}
                  placeholder="e.g. kumar@wallet or wallet://pay?upi=kumar@wallet"
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                type="button"
                onClick={handleManualVerify}
                disabled={!manualUpi}
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 transition-colors disabled:opacity-50"
              >
                Verify & Proceed
              </button>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-500 font-medium text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};
