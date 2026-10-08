import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  Lock,
  Unlock,
  Trash2,
  Search,
  CheckCircle,
  Eye,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { RiskDetailsModal } from '../components/admin/RiskDetailsModal';
import toast from 'react-hot-toast';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'transactions'

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [riskFilter, setRiskFilter] = useState('');
  const [txnSearch, setTxnSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await adminService.getStats();
      if (res.success) setStats(res.stats);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers({
        page: userPage,
        limit: 15,
        search: userSearch.trim() || undefined,
        status: userStatus || undefined
      });
      if (res.success) {
        setUsers(res.users);
        setTotalUsers(res.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllTransactions({
        limit: 20,
        riskLevel: riskFilter || undefined,
        search: txnSearch.trim() || undefined
      });
      if (res.success) {
        setTransactions(res.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadTransactions();
    }
  }, [activeTab, userPage, userStatus, riskFilter]);

  const handleToggleFreeze = async (userId) => {
    try {
      const res = await adminService.toggleFreezeUser(userId);
      if (res.success) {
        toast.success(res.message);
        loadUsers();
        loadStats();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error updating user status.');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        toast.success(res.message);
        loadUsers();
        loadStats();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleReviewTransaction = async (txnId, action) => {
    try {
      const res = await adminService.reviewTransaction(txnId, action);
      if (res.success) {
        toast.success(res.message);
        loadTransactions();
        loadStats();
      }
    } catch (e) {
      toast.error('Failed to review transaction.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/25">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Administrator Command Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            System overview, account freezing, risk inspector, and global ledger audit.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.totalUsers || 0}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats?.activeUsers || 0} Active • {stats?.frozenUsers || 0} Frozen
            </p>
          </div>
        </div>

        <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Platform Volume</span>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(stats?.totalVolume || 0)}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats?.totalTransactions || 0} transactions
            </p>
          </div>
        </div>

        <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>24h Transaction Volume</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(stats?.todayVolume || 0)}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats?.todayTxnCount || 0} transfers today
            </p>
          </div>
        </div>

        <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Flagged High-Risk Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {stats?.flaggedTransactions || 0}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Awaiting compliance review
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 max-w-sm">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Users Management
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Transaction Monitor & Fraud Risk
        </button>
      </div>

      {/* Tab 1: User Management Table */}
      {activeTab === 'users' ? (
        <div className="glass-card border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          {/* User Filters */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                placeholder="Search users by name, email, phone, UPI..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="frozen">Frozen</option>
              </select>
              <button
                onClick={loadUsers}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">UPI ID</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Wallet Balance</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-xl object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center">
                            {u.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-brand-600 dark:text-brand-400 font-semibold">{u.upiId}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{u.phone}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(u.wallet?.balance || 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.isFrozen ? 'danger' : 'success'} size="sm">
                        {u.isFrozen ? 'FROZEN' : 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleFreeze(u._id)}
                            title={u.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                              u.isFrozen
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                            }`}
                          >
                            {u.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            title="Delete User"
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: All Platform Transactions with Risk Inspector */
        <div className="glass-card border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTransactions()}
                placeholder="Search transactions..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="">All Risk Levels</option>
                <option value="HIGH">High Risk (Flagged)</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
              <button
                onClick={loadTransactions}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Txn ID</th>
                  <th className="px-5 py-3.5">Sender</th>
                  <th className="px-5 py-3.5">Receiver</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Risk Score</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">{t.transactionId}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t.sender?.name || 'Self'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t.receiver?.name || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={t.riskLevel === 'HIGH' ? 'danger' : t.riskLevel === 'MEDIUM' ? 'warning' : 'default'} size="sm">
                        {t.riskScore}% {t.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedTxn(t)}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs hover:bg-brand-100 flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Risk</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risk Details Modal */}
      <RiskDetailsModal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
        onReview={handleReviewTransaction}
        onFreezeUser={handleToggleFreeze}
      />
    </div>
  );
};
