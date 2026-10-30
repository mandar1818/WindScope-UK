import React from 'react';
import {
  Menu,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Compass,
  RefreshCw,
} from 'lucide-react';
import { SourceStatus } from '../../types/api';

interface TopNavProps {
  activeTab: string;
  sourceStatus: SourceStatus | null;
  onOpenMobileSidebar: () => void;
  onOpenStatusModal: () => void;
  onRefresh?: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview Dashboard',
    subtitle: 'National Wind Forecast vs Outturn & Day-Ahead Balancing Metrics',
  },
  forecast: {
    title: 'Forecast Analysis',
    subtitle: 'Point-in-Time Cutoff Selection & Waterfall Horizon Evolution',
  },
  accuracy: {
    title: 'Accuracy Analysis',
    subtitle: 'Multi-Day MAE, RMSE, WAPE & Signed Forecast Bias Breakdown',
  },
  exposure: {
    title: 'Procurement Exposure',
    subtitle: 'Day-Ahead Imbalance Energy (MWh) & Balancing Mechanism Risk',
  },
  explorer: {
    title: 'Data Explorer',
    subtitle: 'Granular 30-Minute Matched Observations & CSV Export',
  },
  'testing-lab': {
    title: 'Interactive Testing Lab',
    subtitle: 'Independent QA & Compliance Test Harness with Live Validation',
  },
  methodology: {
    title: 'Methodology & Market Reference',
    subtitle: 'Elexon BMRS Architecture, Decision Cutoffs & Mathematical Formulas',
  },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  sourceStatus,
  onOpenMobileSidebar,
  onOpenStatusModal,
  onRefresh,
}) => {
  const isDemo = sourceStatus?.is_demonstration_mode;
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  // Format last updated timestamp only when supported by actual data
  const formattedLastUpdated = sourceStatus?.last_updated_utc
    ? new Date(sourceStatus.last_updated_utc).toLocaleTimeString('en-GB', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' UTC'
    : null;

  return (
    <header className="sticky top-0 z-30 bg-[#070d19]/90 backdrop-blur-md border-b border-navy-800/80">
      {/* Demonstration Banner if active */}
      {isDemo && (
        <div className="bg-amber-950 border-b border-amber-600/70 text-amber-200 px-4 py-2 text-xs flex items-center justify-between font-mono animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-bold text-amber-300">DEMONSTRATION MODE ACTIVE:</span>
            <span className="text-amber-200 hidden sm:inline">
              {sourceStatus?.demonstration_notice ||
                'Synthetic benchmark observations active. Records are NOT live Elexon observations.'}
            </span>
          </div>
          <button
            onClick={onOpenStatusModal}
            className="text-[10px] bg-amber-900/80 hover:bg-amber-800 px-2.5 py-0.5 rounded border border-amber-600 text-amber-100 transition-colors"
          >
            DISCLOSURE
          </button>
        </div>
      )}

      {/* Main Top Nav Bar */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-navy-800 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="truncate">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-cyan">
                WindScope UK
              </span>
              <span className="text-slate-600">/</span>
              <h1 className="text-sm font-bold text-slate-100 truncate tracking-wide">
                {currentTabInfo.title}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Operational Status Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3 font-mono text-xs flex-shrink-0">
          {/* GB Market / UK National Wind Indicator */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700/80 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span>GB Grid:</span>
            <strong className="text-slate-100 font-sans">Europe/London (GMT)</strong>
          </div>

          {/* January 2026 Scope Badge */}
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 text-[11px] font-bold">
            Jan 2026 Scope
          </span>

          {/* Elexon Data Source Status */}
          <button
            onClick={onOpenStatusModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              isDemo
                ? 'bg-amber-950/80 border-amber-800 text-amber-300 hover:bg-amber-900/80'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-300 hover:bg-emerald-900/80'
            }`}
            title="Click to view full System and Elexon API telemetry"
          >
            {isDemo ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-sans font-semibold">Demo Mode</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-sans font-semibold">Elexon Live</span>
              </>
            )}
          </button>

          {/* Last updated timestamp, only when supported by actual data */}
          {formattedLastUpdated && (
            <div className="hidden xl:flex items-center space-x-1 text-[11px] text-slate-400 px-2 py-1 rounded bg-navy-900/60 border border-navy-800">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Synced:</span>
              <strong className="text-slate-300">{formattedLastUpdated}</strong>
            </div>
          )}

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-md bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700/80 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-accent-cyan" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

