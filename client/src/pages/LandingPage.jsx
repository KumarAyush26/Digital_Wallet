import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  Zap,
  QrCode,
  Sparkles,
  Lock,
  PieChart,
  Target,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const LandingPage = () => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">
            Pay<span className="text-brand-500">Flow</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold shadow-lg shadow-brand-500/25 transition-all flex items-center space-x-1.5"
          >
            <span>Open Free Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-16 pb-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Hero Copy */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MERN Stack Production Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Next-Gen Digital Wallet & <span className="text-brand-500">Atomic Payments</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Instant peer-to-peer transfers, dynamic QR code payments, AI-driven financial insights, rule-based fraud risk detection, and real-time WebSockets.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Get ₹1,000 Welcome Bonus</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-extrabold text-sm transition-colors flex items-center justify-center"
            >
              <span>Explore Live Demo (1-Click)</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">0ms</span>
              <p className="text-xs text-slate-400 mt-0.5">Atomic Transfers</p>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-500">100%</span>
              <p className="text-xs text-slate-400 mt-0.5">ACID Consistency</p>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-brand-500">AI</span>
              <p className="text-xs text-slate-400 mt-0.5">Risk & Insights</p>
            </div>
          </div>
        </div>

        {/* Right Hero Visual Card */}
        <div className="flex-1 w-full max-w-lg">
          <div className="glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative">
            <div className="p-6 rounded-3xl gradient-card-primary text-white shadow-xl mb-6">
              <div className="flex justify-between items-center text-xs font-bold text-indigo-200 uppercase">
                <span>PayFlow Primary Vault</span>
                <span>Active</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl sm:text-4xl font-black">₹12,450.00</span>
                <p className="text-xs text-indigo-200 mt-1 font-mono">kumar@wallet</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Received from Amit</p>
                    <p className="text-[10px] text-slate-400">Reimbursement</p>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">+₹2,000</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                    -
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Sent to Rahul</p>
                    <p className="text-[10px] text-slate-400">Team Lunch</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">-₹500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 lg:px-16 py-20 bg-slate-100/60 dark:bg-[#0e1424]/60 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Engineered for Modern Financial Transactions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Combining institutional grade security, atomic ledger balances, and artificial intelligence insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Atomic Balance Transfers',
                desc: 'Guaranteed double-spend prevention and zero negative balance via conditional database operations.'
              },
              {
                icon: QrCode,
                title: 'Scan & Pay QR Ecosystem',
                desc: 'Generate customized personal UPI QR codes and scan instantly with device camera or screenshot uploads.'
              },
              {
                icon: Sparkles,
                title: 'AI Financial Insights',
                desc: 'Automated spending velocity analysis, category surge detection, and personalized saving tips.'
              },
              {
                icon: ShieldCheck,
                title: 'Heuristic Fraud Engine',
                desc: 'Real-time 0-100 risk scoring evaluating abnormal amounts, velocity spikes, and unfamiliar recipients.'
              },
              {
                icon: Target,
                title: 'Budgets & Savings Pots',
                desc: 'Set monthly category thresholds with automatic warnings and stash money in dedicated goal pots.'
              },
              {
                icon: PieChart,
                title: 'Executive Admin Panel',
                desc: 'Full administrative control to freeze/unfreeze suspicious accounts and review flagged transactions.'
              }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="glass-card p-6 border border-slate-200/80 dark:border-slate-800/80 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 px-6 lg:px-16 py-8 text-center text-xs text-slate-400">
        <p>© 2026 PayFlow Digital Wallet. Built with MongoDB, Express, React, Node.js & Socket.IO.</p>
      </footer>
    </div>
  );
};
