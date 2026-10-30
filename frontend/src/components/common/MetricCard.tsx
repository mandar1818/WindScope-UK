import React from 'react';
import { Info, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | null | undefined;
  unit?: string;
  subtitle?: string;
  tooltip?: string;
  highlight?: 'neutral' | 'teal' | 'green' | 'amber' | 'red';
  precision?: number;
  signPrefix?: boolean;
  statusBadge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  subtitle,
  tooltip,
  highlight = 'neutral',
  precision = 1,
  signPrefix = false,
  statusBadge,
}) => {
  const isAvailable = value !== null && value !== undefined && !Number.isNaN(value);

  let formattedValue = 'N/A';
  if (isAvailable) {
    const formattedNum = value.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    if (signPrefix && value > 0) {
      formattedValue = `+${formattedNum}`;
    } else {
      formattedValue = formattedNum;
    }
  }

  const highlightStyles = {
    neutral: 'border-navy-700/80 bg-[#0c1427] hover:border-navy-600',
    teal: 'border-cyan-800/60 bg-[#0c1427] text-accent-cyan hover:border-cyan-600/70',
    green: 'border-emerald-800/60 bg-[#0c1427] text-accent-emerald hover:border-emerald-600/70',
    amber: 'border-amber-800/60 bg-[#0c1427] text-accent-amber hover:border-amber-600/70',
    red: 'border-red-800/60 bg-[#0c1427] text-red-400 hover:border-red-600/70',
  }[highlight];

  const accentTopBorder = {
    neutral: 'border-t-2 border-t-slate-600/60',
    teal: 'border-t-2 border-t-cyan-400',
    green: 'border-t-2 border-t-emerald-400',
    amber: 'border-t-2 border-t-amber-400',
    red: 'border-t-2 border-t-rose-500',
  }[highlight];

  return (
    <div
      className={`rounded-lg border p-4 shadow-lg transition-all duration-200 ${highlightStyles} ${accentTopBorder} relative flex flex-col justify-between`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between text-slate-400 pb-1.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-300 font-sans truncate">
            {title}
          </span>
          {tooltip && (
            <div className="group relative cursor-pointer" title={tooltip}>
              <Info className="h-3.5 w-3.5 text-slate-400 hover:text-accent-teal transition-colors flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Value and Unit */}
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span
            className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono ${
              isAvailable ? 'text-slate-100' : 'text-slate-500 italic text-xl'
            }`}
          >
            {formattedValue}
          </span>
          {isAvailable && unit && (
            <span className="text-xs font-semibold text-slate-400 font-mono">{unit}</span>
          )}
        </div>
      </div>

      {/* Subtitle / Semantic Badge */}
      <div className="mt-2.5 pt-2 border-t border-navy-800/80">
        {statusBadge && (
          <span className="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-navy-950 text-slate-300 border border-navy-700 mb-1">
            {statusBadge}
          </span>
        )}
        {subtitle && (
          <div className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
