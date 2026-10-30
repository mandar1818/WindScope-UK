import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onChange: (date: string) => void;
  disabled?: boolean;
}

const QUICK_DATES = [
  '2026-01-01',
  '2026-01-05',
  '2026-01-10',
  '2026-01-15',
  '2026-01-20',
  '2026-01-25',
  '2026-01-31',
];

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onChange,
  disabled = false,
}) => {
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setUTCDate(current.getUTCDate() - 1);
    const prevStr = current.toISOString().split('T')[0];
    if (prevStr >= '2026-01-01') {
      onChange(prevStr);
    }
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setUTCDate(current.getUTCDate() + 1);
    const nextStr = current.toISOString().split('T')[0];
    if (nextStr <= '2026-01-31') {
      onChange(nextStr);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-[#0e1526] p-2.5 rounded-lg border border-slate-800">
      <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-300">
        <Calendar className="w-3.5 h-3.5 text-sky-400" />
        <span>Delivery Date:</span>
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={handlePrevDay}
          disabled={disabled || selectedDate <= '2026-01-01'}
          className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/60"
          title="Previous Day"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <input
          type="date"
          min="2026-01-01"
          max="2026-01-31"
          value={selectedDate}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value;
            if (val >= '2026-01-01' && val <= '2026-01-31') {
              onChange(val);
            }
          }}
          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono font-medium text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
        />

        <button
          onClick={handleNextDay}
          disabled={disabled || selectedDate >= '2026-01-31'}
          className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/60"
          title="Next Day"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto py-0.5">
        <span className="text-[11px] text-slate-400 mr-1 hidden md:inline font-mono">Sample:</span>
        {QUICK_DATES.map((d) => {
          const dayNum = d.split('-')[2];
          const isSelected = d === selectedDate;
          return (
            <button
              key={d}
              disabled={disabled}
              onClick={() => onChange(d)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                isSelected
                  ? 'bg-sky-900/60 text-sky-200 border border-sky-700 font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              Jan {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};
