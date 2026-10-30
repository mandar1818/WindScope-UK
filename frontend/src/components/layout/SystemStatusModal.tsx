import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Server,
  Database,
  Clock,
  Radio,
  CheckCircle2,
  X,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { SourceStatus } from '../../types/api';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SourceStatus | null;
  onRefresh?: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const isDemo = status?.is_demonstration_mode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-xl border border-navy-700 bg-navy-900 shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-navy-800 flex items-center justify-between bg-navy-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-navy-800 border border-navy-700 text-accent-cyan">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-wider uppercase font-sans">
                WindScope UK — System &amp; Data Pipeline Status
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                GB National Wind Transmission Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Main Status Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-start space-x-3 ${
              isDemo
                ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
            }`}
          >
            {isDemo ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 font-sans">
              <div className="font-bold text-sm">
                {isDemo ? 'Demonstration Benchmark Mode' : 'Elexon BMRS Live Connection Verified'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {status?.data_source_description ||
                  'Authoritative integration with Elexon BMRS Insights Solution streaming APIs.'}
              </p>
              {isDemo && status?.demonstration_notice && (
                <p className="text-xs text-amber-300 mt-1 font-mono">
                  {status.demonstration_notice}
                </p>
              )}
            </div>
          </div>

          {/* Service Pipelines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* FUELHH */}
            <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
              <div className="flex items-center justify-between font-sans">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> FUELHH Stream
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Data:</span> <strong className="text-slate-200">Metered Outturn</strong>
                </div>
                <div className="flex justify-between">
                  <span>Filter:</span> <span className="text-accent-teal">fuelType = 'WIND'</span>
                </div>
                <div className="flex justify-between">
                  <span>Cadence:</span> <span>30-minute settlement periods</span>
                </div>
              </div>
            </div>

            {/* WINDFOR */}
            <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
              <div className="flex items-center justify-between font-sans">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-accent-cyan" /> WINDFOR Stream
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-accent-cyan border border-cyan-800 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Data:</span> <strong className="text-slate-200">Wind Forecasts</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cutoff Protection:</span> <span className="text-emerald-400">Point-in-Time</span>
                </div>
                <div className="flex justify-between">
                  <span>Look-ahead Guard:</span> <span>Enforced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Engine Parameters */}
          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <h4 className="font-sans font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Evaluation Horizon &amp; Governance
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-400">
              <div className="p-2 rounded bg-navy-900 border border-navy-850">
                <span className="block text-slate-500 text-[10px]">Scope Window</span>
                <strong className="text-slate-200">January 2026</strong>
              </div>
              <div className="p-2 rounded bg-navy-900 border border-navy-850">
                <span className="block text-slate-500 text-[10px]">Timezone</span>
                <strong className="text-slate-200">Europe/London (GMT)</strong>
              </div>
              <div className="p-2 rounded bg-navy-900 border border-navy-850">
                <span className="block text-slate-500 text-[10px]">Resolution</span>
                <strong className="text-slate-200">30 Min (48 SP/Day)</strong>
              </div>
              <div className="p-2 rounded bg-navy-900 border border-navy-850">
                <span className="block text-slate-500 text-[10px]">Primary Benchmark</span>
                <strong className="text-accent-teal">Day-Ahead 11:00 GMT</strong>
              </div>
              <div className="p-2 rounded bg-navy-900 border border-navy-850">
                <span className="block text-slate-500 text-[10px]">Disk Cache TTL</span>
                <strong className="text-slate-200">3,600s (1 Hour)</strong>
              </div>
              <div className="p-2 rounded bg-navy-900 border border-navy-850">
                <span className="block text-slate-500 text-[10px]">Last Checked UTC</span>
                <strong className="text-slate-200 truncate block">
                  {status?.last_updated_utc ? status.last_updated_utc.replace('T', ' ').slice(0, 19) : 'Active'}
                </strong>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-slate-400 text-[11px] font-sans">
            <a
              href="https://data.elexon.co.uk/bmrs/api/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-cyan flex items-center gap-1 underline underline-offset-4"
            >
              <span>Elexon BMRS API Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700"
                >
                  Re-check Endpoints
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-navy-800 bg-navy-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-accent-teal hover:bg-cyan-400 text-navy-950 font-bold text-xs font-sans transition-colors"
          >
            Close Status
          </button>
        </div>
      </div>
    </div>
  );
};

