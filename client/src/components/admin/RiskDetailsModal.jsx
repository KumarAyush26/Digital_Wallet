import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, UserX, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const RiskDetailsModal = ({ isOpen, onClose, transaction, onReview, onFreezeUser }) => {
  const [reviewing, setReviewing] = useState(false);

  if (!transaction) return null;

  const handleReviewAction = async (action) => {
    try {
      setReviewing(true);
      await onReview(transaction._id, action);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fraud Detection Risk Inspector">
      <div className="space-y-4">
        {/* Risk Score Pill */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">Risk Score Evaluation</p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {transaction.riskScore}% — {transaction.riskLevel} RISK
              </h4>
            </div>
          </div>
          <Badge variant={transaction.riskLevel === 'HIGH' ? 'danger' : 'warning'} size="md">
            {transaction.riskLevel}
          </Badge>
        </div>

        {/* Transaction Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Transaction ID:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{transaction.transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Sender:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{transaction.sender?.name} ({transaction.sender?.upiId})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Receiver:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{transaction.receiver?.name} ({transaction.receiver?.upiId})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Time:</span>
            <span>{formatDate(transaction.createdAt)}</span>
          </div>
        </div>

        {/* Risk Trigger Reasons Breakdown */}
        <div>
          <h5 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
            Engine Anomaly Triggered Reasons:
          </h5>
          <div className="space-y-1.5">
            {transaction.riskReasons && transaction.riskReasons.length > 0 ? (
              transaction.riskReasons.map((reason, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No specific risk reasons recorded.</p>
            )}
          </div>
        </div>

        {/* Admin Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => handleReviewAction('APPROVE')}
            disabled={reviewing}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Legitimate</span>
          </button>

          {transaction.sender && (
            <button
              onClick={() => onFreezeUser(transaction.sender._id)}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <UserX className="w-4 h-4" />
              <span>Freeze Sender</span>
            </button>
          )}

          <button
            onClick={() => handleReviewAction('DISMISS')}
            disabled={reviewing}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Modal>
  );
};
