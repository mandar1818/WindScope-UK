import React from 'react';
import { Menu, Clock, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SourceStatus } from '../../types/api';

interface TopNavProps {
  activeTab: string;
  sourceStatus: SourceStatus | null;
  onOpenMobileSidebar: () => void;
  onOpenStatusModal: () => void;
  onRefresh?: () => void;
}

const titles: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Wind generation, forecast performance and daily exposure' },
  forecast: { title: 'Forecasts', subtitle: 'Forecast submissions available at the selected decision time' },
  accuracy: { title: 'Accuracy', subtitle: 'Daily and period-level forecast performance' },
  exposure: { title: 'Procurement exposure', subtitle: 'Half-hourly energy variance derived from forecast error' },
  explorer: { title: 'Data explorer', subtitle: 'Matched forecast and metered generation observations' },
  'testing-lab': { title: 'Validation checks', subtitle: 'Run checks against the selected dataset and API responses' },
  methodology: { title: 'Methodology', subtitle: 'Data sources, forecast selection and calculation notes' },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab, sourceStatus, onOpenMobileSidebar, onOpenStatusModal, onRefresh,
}) => {
  const isDemo = sourceStatus?.is_demonstration_mode;
  const current = titles[activeTab] || titles.overview;
  const lastChecked = sourceStatus?.last_updated_utc
    ? new Date(sourceStatus.last_updated_utc).toLocaleTimeString('en-GB', {
        timeZone: 'UTC', hour: '2-digit', minute: '2-digit',
      }) + ' UTC'
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0b1220]/95">
      {isDemo && (
        <div className="flex items-center justify-between gap-3 border-b border-amber-900/70 bg-amber-950/40 px-4 py-2 text-xs text-amber-200 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span className="font-medium">Demonstration data is in use.</span>
            <span className="hidden truncate text-amber-300/80 sm:inline">{sourceStatus?.demonstration_notice || 'These values are not live Elexon observations.'}</span>
          </div>
          <button type="button" onClick={onOpenStatusModal} className="shrink-0 underline underline-offset-2 hover:text-white">Details</button>
        </div>
      )}
      <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onOpenMobileSidebar}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Open navigation">
            <Menu size={19} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-100">{current.title}</h1>
              <span className="hidden rounded border border-slate-700 px-2 py-0.5 text-[10px] text-slate-500 sm:inline">January 2026</span>
            </div>
            <p className="mt-1 hidden truncate text-[11px] text-slate-500 sm:block">{current.subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={onOpenStatusModal}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="View data source status">
            {isDemo
              ? <AlertTriangle size={14} className="text-amber-400" />
              : <CheckCircle2 size={14} className="text-emerald-400" />}
            <span className="hidden sm:inline">{isDemo ? 'Demo data' : sourceStatus ? 'Source status' : 'Checking source'}</span>
          </button>
          {lastChecked && (
            <span className="hidden items-center gap-1.5 text-[10px] text-slate-500 xl:inline-flex">
              <Clock size={13} /> Checked {lastChecked}
            </span>
          )}
          {onRefresh && (
            <button type="button" onClick={onRefresh}
              className="rounded-md border border-slate-700 p-2 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
              aria-label="Refresh source status" title="Refresh source status">
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
