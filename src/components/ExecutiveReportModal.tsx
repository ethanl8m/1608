import React, { useState } from 'react';
import { X, Check, Copy, Printer, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { ExecutiveReport } from '../types';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ExecutiveReport | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!report) return;
    const text = `CENTRAOPS EXECUTIVE DIGEST & PROBLEM REPORT
Generated: ${report.generatedAt}
Executive Health Score: ${report.healthScore}/100

HEADLINE:
${report.executiveHeadline}

EXECUTIVE SUMMARY:
${report.executiveSummary}

CRITICAL OPERATIONAL RISKS:
${report.criticalRisks
  .map(
    (r, i) =>
      `${i + 1}. [${r.severity}] ${r.area}: ${r.risk}\n   Impact: ${r.impact}\n   Recommendation: ${r.recommendation}`
  )
  .join('\n\n')}

IMMEDIATE ACTION PLAN:
${report.immediateActions
  .map((a, i) => `${i + 1}. [${a.priority}] ${a.action} (Owner: ${a.owner} | Due: ${a.timeframe})`)
  .join('\n')}

AREA BRIEFS:
- Invoicing: ${report.areaBriefs.invoicing}
- Accounts Receivable: ${report.areaBriefs.ar}
- Regulations & Compliance: ${report.areaBriefs.regulations}
- Customer Service: ${report.areaBriefs.customerService}
- Manpower & Leave: ${report.areaBriefs.manpower}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50 print:bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
              DIGEST
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Executive Problem & Operations Briefing
              </h2>
              <p className="text-xs text-slate-500">
                Centralized intelligence tracking across all 5 operational problem domains
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isLoading ? 'Regenerating...' : 'Re-analyze'}</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 print:overflow-visible">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Synthesizing cross-domain business telemetry & problem log...
              </p>
              <p className="text-xs text-slate-400">
                Auditing Invoicing, AR Cashflow, Regulations, Support SLAs, and Manpower Leave
              </p>
            </div>
          ) : report ? (
            <>
              {/* Executive Snapshot Card */}
              <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span>Generated for Ethan Lim (COO / Managing Director)</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{report.generatedAt}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight text-white leading-snug">
                      {report.executiveHeadline}
                    </h3>
                  </div>
                  <div className="shrink-0 flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Operational Health</div>
                      <div className="text-xs text-slate-300">Target: &gt;85</div>
                    </div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                      {report.healthScore}<span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Executive Briefing Summary
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {report.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Critical Risks Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Identified Critical Bottlenecks & Operational Risks</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {report.criticalRisks.length} active risks
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {report.criticalRisks.map((risk, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                            <span className="text-slate-900 font-semibold">{risk.area}</span>
                            <span>·</span>
                            <span
                              className={`font-semibold ${
                                risk.severity === 'CRITICAL'
                                  ? 'text-rose-600'
                                  : risk.severity === 'HIGH'
                                  ? 'text-amber-600'
                                  : 'text-slate-600'
                              }`}
                            >
                              {risk.severity} SEVERITY
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {risk.risk}
                          </h4>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium">Business Impact:</span>{' '}
                          <span className="text-slate-700">{risk.impact}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Resolution Strategy:</span>{' '}
                          <span className="text-slate-800 font-semibold">{risk.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Action Plan */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Immediate Priority Execution Plan
                </h3>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <div className="divide-y divide-slate-100">
                    {report.immediateActions.map((action, index) => (
                      <div
                        key={index}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                              action.priority === 'P1'
                                ? 'bg-rose-100 text-rose-800'
                                : action.priority === 'P2'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {action.priority}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-900">
                            {action.action}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0 pl-9 sm:pl-0">
                          <span className="font-medium text-slate-700">Owner: {action.owner}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums text-slate-900 font-medium">
                            {action.timeframe}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5-Domain Operations Brief */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Cross-Domain Operational Briefs
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">1. Invoicing & Billing Pipeline</div>
                    <p className="text-slate-600 leading-relaxed">{report.areaBriefs.invoicing}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">2. Accounts Receivable Collections</div>
                    <p className="text-slate-600 leading-relaxed">{report.areaBriefs.ar}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">3. Regulatory & Statutory Compliance</div>
                    <p className="text-slate-600 leading-relaxed">{report.areaBriefs.regulations}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">4. Customer Service & SLA Desk</div>
                    <p className="text-slate-600 leading-relaxed">{report.areaBriefs.customerService}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
                    <div className="font-bold text-slate-900 mb-1">5. Manpower & Team Leave Coverage</div>
                    <p className="text-slate-600 leading-relaxed">{report.areaBriefs.manpower}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500">
              No report generated yet. Click "Re-analyze" above to compile an executive briefing.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>CentraOps Unified Executive Command · Confidential</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
