import React from 'react';
import { DailyAccuracyRecord } from '../../types/api';
import { Calendar } from 'lucide-react';

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
      <div className="rounded-lg border border-nature-border bg-white p-8 text-center text-nature-muted font-mono text-xs shadow-sm">
        No daily accuracy metrics available for the selected interval.
      </div>
    );
  }

  const maxMae = Math.max(...records.map((r) => r.mae_mw ?? 0), 1);

  return (
    <div className="rounded-lg border border-nature-border bg-white overflow-hidden space-y-0 shadow-sm">
      <div className="p-3.5 border-b border-nature-border flex justify-between items-center bg-nature-bg">
        <div>
          <h3 className="text-sm font-semibold text-nature-text">
            Daily Accuracy Performance Breakdown
          </h3>
          <p className="text-xs text-nature-muted mt-0.5">
            Outturn metrics calculated across 48 half-hour settlement periods per delivery day
          </p>
        </div>
        <div className="text-xs text-nature-muted font-mono">
          {records.length} {records.length === 1 ? 'day' : 'days'} evaluated
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-nature-bg text-nature-muted border-b border-nature-border">
            <tr>
              <th className="py-2.5 px-3.5 font-medium text-[11px]">Settlement Date</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-right">Valid</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-right">Excluded</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-right text-nature-actual">Mean Actual</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-right text-nature-forecast">Mean Forecast</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-right text-nature-text">MAE (MW)</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-right text-nature-muted">RMSE (MW)</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-right text-nature-forecast">WAPE (%)</th>
              <th className="py-2.5 px-3.5 font-medium text-[11px] text-right">Forecast Bias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nature-border">
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
                      ? 'bg-nature-forest-light border-l-2 border-l-nature-forest font-semibold'
                      : 'hover:bg-nature-bg/60'
                  }`}
                  title="Click to inspect this delivery date"
                >
                  <td className="py-2.5 px-3.5 font-sans font-medium text-nature-text flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-nature-muted" />
                    <span>{r.settlement_date}</span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-nature-forest-light text-nature-forest border border-nature-forest/40 font-mono">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-nature-text tabular-nums">{r.valid_observations}</td>
                  <td className="py-2.5 px-3 text-right text-nature-muted tabular-nums">{r.excluded_observations}</td>
                  <td className="py-2.5 px-3 text-right text-nature-actual tabular-nums font-bold">
                    {r.mean_actual_mw !== null ? `${r.mean_actual_mw.toLocaleString()} MW` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-nature-forecast tabular-nums font-bold">
                    {r.mean_forecast_mw !== null ? `${r.mean_forecast_mw.toLocaleString()} MW` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-nature-text font-bold tabular-nums">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-12 h-1.5 rounded-full bg-nature-border overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-nature-forest rounded-full"
                          style={{ width: `${maePercent}%` }}
                        />
                      </div>
                      <span>{r.mae_mw !== null ? `${r.mae_mw.toLocaleString()} MW` : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-nature-muted tabular-nums">
                    {r.rmse_mw !== null ? `${r.rmse_mw.toLocaleString()} MW` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-nature-forecast tabular-nums font-bold">
                    {r.wape_percent !== null ? `${r.wape_percent.toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-bold tabular-nums">
                    {bias !== null ? (
                      <span
                        className={
                          isOver ? 'text-nature-risk' : isUnder ? 'text-nature-forecast' : 'text-nature-text'
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
