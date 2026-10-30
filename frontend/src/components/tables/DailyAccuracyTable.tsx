import React from 'react';
import { DailyAccuracyRecord } from '../../types/api';
import { TrendingUp, TrendingDown, Calendar, ArrowRight } from 'lucide-react';

interface DailyAccuracyTableProps {
  records: DailyAccuracyRecord[];
  onSelectDate?: (date: string) => void;
  selectedDate?: string;
}

export const DailyAccuracyTable: React.FC<DailyAccuracyTableProps> = ({
  records,
  onSelectDate,
  selectedDate,
}) => {
  if (!records || records.length === 0) {
    return (
      <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-8 text-center text-slate-500 italic font-mono text-xs">
        No daily accuracy metrics available for the selected interval.
      </div>
    );
  }

  // Find max MAE for proportional visual bar
  const maxMae = Math.max(...records.map((r) => r.mae_mw ?? 0), 1);

  return (
    <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] shadow-xl overflow-hidden space-y-0">
      <div className="p-4 border-b border-navy-800 flex justify-between items-center bg-navy-900/50">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
            Daily Accuracy Performance Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Outturn metrics calculated across 48 half-hour settlement periods per delivery day
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {records.length} {records.length === 1 ? 'day' : 'days'} evaluated
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#070d19] text-slate-400 border-b border-navy-800">
            <tr>
              <th className="py-2.5 px-4 font-semibold uppercase text-[10px]">Settlement Date</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right">Valid Obs</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right">Excluded</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right text-emerald-400">Mean Actual</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right text-cyan-400">Mean Forecast</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right text-slate-200">MAE (MW)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right text-slate-200">RMSE (MW)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right text-accent-teal">WAPE (%)</th>
              <th className="py-2.5 px-4 font-semibold uppercase text-[10px] text-right">Forecast Bias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-850">
            {records.map((r) => {
              const isSelected = r.settlement_date === selectedDate;
              const bias = r.bias_mw;
              const isOver = bias !== null && bias > 25.0;
              const isUnder = bias !== null && bias < -25.0;
              const maePercent = r.mae_mw ? (r.mae_mw / maxMae) * 100 : 0;

              return (
                <tr
                  key={r.settlement_date}
                  onClick={() => onSelectDate && onSelectDate(r.settlement_date)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-accent-teal/15 border-l-4 border-l-accent-teal font-semibold'
                      : 'hover:bg-navy-850/50'
                  }`}
                  title="Click to inspect this delivery date"
                >
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{r.settlement_date}</span>
                    {isSelected && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{r.valid_observations}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{r.excluded_observations}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                    {r.mean_actual_mw !== null ? `${r.mean_actual_mw.toLocaleString()} MW` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-400 font-bold">
                    {r.mean_forecast_mw !== null ? `${r.mean_forecast_mw.toLocaleString()} MW` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-bold">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-12 h-1.5 rounded-full bg-navy-950 overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${maePercent}%` }}
                        />
                      </div>
                      <span>{r.mae_mw !== null ? `${r.mae_mw.toLocaleString()} MW` : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {r.rmse_mw !== null ? `${r.rmse_mw.toLocaleString()} MW` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-accent-cyan font-bold">
                    {r.wape_percent !== null ? `${r.wape_percent.toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold">
                    {bias !== null ? (
                      <span
                        className={
                          isOver ? 'text-amber-400' : isUnder ? 'text-cyan-300' : 'text-slate-300'
                        }
                      >
                        {bias > 0 ? `+${bias.toLocaleString()}` : bias.toLocaleString()} MW
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
