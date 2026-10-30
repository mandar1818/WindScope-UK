import React from 'react';
import {
  Menu,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
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
    title: 'Overview',
    subtitle: 'National wind generation, Day-Ahead forecasts, and portfolio balance summary',
  },
  forecast: {
    title: 'Forecast Analysis',
    subtitle: 'Point-in-time forecast selection and evolution across publication horizons',
  },
  accuracy: {
    title: 'Accuracy Metrics',
    subtitle: 'MAE, RMSE, WAPE, and signed forecast bias evaluated across settlement days',
  },
  exposure: {
    title: 'Procurement Exposure',
    subtitle: 'Half-hourly energy volume imbalance (MWh) and physical market exposure',
  },
  explorer: {
    title: 'Data Explorer',
    subtitle: 'Granular half-hourly observations, paired actuals/forecasts, and CSV export',
  },
  'testing-lab': {
    title: 'Testing Lab',
    subtitle: 'Automated engineering verification suite executing against live data',
  },
  methodology: {
    title: 'Methodology',
    subtitle: 'Elexon BMRS datasets, decision cutoffs, error formulas, and market rules',
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

  const formattedLastUpdated = sourceStatus?.last_updated_utc
    ? new Date(sourceStatus.last_updated_utc).toLocaleTimeString('en-GB', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' UTC'
    : null;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-nature-border">
      {/* Demonstration Banner if active */}
      {isDemo && (
        <div className="bg-nature-risk-light border-b border-nature-risk/30 text-[#8C611C] px-4 py-1.5 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-nature-risk flex-shrink-0" />
            <span className="font-semibold text-nature-risk">DEMONSTRATION MODE:</span>
            <span className="text-[#8C611C] hidden sm:inline font-sans">
              {sourceStatus?.demonstration_notice ||
                'Synthetic benchmark observations active. Live Elexon API is unreachable.'}
            </span>
          </div>
          <button
            onClick={onOpenStatusModal}
            className="text-[10px] bg-white hover:bg-[#F8EFE1] px-2 py-0.5 rounded border border-nature-risk/40 text-nature-risk transition-colors"
          >
            Details
          </button>
        </div>
      )}

      {/* Main Top Nav Bar */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-1.5 rounded-md text-nature-muted hover:text-nature-text hover:bg-nature-bg transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="truncate">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-nature-muted hidden sm:inline">
                WindScope UK
              </span>
              <span className="text-nature-border hidden sm:inline">/</span>
              <h1 className="text-sm font-semibold text-nature-text truncate">
                {currentTabInfo.title}
              </h1>
            </div>
            <p className="text-[11px] text-nature-muted truncate hidden md:block">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Operational Status Badges */}
        <div className="flex items-center space-x-2 font-mono text-xs flex-shrink-0">
          {/* GB Market Scope Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-nature-bg border border-nature-border text-nature-muted text-[11px]">
            <span>Market:</span>
            <span className="text-nature-text font-sans font-medium">GB (GMT)</span>
          </div>

          {/* Scope Badge */}
          <div className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-nature-bg border border-nature-border text-nature-muted text-[11px]">
            <span>Jan 2026 Scope</span>
          </div>

          {/* Elexon Data Source Status */}
          <button
            onClick={onOpenStatusModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] transition-colors ${
              isDemo
                ? 'bg-nature-risk-light border-nature-risk/30 text-nature-risk hover:bg-[#F9EDE0]'
                : 'bg-nature-forest-light border-nature-border text-nature-forest hover:bg-nature-forest-light/80'
            }`}
            title="View Data Pipeline Telemetry"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDemo ? 'bg-nature-risk' : 'bg-nature-actual'
              }`}
            />
            <span className="font-sans font-medium">
              {isDemo ? 'Demo Mode' : 'Elexon Live'}
            </span>
          </button>

          {/* Last Updated Timestamp */}
          {formattedLastUpdated && (
            <div className="hidden xl:flex items-center space-x-1 text-[11px] text-nature-muted px-2 py-1 rounded-md bg-nature-bg border border-nature-border">
              <Clock className="w-3 h-3 text-nature-muted" />
              <span>{formattedLastUpdated}</span>
            </div>
          )}

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-md bg-white hover:bg-nature-bg text-nature-muted hover:text-nature-text border border-nature-border transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
