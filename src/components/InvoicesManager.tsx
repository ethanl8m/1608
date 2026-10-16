import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Printer,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';

interface InvoicesManagerProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (id: string, status: 'draft' | 'issued' | 'paid' | 'overdue') => void;
}

export const InvoicesManager: React.FC<InvoicesManagerProps> = ({
  invoices,
  onAddInvoice,
  onUpdateInvoiceStatus,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'issued' | 'overdue' | 'paid'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [notes, setNotes] = useState('Payment due via corporate wire within 30 days of issuance.');
  const [taxRate, setTaxRate] = useState(0.08);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Enterprise Platform License - Q4', quantity: 1, unitPrice: 4500, amount: 4500 },
  ]);

  // AI scope estimator state
  const [aiScopeInput, setAiScopeInput] = useState('');
  const [isAiEstimating, setIsAiEstimating] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === 'all') return true;
    return inv.status === activeFilter;
  });

  const totalBilled = invoices
    .filter((inv) => inv.status !== 'draft')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const draftValue = invoices
    .filter((inv) => inv.status === 'draft')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const overdueValue = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 500,
      amount: 500,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            const qty = field === 'quantity' ? Number(value) || 0 : item.quantity;
            const price = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
            updated.amount = qty * price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0);
  const subtotal = calculateSubtotal();
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  const handleAiEstimate = async () => {
    if (!aiScopeInput.trim()) return;
    setIsAiEstimating(true);
    try {
      const res = await fetch('/api/invoices/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scopeDescription: aiScopeInput }),
      });
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const generatedItems: InvoiceItem[] = data.items.map((it: any, index: number) => ({
          id: String(Date.now() + index),
          description: it.description || 'Deliverable Milestone',
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 1000,
          amount: (it.quantity || 1) * (it.unitPrice || 1000),
        }));
        setItems(generatedItems);
      }
      if (data.clientName && !clientName) setClientName(data.clientName);
      if (data.notes) setNotes(data.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiEstimating(false);
    }
  };

  const handleSubmitInvoice = (e: React.FormEvent, status: 'draft' | 'issued') => {
    e.preventDefault();
    if (!clientName.trim() || items.length === 0) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || 'billing@client.com',
      issueDate: '2026-10-16',
      dueDate: dueDate || '2026-11-15',
      status: status,
      currency: 'USD',
      items: items,
      subtotal: subtotal,
      taxRate: taxRate,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      notes: notes,
    };

    onAddInvoice(newInvoice);
    setIsCreateModalOpen(false);
    // Reset form
    setClientName('');
    setClientEmail('');
    setAiScopeInput('');
    setItems([{ id: '1', description: 'Consulting & Deliverables', quantity: 1, unitPrice: 2500, amount: 2500 }]);
  };

  return (
    <div className="space-y-6">
      {/* Header and KPI strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Whiteboard Focus 1: Issue Invoices
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoicing & Billing Pipeline
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Create, issue, and manage client billings with automated line-item estimation and status tracking.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create & Issue Invoice</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Invoiced (Active/Issued)
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            ${totalBilled.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {invoices.filter((i) => i.status !== 'draft').length} issued accounts
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Drafts Pending Issuance
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            ${draftValue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {invoices.filter((i) => i.status === 'draft').length} invoices ready for review
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Overdue Balance
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            ${overdueValue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {invoices.filter((i) => i.status === 'overdue').length} past-due invoices
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        {[
          { id: 'all', label: 'All Invoices' },
          { id: 'draft', label: 'Drafts' },
          { id: 'issued', label: 'Issued (Current)' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'paid', label: 'Paid & Settled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No invoices found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{inv.clientName}</div>
                      <div className="text-[11px] text-slate-500">{inv.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                      {inv.issueDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right tabular-nums">
                      ${inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold capitalize text-xs ${
                          inv.status === 'paid'
                            ? 'text-emerald-700'
                            : inv.status === 'overdue'
                            ? 'text-rose-700'
                            : inv.status === 'issued'
                            ? 'text-slate-800'
                            : 'text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => onUpdateInvoiceStatus(inv.id, 'issued')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Issue
                          </button>
                        )}
                        {inv.status !== 'paid' && inv.status !== 'draft' && (
                          <button
                            onClick={() => onUpdateInvoiceStatus(inv.id, 'paid')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          View / Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create & Issue Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Issue New Invoice</h3>
                <p className="text-xs text-slate-500">
                  Itemize deliverables, compute statutory tax, and issue to client
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Scope Assistant Box */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  AI Line-Item Scope Estimator
                </span>
                <span className="text-slate-500 font-normal">Optional</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Q4 Cloud migration, security audit and 15 hours DevOps support"
                  value={aiScopeInput}
                  onChange={(e) => setAiScopeInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAiEstimate}
                  disabled={isAiEstimating || !aiScopeInput.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                >
                  {isAiEstimating ? 'Estimating...' : 'Auto-Generate'}
                </button>
              </div>
            </div>

            <form className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexus Technology Corp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Email</label>
                  <input
                    type="email"
                    required
                    placeholder="accounts@nexuscorp.io"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxRate * 100}
                    onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Invoice Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center gap-2 bg-white">
                      <input
                        type="text"
                        placeholder="Item description / service"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-300 rounded text-xs text-right font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                        className="w-24 px-2 py-1.5 border border-slate-300 rounded text-xs text-right font-mono"
                      />
                      <span className="w-24 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        ${item.amount.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-right">
                  <div className="text-slate-600">
                    Subtotal: <span className="font-mono font-semibold tabular-nums">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="text-slate-600">
                    Tax ({(taxRate * 100).toFixed(0)}%): <span className="font-mono font-semibold tabular-nums">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    Total: <span className="font-mono text-base tabular-nums">${totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes & Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmitInvoice(e, 'draft')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmitInvoice(e, 'issued')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                  Issue Immediately
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice View Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 border border-slate-200 print:border-none print:shadow-none">
            <div className="flex justify-between items-start pb-6 border-b border-slate-200 mb-6">
              <div>
                <div className="text-xl font-bold tracking-tight text-slate-900">CENTRAOPS CORP</div>
                <div className="text-xs text-slate-500 mt-1">
                  100 Operations Plaza, Suite 400<br />
                  contact@centraops.internal · (800) 555-0199
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">INVOICE</div>
                <div className="text-xs font-mono font-semibold text-slate-700 mt-0.5">
                  #{selectedInvoiceForPrint.invoiceNumber}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Status: <span className="uppercase font-semibold text-slate-900">{selectedInvoiceForPrint.status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Billed To:</span>
                <div className="font-bold text-slate-900 text-sm">{selectedInvoiceForPrint.clientName}</div>
                <div className="text-slate-600">{selectedInvoiceForPrint.clientEmail}</div>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="text-slate-500 font-medium">Issue Date:</span>{' '}
                  <span className="font-mono tabular-nums text-slate-900">{selectedInvoiceForPrint.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Payment Due:</span>{' '}
                  <span className="font-mono tabular-nums font-bold text-slate-900">{selectedInvoiceForPrint.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceForPrint.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-3 text-slate-800">{it.description}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">${it.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">${it.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-between items-start text-xs mb-6">
              <div className="max-w-xs text-slate-500">
                <span className="font-semibold text-slate-700 block mb-1">Payment Instructions:</span>
                <p>{selectedInvoiceForPrint.notes || 'Payment via wire transfer within standard terms.'}</p>
              </div>
              <div className="w-56 space-y-1 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums font-semibold">${selectedInvoiceForPrint.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({(selectedInvoiceForPrint.taxRate * 100).toFixed(0)}%):</span>
                  <span className="font-mono tabular-nums font-semibold">${selectedInvoiceForPrint.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="font-mono tabular-nums">${selectedInvoiceForPrint.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Print Footer Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
