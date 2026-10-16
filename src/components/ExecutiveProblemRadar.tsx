import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Scale,
  Headphones,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Filter,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { ProblemItem, ProblemCategory } from '../types';

interface ExecutiveProblemRadarProps {
  problems: ProblemItem[];
  onUpdateProblemStatus: (id: string, status: 'open' | 'in_progress' | 'resolved') => void;
  onAddProblem: (problem: Omit<ProblemItem, 'id' | 'identifiedDate'>) => void;
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: () => void;
  stats: {
    totalInvoiced: number;
    draftInvoicesCount: number;
    totalAROutstanding: number;
    overdueARAmount: number;
    urgentTicketsCount: number;
    upcomingRegulationsCount: number;
    pendingLeavesCount: number;
    coverageRisksCount: number;
  };
}

export const ExecutiveProblemRadar: React.FC<ExecutiveProblemRadarProps> = ({
  problems,
  onUpdateProblemStatus,
  onAddProblem,
  onNavigateTab,
  onOpenReportModal,
  stats,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New problem form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProblemCategory>('invoicing');
  const [newSeverity, setNewSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newMetricImpact, setNewMetricImpact] = useState('');

  const filteredProblems = problems.filter((prob) => {
    if (selectedCategory !== 'all' && prob.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && prob.severity !== selectedSeverity) return false;
    return true;
  });

  const categoryMap: Record<ProblemCategory, { label: string; tab: string; icon: any }> = {
    invoicing: { label: 'Invoicing', tab: 'invoices', icon: FileText },
    ar: { label: 'Accounts Receivable', tab: 'ar', icon: DollarSign },
    regulations: { label: 'Regulations', tab: 'regulations', icon: Scale },
    customerService: { label: 'Customer Service', tab: 'customerService', icon: Headphones },
    manpower: { label: 'Manpower Leave', tab: 'manpower', icon: Users },
  };

  const handleCreateProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddProblem({
      category: newCategory,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Logged via Executive Radar.',
      severity: newSeverity,
      status: 'open',
      assignee: newAssignee.trim() || 'Operations Lead',
      metricImpact: newMetricImpact.trim() || undefined,
    });

    setNewTitle('');
    setNewDescription('');
    setNewAssignee('');
    setNewMetricImpact('');
    setIsAddModalOpen(false);
  };

  const criticalCount = problems.filter((p) => p.severity === 'critical' && p.status !== 'resolved').length;
  const highCount = problems.filter((p) => p.severity === 'high' && p.status !== 'resolved').length;
  const unresolvedTotal = problems.filter((p) => p.status !== 'resolved').length;

  return (
    <div className="space-y-8">
      {/* Executive Welcome & Telemetry Strip */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Centralized Problem Management & Intelligence</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{unresolvedTotal} Active Operational Items</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Operations Health & Problem Tracking Radar
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Real-time monitoring across all 5 operational pillars identified in your executive whiteboard.
              Track bottlenecks, coordinate cross-functional resolutions, and generate executive reports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>Log Problem</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Run Executive Briefing</span>
            </button>
          </div>
        </div>

        {/* 5 Core Domain KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-6">
          {/* 1. Invoices */}
          <div
            onClick={() => onNavigateTab('invoices')}
            className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">1. Issue Invoices</span>
              <FileText className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
              ${stats.totalInvoiced.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>{stats.draftInvoicesCount} drafts to issue</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 2. AR Status */}
          <div
            onClick={() => onNavigateTab('ar')}
            className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">2. Monitor AR Status</span>
              <DollarSign className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-rose-700">
              ${stats.overdueARAmount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>overdue &gt;15 days</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 3. Regulations */}
          <div
            onClick={() => onNavigateTab('regulations')}
            className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">3. Regulations</span>
              <Scale className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {stats.upcomingRegulationsCount} Deadlines
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Next filing in 15 days</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 4. Customer Service */}
          <div
            onClick={() => onNavigateTab('customerService')}
            className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">4. Customer Service</span>
              <Headphones className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-700">
              {stats.urgentTicketsCount} Urgent
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>1.5 hrs SLA remaining</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 5. Manpower Leave */}
          <div
            onClick={() => onNavigateTab('manpower')}
            className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">5. Manpower Leave</span>
              <Users className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {stats.coverageRisksCount} Overlap
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>{stats.pendingLeavesCount} pending approval</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Domain Problem Tracking Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filter Controls Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Centralized Operational Problems Log
            </h2>
            <p className="text-xs text-slate-500">
              Live status, severity escalation, and cross-functional ownership across operations
            </p>
          </div>

          {/* Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {['all', 'invoicing', 'ar', 'regulations', 'customerService', 'manpower'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all'
                    ? 'All Areas'
                    : cat === 'customerService'
                    ? 'Support'
                    : cat === 'manpower'
                    ? 'Leave'
                    : cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {['all', 'critical', 'high', 'medium'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer capitalize whitespace-nowrap ${
                    selectedSeverity === sev
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems List Table / Rows */}
        <div className="divide-y divide-slate-100">
          {filteredProblems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No problems match the selected filters. All systems within threshold.
            </div>
          ) : (
            filteredProblems.map((prob) => {
              const categoryInfo = categoryMap[prob.category];
              const Icon = categoryInfo.icon;

              return (
                <div
                  key={prob.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    prob.status === 'resolved' ? 'bg-slate-50/50 opacity-60' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        {categoryInfo.label}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span
                        className={`font-mono uppercase font-bold text-[11px] ${
                          prob.severity === 'critical'
                            ? 'text-rose-700'
                            : prob.severity === 'high'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {prob.severity}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-mono tabular-nums">Logged {prob.identifiedDate}</span>
                      {prob.metricImpact && (
                        <>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-slate-900 font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {prob.metricImpact}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className={`text-sm sm:text-base font-bold ${prob.status === 'resolved' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {prob.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {prob.description}
                    </p>
                    <div className="text-xs text-slate-500 pt-0.5">
                      <span className="font-medium text-slate-700">Assignee:</span> {prob.assignee}
                    </div>
                  </div>

                  {/* Actions Zone */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                    {/* Status Dropdown / Action */}
                    <div className="flex items-center gap-1">
                      {prob.status !== 'resolved' ? (
                        <>
                          <button
                            onClick={() => onUpdateProblemStatus(prob.id, prob.status === 'in_progress' ? 'open' : 'in_progress')}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            {prob.status === 'in_progress' ? 'Set Open' : 'Mark In Progress'}
                          </button>
                          <button
                            onClick={() => onUpdateProblemStatus(prob.id, 'resolved')}
                            className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onUpdateProblemStatus(prob.id, 'open')}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}
                    </div>

                    {/* Deep link into specific operational tool */}
                    <button
                      onClick={() => onNavigateTab(categoryInfo.tab)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Strategic Operational Map: From 5 Whiteboard Sticky Notes to Centralized Report */}
      <div className="bg-slate-900 text-white rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white">
              Whiteboard Problem Architecture & Solution Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How CentraOps connects each problem identified on your board into one unified management loop
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <span>Trigger Full Executive Digest</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <div className="text-amber-400 font-semibold font-mono text-[11px]">PROBLEM 1</div>
            <div className="font-bold text-white text-sm">Issue Invoices</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Automated line-item generation, milestone billing drafts, and multi-currency invoicing.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <div className="text-amber-400 font-semibold font-mono text-[11px]">PROBLEM 2</div>
            <div className="font-bold text-white text-sm">Monitor AR Status</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Aging buckets (1-30d, 31-60d, 60+d) with AI payment reminder notices and cashflow forecasting.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <div className="text-amber-400 font-semibold font-mono text-[11px]">PROBLEM 3</div>
            <div className="font-bold text-white text-sm">Understand Regulations</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Statutory calendar, plain-English legal query explainer, and corporate tax compliance checks.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <div className="text-amber-400 font-semibold font-mono text-[11px]">PROBLEM 4</div>
            <div className="font-bold text-white text-sm">Customer Service</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Priority email queue, SLA countdowns, and context-aware smart response generation.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <div className="text-amber-400 font-semibold font-mono text-[11px]">PROBLEM 5</div>
            <div className="font-bold text-white text-sm">Manpower Leave</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Employee leave balances, 1-click approvals, and department overlap risk prevention.
            </p>
          </div>
        </div>
      </div>

      {/* Log Problem Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Log New Operational Problem
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new bottleneck or incident to the executive tracking matrix
            </p>

            <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Problem Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics Payment Overdue"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operational Domain
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProblemCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                  >
                    <option value="invoicing">Issue Invoices</option>
                    <option value="ar">Monitor AR Status</option>
                    <option value="regulations">Understand Regulations</option>
                    <option value="customerService">Customer Service Email/Tickets</option>
                    <option value="manpower">Manpower Leave Management</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Problem Context & Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the operational impact and blockers..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assignee / Lead
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Elena Rostova (Finance)"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Metric Impact (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $14,200 locked / 1.5h SLA"
                    value={newMetricImpact}
                    onChange={(e) => setNewMetricImpact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
