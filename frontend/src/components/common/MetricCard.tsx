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

  // Natural palette accents
  const valueColor = {
    neutral: 'text-nature-text',
    teal: 'text-nature-forecast', // #5689B5
    green: 'text-nature-actual', // #26966B
    amber: 'text-nature-risk', // #D49A42
    red: 'text-[#C54B4B]',
  }[highlight];

  return (
    <div className="rounded-lg border border-nature-border bg-white p-4 flex flex-col justify-between transition-colors shadow-sm hover:border-nature-sage/60">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between text-nature-muted pb-1">
          <span className="text-xs font-medium text-nature-text/80 truncate">
            {title}
          </span>
          {tooltip && (
            <div className="cursor-help text-nature-muted hover:text-nature-forest transition-colors" title={tooltip}>
              <Info className="h-3.5 w-3.5 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Primary Value */}
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span
            className={`text-2xl font-semibold tracking-tight font-mono tabular-nums ${
              isAvailable ? valueColor : 'text-nature-muted/60 italic text-xl'
            }`}
          >
            {formattedValue}
          </span>
          {isAvailable && unit && (
            <span className="text-xs font-mono text-nature-muted font-medium">{unit}</span>
          )}
        </div>
      </div>

      {/* Subtitle / Context Note */}
      {(subtitle || statusBadge) && (
        <div className="mt-2.5 pt-2 border-t border-nature-border/80 flex items-center justify-between text-[11px] text-nature-muted">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {statusBadge && (
            <span className="text-[10px] font-mono text-nature-muted bg-nature-bg px-1.5 py-0.5 rounded border border-nature-border ml-auto flex-shrink-0">
              {statusBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
