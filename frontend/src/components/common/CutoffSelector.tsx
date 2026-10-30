import React from 'react';
import { CutoffType } from '../../types/api';
import { Clock } from 'lucide-react';

interface CutoffSelectorProps {
  selectedCutoff: CutoffType;
  onChange: (cutoff: CutoffType) => void;
  disabled?: boolean;
}

const CUTOFF_OPTIONS: { id: CutoffType; label: string; short: string; badge: string }[] = [
  {
    id: 'day_ahead_1100',
    label: 'Day-Ahead 11:00 GMT (EPEX/Nord Pool GB Auction Deadline)',
    short: 'DA 11:00',
    badge: 'Primary GB Market Benchmark'
  },
  {
    id: 'day_ahead_1200',
    label: 'Day-Ahead 12:00 GMT (Midday Cutoff)',
    short: 'DA 12:00',
    badge: 'Secondary Auction'
  },
  {
    id: 'day_ahead_1700',
    label: 'Day-Ahead 17:00 GMT (Physical Notification)',
    short: 'DA 17:00',
    badge: 'Physical Notification'
  },
  {
    id: 'gate_closure_1h',
    label: 'Intraday Gate Closure (1 Hour Ahead)',
    short: 'Gate Closure (-1h)',
    badge: 'Statutory BSC Deadline'
  },
  {
    id: 'gate_closure_2h',
    label: 'Intraday 2 Hours Ahead',
    short: 'Intraday (-2h)',
    badge: 'Continuous Balancing'
  },
];

export const CutoffSelector: React.FC<CutoffSelectorProps> = ({
  selectedCutoff,
  onChange,
  disabled = false
}) => {
  const currentOption = CUTOFF_OPTIONS.find((c) => c.id === selectedCutoff) || CUTOFF_OPTIONS[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-white p-2.5 rounded-lg border border-nature-border shadow-sm">
      <div className="flex items-center space-x-1.5 text-xs font-medium text-nature-text">
        <Clock className="w-3.5 h-3.5 text-nature-forest" />
        <span>Decision Cutoff:</span>
      </div>

      <div className="flex-1 flex flex-wrap gap-1.5">
        {CUTOFF_OPTIONS.map((opt) => {
          const isSelected = opt.id === selectedCutoff;
          return (
            <button
              key={opt.id}
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                isSelected
                  ? 'bg-nature-forest text-white font-semibold shadow-sm'
                  : 'bg-nature-bg text-nature-muted hover:text-nature-text hover:bg-[#EAEFE9] border border-nature-border'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={opt.label}
            >
              {opt.short}
            </button>
          );
        })}
      </div>

      <div className="hidden lg:block text-[11px] text-nature-muted font-mono px-2 py-0.5 rounded-md bg-nature-bg border border-nature-border">
        {currentOption.badge}
      </div>
    </div>
  );
};
