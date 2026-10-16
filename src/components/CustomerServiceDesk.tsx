import React, { useState } from 'react';
import {
  Headphones,
  Mail,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  User,
  ArrowRight,
  Copy,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { CustomerTicket, TicketResponse } from '../types';

interface CustomerServiceDeskProps {
  tickets: CustomerTicket[];
  onAddTicket: (ticket: CustomerTicket) => void;
  onUpdateTicket: (updated: CustomerTicket) => void;
}

export const CustomerServiceDesk: React.FC<CustomerServiceDeskProps> = ({
  tickets,
  onAddTicket,
  onUpdateTicket,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  // Smart reply generator states
  const [replyTone, setReplyTone] = useState<'supportive' | 'formal' | 'concise' | 'apologetic'>('supportive');
  const [replyDraft, setReplyDraft] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [replySentiment, setReplySentiment] = useState<string>('');

  // New ticket state
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const urgentCount = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length;
  const openCount = tickets.filter((t) => t.status === 'open').length;

  const handleGenerateAiReply = async () => {
    if (!selectedTicket) return;
    setIsGeneratingReply(true);
    try {
      const res = await fetch('/api/customer-service/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: selectedTicket.customerName,
          subject: selectedTicket.subject,
          inquiry: selectedTicket.initialMessage,
          tone: replyTone,
          companyContext: `Client Company: ${selectedTicket.company}. Internal notes: ${selectedTicket.internalNotes}`,
        }),
      });
      const data = await res.json();
      setReplyDraft(data.body);
      setReplySentiment(data.sentiment || 'Professional');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyDraft.trim()) return;

    const newResponse: TicketResponse = {
      id: `resp-${Date.now()}`,
      sender: 'agent',
      message: replyDraft.trim(),
      timestamp: '2026-10-16 10:45',
    };

    const updated: CustomerTicket = {
      ...selectedTicket,
      status: 'in_progress',
      responses: [...selectedTicket.responses, newResponse],
    };

    onUpdateTicket(updated);
    setReplyDraft('');
  };

  const handleToggleResolved = () => {
    if (!selectedTicket) return;
    const newStatus = selectedTicket.status === 'resolved' ? 'open' : 'resolved';
    onUpdateTicket({
      ...selectedTicket,
      status: newStatus,
    });
  };

  const handleCreateNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newSubject.trim()) return;

    const newTicket: CustomerTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `CS-${Math.floor(850 + Math.random() * 100)}`,
      customerName: newCustName.trim(),
      customerEmail: newCustEmail.trim() || 'customer@client.com',
      company: newCompany.trim() || 'Client Org',
      subject: newSubject.trim(),
      initialMessage: newMessage.trim(),
      status: 'open',
      priority: newPriority,
      slaHoursRemaining: newPriority === 'urgent' ? 2.0 : newPriority === 'high' ? 6.0 : 24.0,
      createdAt: '2026-10-16 10:30',
      responses: [],
      assignedAgent: 'Sarah Jenkins',
      internalNotes: 'Logged via customer desk.',
    };

    onAddTicket(newTicket);
    setIsNewTicketOpen(false);
    setSelectedTicketId(newTicket.id);

    // Reset
    setNewCustName('');
    setNewCustEmail('');
    setNewCompany('');
    setNewSubject('');
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
            Whiteboard Focus 4: Customer Service - Reply Email + Tracking
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-amber-950">
            Customer Service Email & Ticket Desk
          </h2>
          <p className="text-sm text-amber-900/80 mt-0.5">
            Omnichannel customer inquiry tracking, strict SLA counters, and AI contextual email reply assistance.
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl border border-amber-500/50 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Customer Inquiry</span>
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#fffef9] rounded-xl border border-amber-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
            Active Open Inquiries
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-950">
            {openCount} Tickets
          </div>
          <div className="text-xs text-amber-800/80 mt-1">Requiring team response</div>
        </div>

        <div className="p-4 bg-[#fffef9] rounded-xl border border-amber-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">
            Urgent SLA Watch
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            {urgentCount} Critical
          </div>
          <div className="text-xs text-amber-800/80 mt-1">&lt;2 hours before contractual breach</div>
        </div>

        <div className="p-4 bg-[#fffef9] rounded-xl border border-amber-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
            Resolved This Week
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {tickets.filter((t) => t.status === 'resolved').length} Settled
          </div>
          <div className="text-xs text-amber-800/80 mt-1">Average resolution time: 3.4 hrs</div>
        </div>
      </div>

      {/* Split Queue & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ticket Queue List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[700px]">
          {/* Filter Bar */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Inbox Queue
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium">
              {['all', 'open', 'in_progress', 'resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2 py-0.5 rounded cursor-pointer capitalize transition-colors ${
                    filterStatus === s
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredTickets.map((t) => {
              const isSelected = t.id === selectedTicket?.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicketId(t.id);
                    setReplyDraft('');
                  }}
                  className={`p-4 transition-colors cursor-pointer ${
                    isSelected ? 'bg-slate-100/90 border-l-3 border-slate-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${
                        t.priority === 'urgent'
                          ? 'text-rose-700'
                          : t.priority === 'high'
                          ? 'text-amber-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {t.subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                    {t.initialMessage}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100/60">
                    <span className="font-medium text-slate-700 truncate max-w-[140px]">{t.customerName} ({t.company})</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {t.status === 'resolved' ? (
                        <span className="text-emerald-700 font-semibold">Resolved</span>
                      ) : (
                        <span className={t.slaHoursRemaining < 3 ? 'text-rose-700 font-semibold' : ''}>
                          {t.slaHoursRemaining}h SLA
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Ticket Detail & AI Reply Studio */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 flex flex-col h-[700px] overflow-hidden">
          {selectedTicket ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Ticket Top bar */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-mono font-semibold text-slate-900">{selectedTicket.ticketNumber}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700">{selectedTicket.company}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">Logged {selectedTicket.createdAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedTicket.subject}
                  </h3>
                  <div className="text-xs text-slate-600 mt-0.5">
                    From: <span className="font-semibold text-slate-900">{selectedTicket.customerName}</span> &lt;{selectedTicket.customerEmail}&gt;
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleResolved}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedTicket.status === 'resolved' ? 'Reopen Ticket' : 'Mark Resolved'}</span>
                  </button>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* Internal Operational Note Warning */}
                {selectedTicket.internalNotes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">
                      Internal Cross-Functional Context:
                    </span>
                    {selectedTicket.internalNotes}
                  </div>
                )}

                {/* Original Customer Message */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">{selectedTicket.customerName}</span>
                    <span className="font-mono tabular-nums">{selectedTicket.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.initialMessage}
                  </p>
                </div>

                {/* Conversation History */}
                {selectedTicket.responses.map((resp) => (
                  <div
                    key={resp.id}
                    className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 ml-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {resp.sender === 'agent' ? `${selectedTicket.assignedAgent} (CentraOps)` : selectedTicket.customerName}
                      </span>
                      <span className="font-mono tabular-nums">{resp.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {resp.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI Smart Reply Generator & Dispatch Bar */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold text-slate-800">AI Smart Reply Assistant</span>
                    <div className="flex items-center gap-1 pl-2">
                      {[
                        { id: 'supportive', label: 'Supportive' },
                        { id: 'formal', label: 'Formal' },
                        { id: 'concise', label: 'Concise' },
                        { id: 'apologetic', label: 'Resolution' },
                      ].map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setReplyTone(tone.id as any)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                            replyTone === tone.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAiReply}
                    disabled={isGeneratingReply}
                    className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{isGeneratingReply ? 'Generating...' : 'Auto-Draft Response'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Type custom response or click 'Auto-Draft Response' above..."
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      {replySentiment && <span>Detected Tone: <b>{replySentiment}</b> · </span>}
                      Assigned Lead: {selectedTicket.assignedAgent}
                    </div>

                    <button
                      onClick={handleSendReply}
                      disabled={!replyDraft.trim()}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send & Log Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">
              Select a customer ticket from the inbox queue to view conversation.
            </div>
          )}
        </div>
      </div>

      {/* Log Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Log Customer Email / Inquiry
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter customer request details to track response SLA and draft replies
            </p>

            <form onSubmit={handleCreateNewTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Adams"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rachel@apex.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="urgent">Urgent (&lt;2 hr SLA)</option>
                    <option value="high">High (&lt;6 hr SLA)</option>
                    <option value="medium">Medium (&lt;24 hr SLA)</option>
                    <option value="low">Low (&lt;48 hr SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of customer issue or question"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Inquiry Body</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste email text or call summary..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Log & Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
