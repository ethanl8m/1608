import React from 'react';
import { ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
  isGeneratingReport: boolean;
  unresolvedProblemsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  isGeneratingReport,
  unresolvedProblemsCount,
}) => {
  const navItems = [
    { id: 'radar', label: 'Executive Radar' },
    { id: 'invoices', label: 'Invoicing' },
    { id: 'ar', label: 'AR Collections' },
    { id: 'regulations', label: 'Regulations' },
    { id: 'customerService', label: 'Customer Desk' },
    { id: 'manpower', label: 'Manpower & Leave' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveTab('radar')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
              C
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 block leading-tight">
                CentraOps
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 relative ${
                    isActive
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {item.id === 'radar' && unresolvedProblemsCount > 0 && (
                    <span className="ml-1.5 text-xs text-amber-700 font-mono tabular-nums">
                      ({unresolvedProblemsCount})
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReport}
              disabled={isGeneratingReport}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm disabled:opacity-70"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isGeneratingReport ? 'Compiling Report...' : 'Report to Me'}</span>
            </button>
          </div>
        </div>

        {/* Mobile horizontal scroller for navigation */}
        <div className="lg:hidden flex items-center gap-4 py-2 overflow-x-auto border-t border-slate-100 text-xs font-medium no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
              {item.id === 'radar' && unresolvedProblemsCount > 0 && (
                <span className="ml-1 text-[11px] opacity-80">({unresolvedProblemsCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
