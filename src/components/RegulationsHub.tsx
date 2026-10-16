import React, { useState } from 'react';
import {
  Scale,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Shield,
  Clock,
  Plus,
} from 'lucide-react';
import { RegulationItem } from '../types';

interface RegulationsHubProps {
  regulations: RegulationItem[];
  onUpdateStatus: (id: string, status: RegulationItem['complianceStatus']) => void;
  onAddRegulation: (item: RegulationItem) => void;
}

export const RegulationsHub: React.FC<RegulationsHubProps> = ({
  regulations,
  onUpdateStatus,
  onAddRegulation,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [queryInput, setQueryInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const categories = [
    'all',
    'Tax & Corporate',
    'Employment & Labor',
    'Data Protection',
  ];

  const filteredRegulations = regulations.filter((reg) => {
    if (activeCategory === 'all') return true;
    return reg.category === activeCategory;
  });

  const handleAskRegulation = async (customQuery?: string) => {
    const q = customQuery || queryInput;
    if (!q.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch('/api/regulations/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAsObligation = () => {
    if (!analysisResult) return;
    const newItem: RegulationItem = {
      id: `reg-${Date.now()}`,
      title: analysisResult.title || 'Statutory Compliance Requirement',
      jurisdiction: 'Regulatory Commission',
      category: 'Tax & Corporate',
      complianceStatus: 'review_required',
      deadlineDate: '2026-11-30',
      riskRating: analysisResult.riskLevel?.toLowerCase() || 'medium',
      summary: analysisResult.plainEnglishSummary || '',
      mandatoryRequirements: analysisResult.keyObligations || [],
      designatedOwner: 'Operations Team',
    };
    onAddRegulation(newItem);
    setAnalysisResult(null);
    setQueryInput('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Whiteboard Focus 3: Understand Regulations
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Regulatory Intelligence & Compliance Tracker
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Demystify corporate law, tax filing deadlines, labor standards, and data protection rules into plain English.
          </p>
        </div>
      </div>

      {/* AI Regulation Advisor & Plain-English Explainer */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Plain-English Regulatory Advisor</span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-white">
          Ask any statutory regulation question or paste complex legal text
        </h3>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Gemini extracts the actionable requirements, key statutory deadlines, penalties for non-compliance, and generates a concrete step-by-step audit checklist.
        </p>

        {/* Search / Query Bar */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. When is corporate annual tax return due, and what are the penalties for late filing?"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskRegulation()}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            onClick={() => handleAskRegulation()}
            disabled={isAnalyzing || !queryInput.trim()}
            className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing Law...' : 'Explain Regulation'}
          </button>
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Quick inquiries:</span>
          {[
            'Corporate annual tax return deadline & audit criteria',
            'Overtime pay rules for non-exempt employees (1.5x)',
            'Digital services GST/VAT invoicing obligations',
            'Customer consent requirements for cross-border data',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setQueryInput(prompt);
                handleAskRegulation(prompt);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Analysis Result Display */}
        {analysisResult && (
          <div className="mt-4 p-5 rounded-lg bg-slate-800 border border-slate-700 space-y-4 text-xs animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-700">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                  Regulatory Intelligence Synthesis
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {analysisResult.title}
                </h4>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold shrink-0 ${
                  analysisResult.riskLevel === 'HIGH' || analysisResult.riskLevel === 'CRITICAL'
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {analysisResult.riskLevel} RISK LEVEL
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-400 block mb-1">
                Plain-English Translation:
              </span>
              <p className="text-slate-200 leading-relaxed text-sm bg-slate-900/60 p-3 rounded-md border border-slate-700/50">
                {analysisResult.plainEnglishSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-400 block">Mandatory Obligations:</span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {analysisResult.keyObligations?.map((ob: string, i: number) => (
                    <li key={i} className="leading-snug">{ob}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-400 block">Filing Deadlines & Statutory Timeline:</span>
                <div className="p-2.5 bg-slate-900/40 rounded border border-slate-700 text-slate-300 font-mono text-[11px]">
                  {analysisResult.complianceDeadlines}
                </div>

                {analysisResult.actionChecklist && (
                  <div className="pt-2">
                    <span className="font-semibold text-slate-400 block mb-1">Execution Checklist:</span>
                    <div className="space-y-1 text-slate-300">
                      {analysisResult.actionChecklist.slice(0, 3).map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700 flex justify-end gap-2">
              <button
                onClick={handleApplyAsObligation}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                + Track as Active Company Obligation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer capitalize ${
              activeCategory === cat
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat === 'all' ? 'All Regulations' : cat}
          </button>
        ))}
      </div>

      {/* Tracked Regulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRegulations.map((reg) => (
          <div
            key={reg.id}
            className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">{reg.jurisdiction}</span>
                  <span>·</span>
                  <span>{reg.category}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {reg.title}
                </h3>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase shrink-0 ${
                  reg.riskRating === 'high'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : reg.riskRating === 'medium'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {reg.riskRating} risk
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {reg.summary}
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
              <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                Statutory Requirements:
              </div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                {reg.mandatoryRequirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Deadline:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {reg.deadlineDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={reg.complianceStatus}
                  onChange={(e) => onUpdateStatus(reg.id, e.target.value as any)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="compliant">Compliant</option>
                  <option value="review_required">Review Required</option>
                  <option value="action_needed">Action Needed</option>
                  <option value="upcoming_deadline">Upcoming Deadline</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
