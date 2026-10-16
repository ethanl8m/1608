import React from 'react';
import { Sparkles } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#fffdfa]/95 backdrop-blur-sm border-b border-amber-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark with golden floral emblem */}
          <button
            onClick={() => setActiveTab('radar')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-300 shadow-xs bg-amber-50 shrink-0">
              <img
                src="/src/assets/images/flower_botanical_seal_1792146756378.jpg"
                alt="CentraOps Floral Logo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-amber-950 whitespace-nowrap shrink-0 block leading-tight">
                CentraOps
              </span>
              <span className="text-[10px] text-amber-700 font-medium tracking-wide block">
                Executive Blossom Ops
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-amber-900/80">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 relative ${
                    isActive
                      ? 'text-amber-950 font-bold'
                      : 'text-amber-800/80 hover:text-amber-950'
                  }`}
                >
                  {item.label}
                  {item.id === 'radar' && unresolvedProblemsCount > 0 && (
                    <span className="ml-1.5 text-xs text-amber-800 font-mono tabular-nums bg-amber-100/90 px-1.5 py-0.5 rounded-full">
                      {unresolvedProblemsCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action in bright sunny yellow/gold */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReport}
              disabled={isGeneratingReport}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 border border-amber-500/50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm disabled:opacity-70"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>{isGeneratingReport ? 'Compiling Report...' : 'Report to Me'}</span>
            </button>
          </div>
        </div>

        {/* Mobile horizontal scroller for navigation */}
        <div className="lg:hidden flex items-center gap-4 py-2 overflow-x-auto border-t border-amber-100 text-xs font-medium no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
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
