import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { transactionService } from '../services/transactionService';
import { analyticsService } from '../services/analyticsService';
import { contactService } from '../services/contactService';

import { BalanceCard } from '../components/dashboard/BalanceCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { QuickSendContacts } from '../components/dashboard/QuickSendContacts';
import { RecentTransactionsList } from '../components/dashboard/RecentTransactionsList';

import { AddMoneyModal } from '../components/wallet/AddMoneyModal';
import { WithdrawModal } from '../components/wallet/WithdrawModal';
import { SendMoneyModal } from '../components/wallet/SendMoneyModal';
import { RequestMoneyModal } from '../components/wallet/RequestMoneyModal';
import { ScanQrModal } from '../components/qr/ScanQrModal';
import { MyQrCode } from '../components/qr/MyQrCode';
import { TransactionDetailsModal } from '../components/transactions/TransactionDetailsModal';
import { Modal } from '../components/common/Modal';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { wallet, fetchWallet } = useWallet();
  const { liveNotifications } = useSocket();

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [sendMoneyOpen, setSendMoneyOpen] = useState(false);
  const [requestMoneyOpen, setRequestMoneyOpen] = useState(false);
  const [scanQrOpen, setScanQrOpen] = useState(false);
  const [showMyQrOpen, setShowMyQrOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [targetContact, setTargetContact] = useState(null);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [newContactId, setNewContactId] = useState('');
  const [newContactName, setNewContactName] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [txnsRes, statsRes, contactsRes] = await Promise.all([
        transactionService.getTransactions({ limit: 10 }),
        analyticsService.getOverview(),
        contactService.getContacts()
      ]);

      if (txnsRes.success) setTransactions(txnsRes.transactions);
      if (statsRes.success) setStats(statsRes.stats);
      if (contactsRes.success) setContacts(contactsRes.contacts);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh when real-time socket events fire
  useEffect(() => {
    if (liveNotifications.length > 0) {
      loadDashboardData();
      fetchWallet();
    }
  }, [liveNotifications]);

  const handleSelectContactForTransfer = (contactUser) => {
    setTargetContact(contactUser);
    setSendMoneyOpen(true);
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    if (!newContactId) return;
    try {
      const res = await contactService.addContact({
        identifier: newContactId,
        nickname: newContactName || undefined
      });
      if (res.success) {
        toast.success(res.message);
        setContacts((prev) => [res.contact, ...prev]);
        setNewContactId('');
        setNewContactName('');
        setAddContactOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add contact.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Hello, {user?.name?.split(' ')[0] || 'Member'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome to your digital cash command center.
          </p>
        </div>
      </div>

      {/* Balance Card & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BalanceCard
            onAddMoney={() => setAddMoneyOpen(true)}
            onSendMoney={() => {
              setTargetContact(null);
              setSendMoneyOpen(true);
            }}
            onWithdraw={() => setWithdrawOpen(true)}
            onShowQr={() => setShowMyQrOpen(true)}
          />
        </div>

        {/* Quick Send Favorite Contacts */}
        <div>
          <QuickSendContacts
            contacts={contacts}
            onSelectContact={handleSelectContactForTransfer}
            onAddContact={() => setAddContactOpen(true)}
          />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <QuickActions
        onAddMoney={() => setAddMoneyOpen(true)}
        onSendMoney={() => {
          setTargetContact(null);
          setSendMoneyOpen(true);
        }}
        onScanQr={() => setScanQrOpen(true)}
        onWithdraw={() => setWithdrawOpen(true)}
        onRequestMoney={() => setRequestMoneyOpen(true)}
      />

      {/* High-level Cash Flow Metrics Grid */}
      <MetricsGrid stats={stats} />

      {/* Recent Activity List */}
      <RecentTransactionsList
        transactions={transactions}
        onSelectTransaction={(txn) => setSelectedTxn(txn)}
      />

      {/* Modal Dialogs */}
      <AddMoneyModal
        isOpen={addMoneyOpen}
        onClose={() => {
          setAddMoneyOpen(false);
          loadDashboardData();
        }}
      />

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => {
          setWithdrawOpen(false);
          loadDashboardData();
        }}
      />

      <SendMoneyModal
        isOpen={sendMoneyOpen}
        onClose={() => {
          setSendMoneyOpen(false);
          setTargetContact(null);
          loadDashboardData();
        }}
        initialRecipient={targetContact}
      />

      <RequestMoneyModal
        isOpen={requestMoneyOpen}
        onClose={() => setRequestMoneyOpen(false)}
      />

      <ScanQrModal
        isOpen={scanQrOpen}
        onClose={() => {
          setScanQrOpen(false);
          loadDashboardData();
        }}
      />

      {/* My QR Code Modal */}
      <Modal
        isOpen={showMyQrOpen}
        onClose={() => setShowMyQrOpen(false)}
        title="Personal PayFlow QR Code"
      >
        <MyQrCode />
      </Modal>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
      />

      {/* Add Contact Modal */}
      <Modal
        isOpen={addContactOpen}
        onClose={() => setAddContactOpen(false)}
        title="Add Favorite Contact"
      >
        <form onSubmit={handleAddContactSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Contact UPI ID, Email, or Phone
            </label>
            <input
              type="text"
              required
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value)}
              placeholder="e.g. rahul@wallet or rahul@gmail.com"
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Custom Nickname (Optional)
            </label>
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="e.g. Roommate, Brother, Office Team"
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={!newContactId}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Save Contact
          </button>
        </form>
      </Modal>
    </div>
  );
};
