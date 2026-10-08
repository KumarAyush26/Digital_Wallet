import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requireOtp, setRequireOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      const res = await login(email, password, requireOtp ? otp : null);
      if (res?.requireTwoFactor) {
        setRequireOtp(true);
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            Pay<span className="text-brand-500">Flow</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Sign In to Your Digital Wallet
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your email/UPI credentials or select a 1-click demo account below.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / UPI input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Email or UPI ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kumar@gmail.com or admin@wallet"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* 2FA OTP Prompt (if enabled) */}
            {requireOtp && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 animate-slide-up">
                <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                  Enter 2FA Code (Demo OTP: 123456)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-amber-300 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 pt-2.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{requireOtp ? 'Verify OTP & Sign In' : 'Sign In to Wallet'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Accounts Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Demo Accounts</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('kumar@gmail.com', 'kumar123')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-slate-200 dark:border-slate-700 text-left transition-colors group"
              >
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600">Kumar</p>
                <p className="text-[9px] text-slate-400 font-mono">₹12,450</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('rahul@gmail.com', 'rahul123')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-slate-200 dark:border-slate-700 text-left transition-colors group"
              >
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600">Rahul</p>
                <p className="text-[9px] text-slate-400 font-mono">₹5,000</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@wallet', 'admin123')}
                className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/80 hover:bg-brand-100 border border-brand-200 dark:border-brand-800 text-left transition-colors group"
              >
                <p className="text-[11px] font-bold text-brand-600 dark:text-brand-400 truncate">Admin</p>
                <p className="text-[9px] text-brand-500 font-mono">Full Access</p>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
