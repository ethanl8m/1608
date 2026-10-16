import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles,
  Copy,
  Check,
  X,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { ARRecord } from '../types';

interface ARTrackerProps {
  records: ARRecord[];
  onUpdateRecord: (updated: ARRecord) => void;
  onRecordPayment: (id: string, amount: number) => void;
}

export const ARTracker: React.FC<ARTrackerProps> = ({
  records,
  onUpdateRecord,
  onRecordPayment,
}) => {
  const [activeAgingFilter, setActiveAgingFilter] = useState<'all' | 'current' | '1-30' | '31-60' | '60+'>('all');
  const [selectedRecordForReminder, setSelectedRecordForReminder] = useState<ARRecord | null>(null);
  const [reminderTone, setReminderTone] = useState<'gentle' | 'firm' | 'urgent'>('firm');
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);
  const [generatedReminder, setGeneratedReminder] = useState<{ subject: string; emailBody: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Partial payment modal
  const [paymentRecord, setPaymentRecord] = useState<ARRecord | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');

  const totalOutstanding = records
    .filter((r) => r.status !== 'collected')
    .reduce((sum, r) => sum + (r.amount - r.amountPaid), 0);

  const currentBucketTotal = records
    .filter((r) => r.agingBucket === 'current' && r.status !== 'collected')
    .reduce((sum, r) => sum + (r.amount - r.amountPaid), 0);

  const bucket1To30Total = records
    .filter((r) => r.agingBucket === '1-30' && r.status !== 'collected')
    .reduce((sum, r) => sum + (r.amount - r.amountPaid), 0);

  const bucket31To60Total = records
    .filter((r) => r.agingBucket === '31-60' && r.status !== 'collected')
    .reduce((sum, r) => sum + (r.amount - r.amountPaid), 0);

  const overdueTotal = records
    .filter((r) => r.daysOverdue > 0 && r.status !== 'collected')
    .reduce((sum, r) => sum + (r.amount - r.amountPaid), 0);

  const filteredRecords = records.filter((rec) => {
    if (activeAgingFilter === 'all') return true;
    return rec.agingBucket === activeAgingFilter;
  });

  const handleOpenReminderModal = (rec: ARRecord) => {
    setSelectedRecordForReminder(rec);
    const initialTone = rec.daysOverdue > 30 ? 'urgent' : rec.daysOverdue > 7 ? 'firm' : 'gentle';
    setReminderTone(initialTone);
    setGeneratedReminder(null);
  };

  const handleGenerateReminder = async () => {
    if (!selectedRecordForReminder) return;
    setIsGeneratingReminder(true);
    try {
      const res = await fetch('/api/ar/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: selectedRecordForReminder.clientName,
          invoiceNumber: selectedRecordForReminder.invoiceNumber,
          amount: selectedRecordForReminder.amount - selectedRecordForReminder.amountPaid,
          daysOverdue: selectedRecordForReminder.daysOverdue,
          tone: reminderTone,
        }),
      });
      const data = await res.json();
      setGeneratedReminder({ subject: data.subject, emailBody: data.emailBody });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReminder(false);
    }
  };

  const handleConfirmReminderDispatched = () => {
    if (!selectedRecordForReminder) return;
    const updated: ARRecord = {
      ...selectedRecordForReminder,
      lastContactDate: '2026-10-16',
      status: 'follow_up_needed',
      notes: `Dispatched ${reminderTone} payment reminder on 2026-10-16.`,
    };
    onUpdateRecord(updated);
    setSelectedRecordForReminder(null);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRecord) return;
    const amountNum = parseFloat(paymentAmountInput);
    if (isNaN(amountNum) || amountNum <= 0) return;

    onRecordPayment(paymentRecord.id, amountNum);
    setPaymentRecord(null);
    setPaymentAmountInput('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Whiteboard Focus 2: Monitor AR Payment Status
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Accounts Receivable & Cashflow Aging
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time debtor aging analysis, automated follow-up scheduling, and payment reconciliations.
          </p>
        </div>
      </div>

      {/* AR Aging Waterfall Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Outstanding AR
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            ${totalOutstanding.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {records.filter((r) => r.status !== 'collected').length} active debtor accounts
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Current (&lt;30d)
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            ${currentBucketTotal.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Within standard credit terms</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
            1 - 30 Days Overdue
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            ${bucket1To30Total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">First reminder window</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
            31 - 60+ Days Overdue
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            ${bucket31To60Total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">High collections priority</div>
        </div>
      </div>

      {/* Aging Filters */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        {[
          { id: 'all', label: 'All Accounts' },
          { id: 'current', label: 'Current Terms' },
          { id: '1-30', label: '1-30 Days Past Due' },
          { id: '31-60', label: '31-60 Days Past Due' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAgingFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeAgingFilter === tab.id
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* AR Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Debtor Account</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Aging</th>
                <th className="py-3 px-4">Collections Status</th>
                <th className="py-3 px-4">Last Contact</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No accounts found in this aging category.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const remaining = rec.amount - rec.amountPaid;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{rec.clientName}</div>
                        <div className="text-[11px] text-slate-500">{rec.contactEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {rec.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                        {rec.dueDate}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${remaining.toLocaleString()}
                        {rec.amountPaid > 0 && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            Paid: ${rec.amountPaid.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {rec.daysOverdue > 0 ? (
                          <span
                            className={`font-mono font-bold text-xs ${
                              rec.daysOverdue > 30 ? 'text-rose-700' : 'text-amber-700'
                            }`}
                          >
                            +{rec.daysOverdue}d overdue
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 text-xs">On Schedule</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold capitalize text-xs ${
                            rec.status === 'collected'
                              ? 'text-emerald-700'
                              : rec.status === 'follow_up_needed'
                              ? 'text-rose-700'
                              : rec.status === 'promised_to_pay'
                              ? 'text-amber-700'
                              : 'text-slate-700'
                          }`}
                        >
                          {rec.status.replace(/_/g, ' ')}
                        </span>
                        {rec.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs" title={rec.notes}>
                            {rec.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500">
                        {rec.lastContactDate || 'None'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.status !== 'collected' && (
                            <>
                              <button
                                onClick={() => handleOpenReminderModal(rec)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                <span>Remind</span>
                              </button>
                              <button
                                onClick={() => {
                                  setPaymentRecord(rec);
                                  setPaymentAmountInput(String(remaining));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              >
                                Log Pay
                              </button>
                            </>
                          )}
                          {rec.status === 'collected' && (
                            <span className="text-xs text-emerald-700 font-medium">Reconciled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Automated Payment Reminder Modal */}
      {selectedRecordForReminder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AI Payment Reminder Dispatcher
                </h3>
                <p className="text-xs text-slate-500">
                  Compose context-aware reminder for {selectedRecordForReminder.clientName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForReminder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Invoice Number:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedRecordForReminder.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Past Due:</span>
                  <span className="font-mono font-bold text-rose-700">+{selectedRecordForReminder.daysOverdue} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Balance Pending:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ${(selectedRecordForReminder.amount - selectedRecordForReminder.amountPaid).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Recipient Email:</span>
                  <span className="text-slate-700 font-mono">{selectedRecordForReminder.contactEmail}</span>
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Notice Tone & Escalation Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gentle', label: 'Gentle Courtesy', desc: '1-7 days past due' },
                    { id: 'firm', label: 'Firm Notice', desc: '8-30 days past due' },
                    { id: 'urgent', label: 'Final Demand', desc: '30+ days past due' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setReminderTone(t.id as any);
                        setGeneratedReminder(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                        reminderTone === t.id
                          ? 'border-slate-900 bg-slate-50 text-slate-900'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{t.label}</div>
                      <div className="text-[10px] text-slate-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft Box */}
              {!generatedReminder ? (
                <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-slate-500 mb-2">
                    Generate an official, professional reminder drafted for this debtor.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateReminder}
                    disabled={isGeneratingReminder}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isGeneratingReminder ? 'Drafting Notice...' : 'Generate Reminder Draft'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={generatedReminder.subject}
                      onChange={(e) => setGeneratedReminder({ ...generatedReminder, subject: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Body</label>
                    <textarea
                      rows={6}
                      value={generatedReminder.emailBody}
                      onChange={(e) => setGeneratedReminder({ ...generatedReminder, emailBody: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs leading-relaxed font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Subject: ${generatedReminder.subject}\n\n${generatedReminder.emailBody}`
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Message'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmReminderDispatched}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                    >
                      Log Notice Dispatched
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Record Incoming Payment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Reconcile funds for {paymentRecord.clientName} ({paymentRecord.invoiceNumber})
            </p>

            <form onSubmit={handleExecutePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-base font-bold text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Remaining balance: ${(paymentRecord.amount - paymentRecord.amountPaid).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentRecord(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
