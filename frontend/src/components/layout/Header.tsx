import React from 'react';
import { Wind, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SourceStatus } from '../../types/api';

interface HeaderProps {
  sourceStatus?: SourceStatus | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sourceStatus,
  activeTab,
  onSelectTab,
}) => {
  const isDemo = sourceStatus?.is_demonstration_mode;

  return (
    <header className="border-b border-navy-700/80 bg-navy-950/90 backdrop-blur sticky top-0 z-40">
      {/* Demonstration Banner if active */}
      {isDemo && (
        <div className="bg-amber-900/90 border-b border-amber-600/70 text-amber-100 px-4 py-2 text-xs flex items-center justify-between font-mono animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="font-bold">DEMONSTRATION MODE ACTIVE:</span>
            <span className="text-amber-200">
              {sourceStatus?.demonstration_notice ||
                'Synthetic benchmark observations are active. Records are NOT live Elexon observations.'}
            </span>
          </div>
          <span className="hidden md:inline text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-700">
            COMPLIANCE DISCLOSURE
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Product Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-navy-800 to-navy-900 border border-cyan-500/40 shadow-inner">
              <Wind className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg font-black tracking-wider text-slate-100 uppercase">
                  WindScope <span className="text-accent-cyan font-light">UK</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 font-bold">
                  Jan 2026 Scope
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Wind Power Forecasting & Day-Ahead Procurement Analytics Platform
              </p>
            </div>
          </div>

          {/* Right Status Indicators */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded bg-navy-900 border border-navy-700/80 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-accent-teal" />
              <span>GB Grid: <strong className="text-slate-100">Europe/London (GMT)</strong></span>
            </div>

            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border ${
                isDemo
                  ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                  : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              }`}
            >
              {isDemo ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Demo Mode</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Elexon BMRS Live</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-3.5 flex space-x-1 overflow-x-auto pb-1 scrollbar-none border-t border-navy-800/60 pt-2">
          {[
            { id: 'overview', label: 'Overview Dashboard' },
            { id: 'forecast', label: 'Forecast Analysis' },
            { id: 'accuracy', label: 'Accuracy Analysis' },
            { id: 'explorer', label: 'Data Explorer' },
            { id: 'methodology', label: 'Methodology' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-accent-teal text-navy-950 font-bold shadow-md shadow-cyan-950/40'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-navy-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
