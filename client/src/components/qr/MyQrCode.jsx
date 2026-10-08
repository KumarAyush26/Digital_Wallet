import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const MyQrCode = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  let qrPayload = `wallet://pay?upi=${user?.upiId || 'user@wallet'}&name=${encodeURIComponent(user?.name || 'User')}`;
  if (amount && Number(amount) > 0) {
    qrPayload += `&amount=${Number(amount)}`;
  }

  const copyUpiId = () => {
    if (user?.upiId) {
      navigator.clipboard.writeText(user.upiId);
      setCopied(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQr = () => {
    const svg = document.getElementById('user-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${user?.upiId || 'payflow'}_qr.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      toast.success('QR Code downloaded!');
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="glass-card p-6 border border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Instant UPI QR Code</span>
      </div>

      {/* QR Code Container */}
      <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center">
        <QRCodeSVG
          id="user-qr-svg"
          value={qrPayload}
          size={180}
          level="H"
          includeMargin={false}
        />
        <div className="mt-3 flex items-center space-x-2">
          {user?.avatar && (
            <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />
          )}
          <span className="text-xs font-bold text-slate-800 font-mono">
            {user?.upiId}
          </span>
        </div>
      </div>

      {/* UPI Copy Chip */}
      <button
        onClick={copyUpiId}
        className="mt-4 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center space-x-1.5"
      >
        <span>{user?.upiId}</span>
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {/* Amount Pre-fill configuration */}
      <div className="w-full mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
          Request Specific Amount (Optional)
        </label>
        <div className="relative max-w-[200px] mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Fixed amount..."
            className="w-full pl-7 pr-3 py-1.5 text-xs font-bold text-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Download QR Button */}
      <button
        onClick={downloadQr}
        className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Save QR to Gallery</span>
      </button>
    </div>
  );
};
