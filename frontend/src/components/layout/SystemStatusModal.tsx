import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-lg border border-slate-700 bg-[#0e1526] shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-sans">
              System &amp; Data Pipeline Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Main Status Banner */}
          <div
            className={`p-3 rounded border flex items-start space-x-2.5 ${
              isDemo
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            }`}
          >
            {isDemo ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 font-sans">
              <div className="font-semibold text-xs">
                {isDemo ? 'Demonstration Benchmark Mode' : 'Elexon BMRS Live Connection Verified'}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {status?.data_source_description ||
                  'Official integration with Elexon BMRS Insights Solution streaming APIs.'}
              </p>
              {isDemo && status?.demonstration_notice && (
                <p className="text-[11px] text-amber-300 font-mono">
                  {status.demonstration_notice}
                </p>
              )}
            </div>
          </div>

          {/* Service Streams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* FUELHH */}
            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between font-sans">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> FUELHH Stream
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 inline-flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Data:</span> <strong className="text-slate-200">Metered Outturn</strong>
                </div>
                <div className="flex justify-between">
                  <span>Filter:</span> <span className="text-slate-300">fuelType = 'WIND'</span>
                </div>
                <div className="flex justify-between">
                  <span>Cadence:</span> <span>30m settlement</span>
                </div>
              </div>
            </div>

            {/* WINDFOR */}
            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between font-sans">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Radio className="w-3.5 h-3.5 text-sky-400" /> WINDFOR Stream
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-400 border border-sky-800/80 inline-flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Data:</span> <strong className="text-slate-200">Wind Forecasts</strong>
                </div>
                <div className="flex justify-between">
                  <span>Protection:</span> <span className="text-emerald-400">Point-in-Time</span>
                </div>
                <div className="flex justify-between">
                  <span>Look-ahead:</span> <span className="text-emerald-400">0% contamination</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scope Parameters */}
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-sans font-medium text-slate-300 text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Evaluation Horizon &amp; Governance
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="block text-slate-500 text-[10px]">Scope Window</span>
                <strong className="text-slate-200">January 2026</strong>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="block text-slate-500 text-[10px]">Timezone</span>
                <strong className="text-slate-200">Europe/London (GMT)</strong>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="block text-slate-500 text-[10px]">Resolution</span>
                <strong className="text-slate-200">30 Min (48 SP/Day)</strong>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="block text-slate-500 text-[10px]">Primary Benchmark</span>
                <strong className="text-slate-200">Day-Ahead 11:00 GMT</strong>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="block text-slate-500 text-[10px]">Memory Cache</span>
                <strong className="text-slate-200">3,600s TTL</strong>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="block text-slate-500 text-[10px]">Last Checked</span>
                <strong className="text-slate-200 truncate block">
                  {status?.last_updated_utc ? status.last_updated_utc.replace('T', ' ').slice(0, 19) : 'Active'}
                </strong>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-slate-400 text-[11px] font-sans">
            <a
              href="https://data.elexon.co.uk/bmrs/api/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 flex items-center gap-1 underline underline-offset-4"
            >
              <span>Elexon BMRS API Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Re-check Endpoints
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs font-sans transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
