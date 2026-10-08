import React, { useState } from 'react';
import { Download, Copy, Check, ShieldAlert, ArrowUpRight, ArrowDownLeft, Receipt, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportService } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const TransactionDetailsModal = ({ isOpen, onClose, transaction }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isSender = transaction.sender?._id === user?._id || transaction.sender === user?._id;
  const isCredit = transaction.type === 'CREDIT' || (!isSender && transaction.type === 'TRANSFER');

  const copyTxnId = () => {
    navigator.clipboard.writeText(transaction.transactionId);
    setCopied(true);
    toast.success('Transaction ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    exportService.exportReceiptPdf(transaction, user);
    toast.success('Receipt PDF downloaded!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Transaction Receipt">
      <div className="space-y-5">
        {/* Main Status Header Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
            isCredit ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-500' : 'bg-brand-50 dark:bg-brand-950/80 text-brand-500'
          }`}>
            {isCredit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
          </div>

          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>

          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={transaction.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {transaction.status}
            </Badge>
            <span className="text-xs font-semibold text-slate-400">
              {transaction.category || 'General'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {transaction.description || 'Payment Transfer'}
          </p>
        </div>

        {/* Breakdown Key-Value Details */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Transaction ID</span>
            <button
              onClick={copyTxnId}
              className="font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
            >
              <span>{transaction.transactionId}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Timestamp</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatDate(transaction.createdAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Payment Type</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {transaction.type}
            </span>
          </div>

          {transaction.sender && (
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Sender</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {transaction.sender.name || 'Self'} ({transaction.sender.upiId || 'N/A'})
              </span>
            </div>
          )}

          {transaction.receiver && (
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Receiver</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {transaction.receiver.name || 'Self'} ({transaction.receiver.upiId || 'N/A'})
              </span>
            </div>
          )}

          {transaction.note && (
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Reference Note</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 italic">
                "{transaction.note}"
              </span>
            </div>
          )}

          {transaction.riskScore > 0 && (
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Fraud Risk Score</span>
              <Badge variant={transaction.riskLevel === 'HIGH' ? 'danger' : transaction.riskLevel === 'MEDIUM' ? 'warning' : 'default'} size="sm">
                {transaction.riskScore}% ({transaction.riskLevel})
              </Badge>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={downloadReceipt}
            className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Receipt</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
