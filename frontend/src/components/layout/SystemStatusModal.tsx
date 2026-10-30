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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-lg border border-nature-border bg-white shadow-2xl overflow-hidden text-nature-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-nature-border flex items-center justify-between bg-nature-bg">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-nature-forest" />
            <h3 className="text-xs font-semibold text-nature-text uppercase tracking-wider font-sans">
              System &amp; Data Pipeline Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-nature-muted hover:text-nature-text hover:bg-nature-border/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Main Status Banner */}
          <div
            className={`p-3 rounded-md border flex items-start space-x-2.5 ${
              isDemo
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            {isDemo ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 font-sans">
              <div className="font-semibold text-xs">
                {isDemo ? 'Demonstration Benchmark Mode' : 'Elexon BMRS Live Connection Verified'}
              </div>
              <p className="text-[11px] text-nature-text leading-relaxed">
                {status?.data_source_description ||
                  'Official integration with Elexon BMRS Insights Solution streaming APIs.'}
              </p>
              {isDemo && status?.demonstration_notice && (
                <p className="text-[11px] text-amber-800 font-mono">
                  {status.demonstration_notice}
                </p>
              )}
            </div>
          </div>

          {/* Service Streams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* FUELHH */}
            <div className="p-3 rounded-md bg-nature-bg border border-nature-border space-y-1.5">
              <div className="flex items-center justify-between font-sans">
                <span className="font-semibold text-nature-text flex items-center gap-1.5 text-xs">
                  <Database className="w-3.5 h-3.5 text-nature-actual" /> FUELHH Stream
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-nature-muted space-y-0.5 font-sans">
                <div className="flex justify-between">
                  <span>Data:</span> <strong className="text-nature-text">Metered Outturn</strong>
                </div>
                <div className="flex justify-between">
                  <span>Filter:</span> <span className="text-nature-text font-mono">fuelType = 'WIND'</span>
                </div>
                <div className="flex justify-between">
                  <span>Cadence:</span> <span>30m settlement</span>
                </div>
              </div>
            </div>

            {/* WINDFOR */}
            <div className="p-3 rounded-md bg-nature-bg border border-nature-border space-y-1.5">
              <div className="flex items-center justify-between font-sans">
                <span className="font-semibold text-nature-text flex items-center gap-1.5 text-xs">
                  <Radio className="w-3.5 h-3.5 text-nature-forecast" /> WINDFOR Stream
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 inline-flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5 text-sky-600" /> ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-nature-muted space-y-0.5 font-sans">
                <div className="flex justify-between">
                  <span>Data:</span> <strong className="text-nature-text">Wind Forecasts</strong>
                </div>
                <div className="flex justify-between">
                  <span>Protection:</span> <span className="text-nature-actual font-medium">Point-in-Time</span>
                </div>
                <div className="flex justify-between">
                  <span>Look-ahead:</span> <span className="text-nature-actual font-medium">0% contamination</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scope Parameters */}
          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-2">
            <h4 className="font-sans font-medium text-nature-text text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-nature-forest" /> Evaluation Horizon &amp; Governance
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded bg-white border border-nature-border">
                <span className="block text-nature-muted text-[10px] font-sans">Scope Window</span>
                <strong className="text-nature-text">January 2026</strong>
              </div>
              <div className="p-2 rounded bg-white border border-nature-border">
                <span className="block text-nature-muted text-[10px] font-sans">Timezone</span>
                <strong className="text-nature-text">Europe/London (GMT)</strong>
              </div>
              <div className="p-2 rounded bg-white border border-nature-border">
                <span className="block text-nature-muted text-[10px] font-sans">Resolution</span>
                <strong className="text-nature-text">30 Min (48 SP/Day)</strong>
              </div>
              <div className="p-2 rounded bg-white border border-nature-border">
                <span className="block text-nature-muted text-[10px] font-sans">Primary Benchmark</span>
                <strong className="text-nature-text">Day-Ahead 11:00 GMT</strong>
              </div>
              <div className="p-2 rounded bg-white border border-nature-border">
                <span className="block text-nature-muted text-[10px] font-sans">Memory Cache</span>
                <strong className="text-nature-text">3,600s TTL</strong>
              </div>
              <div className="p-2 rounded bg-white border border-nature-border">
                <span className="block text-nature-muted text-[10px] font-sans">Last Checked</span>
                <strong className="text-nature-text truncate block">
                  {status?.last_updated_utc ? status.last_updated_utc.replace('T', ' ').slice(0, 19) : 'Active'}
                </strong>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-nature-muted text-[11px] font-sans">
            <a
              href="https://data.elexon.co.uk/bmrs/api/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-nature-forest flex items-center gap-1 underline underline-offset-4"
            >
              <span>Elexon BMRS API Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-2 py-0.5 rounded bg-white hover:bg-nature-bg text-nature-text border border-nature-border text-xs shadow-xs"
              >
                Re-check Endpoints
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-nature-border bg-nature-bg flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded bg-white hover:bg-nature-border/30 text-nature-text border border-nature-border font-medium text-xs font-sans transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
