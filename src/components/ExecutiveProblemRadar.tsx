import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Scale,
  Headphones,
  Users,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Sun,
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

  const unresolvedTotal = problems.filter((p) => p.status !== 'resolved').length;

  return (
    <div className="space-y-8">
      {/* Botanical Floral Hero Banner & Executive Radar */}
      <div className="bg-[#fffef9] rounded-2xl border border-amber-200/90 shadow-sm overflow-hidden">
        {/* Flower Header Showcase Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-amber-200/70">
          {/* Left Text Zone */}
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Centralized Problem Command · Golden Sun Operations</span>
                <span>·</span>
                <span className="font-mono tabular-nums bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[11px]">
                  {unresolvedTotal} Active Items
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-950 leading-tight">
                Operations Health & Problem Tracking Radar
              </h1>
              <p className="text-sm text-amber-900/80 mt-2 max-w-2xl leading-relaxed">
                Harmonizing all 5 operational pillars identified in your executive whiteboard into a bright, organized command center. Track risks, resolve bottlenecks, and generate comprehensive executive briefings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6">
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 border border-amber-500/60 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>Run Executive Briefing</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-200 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                <span>Log New Problem</span>
              </button>
            </div>
          </div>

          {/* Right Flower Image Showcase with Warm Radial Scrim */}
          <div className="lg:col-span-4 relative min-h-[220px] lg:min-h-full overflow-hidden bg-amber-100/50">
            <img
              src="/src/assets/images/flower_yellow_banner_1792146756654.jpg"
              alt="Golden Sunflowers and Mimosa Bouquet"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-transparent flex items-end p-4">
              <div className="text-white text-xs font-medium backdrop-blur-xs bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-400/30">
                Fresh Sunlight · Daily Operations Flourishing
              </div>
            </div>
          </div>
        </div>

        {/* 5 Core Domain KPI Tiles with Warm Yellow/Amber Accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-6 bg-[#fffcf2]">
          {/* 1. Invoices */}
          <div
            onClick={() => onNavigateTab('invoices')}
            className="p-4 rounded-xl bg-white hover:bg-amber-50/80 transition-all border border-amber-200/80 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">1. Issue Invoices</span>
              <FileText className="w-4 h-4 text-amber-600 group-hover:text-amber-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-950">
              ${stats.totalInvoiced.toLocaleString()}
            </div>
            <div className="text-xs text-amber-800/80 mt-1 flex items-center justify-between">
              <span>{stats.draftInvoicesCount} drafts to issue</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-700" />
            </div>
          </div>

          {/* 2. AR Status */}
          <div
            onClick={() => onNavigateTab('ar')}
            className="p-4 rounded-xl bg-white hover:bg-amber-50/80 transition-all border border-amber-200/80 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">2. Monitor AR Status</span>
              <DollarSign className="w-4 h-4 text-amber-600 group-hover:text-amber-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-rose-700">
              ${stats.overdueARAmount.toLocaleString()}
            </div>
            <div className="text-xs text-amber-800/80 mt-1 flex items-center justify-between">
              <span>overdue &gt;15 days</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-700" />
            </div>
          </div>

          {/* 3. Regulations */}
          <div
            onClick={() => onNavigateTab('regulations')}
            className="p-4 rounded-xl bg-white hover:bg-amber-50/80 transition-all border border-amber-200/80 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">3. Regulations</span>
              <Scale className="w-4 h-4 text-amber-600 group-hover:text-amber-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-950">
              {stats.upcomingRegulationsCount} Deadlines
            </div>
            <div className="text-xs text-amber-800/80 mt-1 flex items-center justify-between">
              <span>Next filing in 15 days</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-700" />
            </div>
          </div>

          {/* 4. Customer Service */}
          <div
            onClick={() => onNavigateTab('customerService')}
            className="p-4 rounded-xl bg-white hover:bg-amber-50/80 transition-all border border-amber-200/80 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">4. Customer Service</span>
              <Headphones className="w-4 h-4 text-amber-600 group-hover:text-amber-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-800">
              {stats.urgentTicketsCount} Urgent
            </div>
            <div className="text-xs text-amber-800/80 mt-1 flex items-center justify-between">
              <span>1.5 hrs SLA remaining</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-700" />
            </div>
          </div>

          {/* 5. Manpower Leave */}
          <div
            onClick={() => onNavigateTab('manpower')}
            className="p-4 rounded-xl bg-white hover:bg-amber-50/80 transition-all border border-amber-200/80 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">5. Manpower Leave</span>
              <Users className="w-4 h-4 text-amber-600 group-hover:text-amber-900 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-950">
              {stats.coverageRisksCount} Overlap
            </div>
            <div className="text-xs text-amber-800/80 mt-1 flex items-center justify-between">
              <span>{stats.pendingLeavesCount} pending approval</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Domain Problem Tracking Matrix */}
      <div className="bg-[#fffef9] rounded-2xl border border-amber-200/90 shadow-xs overflow-hidden">
        {/* Filter Controls Header */}
        <div className="p-4 sm:p-6 border-b border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/40">
          <div>
            <h2 className="text-base font-bold text-amber-950">
              Centralized Operational Problems Log
            </h2>
            <p className="text-xs text-amber-800/80">
              Active bottlenecks, severity ranking, and cross-functional ownership across operations
            </p>
          </div>

          {/* Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-amber-100/70 rounded-lg text-xs font-medium">
              {['all', 'invoicing', 'ar', 'regulations', 'customerService', 'manpower'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-amber-950 shadow-xs font-bold'
                      : 'text-amber-900 hover:text-amber-950'
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

            <div className="flex items-center gap-1 p-1 bg-amber-100/70 rounded-lg text-xs font-medium">
              {['all', 'critical', 'high', 'medium'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer capitalize whitespace-nowrap ${
                    selectedSeverity === sev
                      ? 'bg-amber-400 text-amber-950 shadow-xs font-bold'
                      : 'text-amber-900 hover:text-amber-950'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems List Table / Rows */}
        <div className="divide-y divide-amber-100">
          {filteredProblems.length === 0 ? (
            <div className="py-12 text-center text-amber-800 text-sm">
              No problems match the selected filters. Operations running smoothly.
            </div>
          ) : (
            filteredProblems.map((prob) => {
              const categoryInfo = categoryMap[prob.category];
              const Icon = categoryInfo.icon;

              return (
                <div
                  key={prob.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    prob.status === 'resolved' ? 'bg-amber-50/20 opacity-60' : 'hover:bg-amber-50/50'
                  }`}
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-amber-600" />
                        {categoryInfo.label}
                      </span>
                      <span className="text-amber-300">·</span>
                      <span
                        className={`font-mono uppercase font-bold text-[11px] ${
                          prob.severity === 'critical'
                            ? 'text-rose-700'
                            : prob.severity === 'high'
                            ? 'text-amber-800'
                            : 'text-amber-700'
                        }`}
                      >
                        {prob.severity}
                      </span>
                      <span className="text-amber-300">·</span>
                      <span className="text-amber-800/80 font-mono tabular-nums">Logged {prob.identifiedDate}</span>
                      {prob.metricImpact && (
                        <>
                          <span className="text-amber-300">·</span>
                          <span className="font-mono text-amber-950 font-bold bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                            {prob.metricImpact}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className={`text-sm sm:text-base font-bold ${prob.status === 'resolved' ? 'line-through text-amber-800/50' : 'text-amber-950'}`}>
                      {prob.title}
                    </h3>
                    <p className="text-xs text-amber-900/80 leading-relaxed">
                      {prob.description}
                    </p>
                    <div className="text-xs text-amber-800 pt-0.5">
                      <span className="font-semibold text-amber-950">Assignee:</span> {prob.assignee}
                    </div>
                  </div>

                  {/* Actions Zone */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                    <div className="flex items-center gap-1">
                      {prob.status !== 'resolved' ? (
                        <>
                          <button
                            onClick={() => onUpdateProblemStatus(prob.id, prob.status === 'in_progress' ? 'open' : 'in_progress')}
                            className="px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-white border border-amber-200 rounded-md hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            {prob.status === 'in_progress' ? 'Set Open' : 'Mark In Progress'}
                          </button>
                          <button
                            onClick={() => onUpdateProblemStatus(prob.id, 'resolved')}
                            className="px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />
                            <span>Resolve</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onUpdateProblemStatus(prob.id, 'open')}
                          className="px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-white border border-amber-200 rounded-md hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigateTab(categoryInfo.tab)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
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

      {/* Strategic Operational Map with Yellow Ranunculus Floral Accent */}
      <div className="bg-[#713f12] text-amber-50 rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-amber-600/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sun className="w-3.5 h-3.5 fill-amber-300" />
              <span>Whiteboard Problem Architecture</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              From Sticky Notes to Centralized Executive Action
            </h3>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Every challenge identified in your initial diagram is unified into this sunny operational loop.
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <span>Trigger Full Executive Digest</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs relative z-10">
          <div className="p-3.5 bg-amber-950/60 rounded-xl border border-amber-500/30 space-y-1">
            <div className="text-amber-300 font-bold font-mono text-[11px]">PROBLEM 1</div>
            <div className="font-bold text-white text-sm">Issue Invoices</div>
            <p className="text-amber-200/70 text-[11px] leading-relaxed">
              Auto line-item scope estimation, milestone draft billing, and printable invoice documents.
            </p>
          </div>

          <div className="p-3.5 bg-amber-950/60 rounded-xl border border-amber-500/30 space-y-1">
            <div className="text-amber-300 font-bold font-mono text-[11px]">PROBLEM 2</div>
            <div className="font-bold text-white text-sm">Monitor AR Status</div>
            <p className="text-amber-200/70 text-[11px] leading-relaxed">
              Aging buckets (1-30d, 31-60d, 60+d) with AI reminder notices and cashflow reconciliations.
            </p>
          </div>

          <div className="p-3.5 bg-amber-950/60 rounded-xl border border-amber-500/30 space-y-1">
            <div className="text-amber-300 font-bold font-mono text-[11px]">PROBLEM 3</div>
            <div className="font-bold text-white text-sm">Understand Regulations</div>
            <p className="text-amber-200/70 text-[11px] leading-relaxed">
              Plain-English legal translation, statutory filing calendars, and tax compliance checklists.
            </p>
          </div>

          <div className="p-3.5 bg-amber-950/60 rounded-xl border border-amber-500/30 space-y-1">
            <div className="text-amber-300 font-bold font-mono text-[11px]">PROBLEM 4</div>
            <div className="font-bold text-white text-sm">Customer Service</div>
            <p className="text-amber-200/70 text-[11px] leading-relaxed">
              Priority email queue, SLA countdowns, and context-aware smart response generation.
            </p>
          </div>

          <div className="p-3.5 bg-amber-950/60 rounded-xl border border-amber-500/30 space-y-1">
            <div className="text-amber-300 font-bold font-mono text-[11px]">PROBLEM 5</div>
            <div className="font-bold text-white text-sm">Manpower Leave</div>
            <p className="text-amber-200/70 text-[11px] leading-relaxed">
              Employee leave balances, 1-click approvals, and department overlap risk prevention.
            </p>
          </div>
        </div>
      </div>

      {/* Log Problem Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-amber-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fffef9] rounded-2xl shadow-xl max-w-lg w-full p-6 border border-amber-300">
            <h3 className="text-base font-bold text-amber-950 mb-1">
              Log New Operational Problem
            </h3>
            <p className="text-xs text-amber-800/80 mb-4">
              Add a new bottleneck or incident to the executive tracking matrix
            </p>

            <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-amber-950 mb-1">
                  Problem Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics Payment Overdue"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-amber-950 mb-1">
                    Operational Domain
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProblemCategory)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                  >
                    <option value="invoicing">Issue Invoices</option>
                    <option value="ar">Monitor AR Status</option>
                    <option value="regulations">Understand Regulations</option>
                    <option value="customerService">Customer Service Email/Tickets</option>
                    <option value="manpower">Manpower Leave Management</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-amber-950 mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-amber-950 mb-1">
                  Problem Context & Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the operational impact and blockers..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-amber-950 mb-1">
                    Assignee / Lead
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Elena Rostova (Finance)"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-amber-950 mb-1">
                    Metric Impact (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $14,200 locked / 1.5h SLA"
                    value={newMetricImpact}
                    onChange={(e) => setNewMetricImpact(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-amber-800 hover:text-amber-950 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm"
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
