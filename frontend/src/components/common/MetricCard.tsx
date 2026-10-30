import React from 'react';
import { Info } from 'lucide-react';

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

  // Meaningful text accents for values
  const valueColor = {
    neutral: 'text-slate-100',
    teal: 'text-sky-300',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-rose-400',
  }[highlight];

  return (
    <div className="rounded-lg border border-slate-800/90 bg-[#0e1526] p-4 flex flex-col justify-between transition-colors hover:border-slate-700/80">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between text-slate-400 pb-1">
          <span className="text-xs font-medium text-slate-300 truncate">
            {title}
          </span>
          {tooltip && (
            <div className="cursor-help text-slate-500 hover:text-slate-300 transition-colors" title={tooltip}>
              <Info className="h-3.5 w-3.5 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Primary Value */}
        <div className="mt-1.5 flex items-baseline space-x-1.5">
          <span
            className={`text-2xl font-semibold tracking-tight font-mono tabular-nums ${
              isAvailable ? valueColor : 'text-slate-500 italic text-xl'
            }`}
          >
            {formattedValue}
          </span>
          {isAvailable && unit && (
            <span className="text-xs font-mono text-slate-400">{unit}</span>
          )}
        </div>
      </div>

      {/* Subtitle / Context Note */}
      {(subtitle || statusBadge) && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {statusBadge && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">
              {statusBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
