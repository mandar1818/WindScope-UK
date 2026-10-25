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
    neutral: 'border-navy-700/80 bg-navy-900/90 hover:border-navy-600',
    teal: 'border-cyan-800/60 bg-navy-900/90 text-accent-cyan hover:border-cyan-600/70',
    green: 'border-emerald-800/60 bg-navy-900/90 text-accent-emerald hover:border-emerald-600/70',
    amber: 'border-amber-800/60 bg-navy-900/90 text-accent-amber hover:border-amber-600/70',
    red: 'border-red-800/60 bg-navy-900/90 text-red-400 hover:border-red-600/70',
  }[highlight];

  return (
    <div className={`rounded-xl border p-4 shadow-lg transition-all duration-200 ${highlightStyles}`}>
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">{title}</span>
        {tooltip && (
          <div className="group relative cursor-pointer" title={tooltip}>
            <Info className="h-3.5 w-3.5 text-slate-400 hover:text-accent-teal transition-colors" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline space-x-1.5">
        <span
          className={`text-2xl font-bold tracking-tight font-mono ${
            isAvailable ? 'text-slate-100' : 'text-slate-500 italic text-xl'
          }`}
        >
          {formattedValue}
        </span>
        {isAvailable && unit && (
          <span className="text-xs font-semibold text-slate-400">{unit}</span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-slate-400 leading-tight">
          {subtitle}
        </div>
      )}
    </div>
  );
};

