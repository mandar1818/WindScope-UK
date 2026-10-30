import React, { useState, useEffect } from 'react';
import { OverviewResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { DateSelector } from '../components/common/DateSelector';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { ProcurementExposureWidget } from '../components/exposure/ProcurementExposureWidget';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const ProcurementExposurePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [selectedCutoff, setSelectedCutoff] = useState<CutoffType>('day_ahead_1100');
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (date: string, cutoff: CutoffType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getOverview(date, cutoff);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load procurement exposure data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate, selectedCutoff);
  }, [selectedDate, selectedCutoff]);

  return (
    <div className="space-y-4">
      {/* Control Header Ribbon */}
      <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Day-Ahead Procurement Exposure &amp; Physical Balancing Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Translating wind power forecast uncertainty into energy imbalance volume (MWh) and cash-out settlement risk under BSC Section T
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Delivery Date: <strong className="text-slate-100">{selectedDate}</strong>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <DateSelector
            selectedDate={selectedDate}
            onChange={setSelectedDate}
            disabled={loading}
          />
          <CutoffSelector
            selectedCutoff={selectedCutoff}
            onChange={setSelectedCutoff}
            disabled={loading}
          />
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <CardSkeleton />
          <ChartSkeleton height={240} />
          <TableSkeleton rows={6} />
        </div>
      )}

      {error && !loading && (
        <ErrorAlert
          title="Procurement Exposure Error"
          message={error}
          onRetry={() => loadData(selectedDate, selectedCutoff)}
        />
      )}

      {!loading && !error && data && (
        <>
          {/* Main Procurement Exposure Widget & Integrated Charts */}
          <ProcurementExposureWidget
            exposure={data.exposure_summary}
            generationPoints={data.generation_series}
          />

          {/* Half-Hourly Exposure Breakdown Table */}
          <div className="rounded-lg border border-slate-800 bg-[#0e1526] overflow-hidden space-y-0">
            <div className="p-3.5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Half-Hourly Physical Imbalance Schedule (48 Settlement Periods)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Energy volume exposure computed as Power Deviation (MW) &times; 0.5 hours = Interval MWh
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {data.selected_date} Delivery
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0a0f1d] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-medium text-[11px]">SP</th>
                    <th className="py-2.5 px-3 font-medium text-[11px]">Time (London GMT)</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-right text-emerald-400">Actual Outturn</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-right text-sky-400">Selected Forecast</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-right">Power Delta (MW)</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-right text-slate-100">Interval Energy (MWh)</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-center">Portfolio Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {data.generation_series.map((p) => {
                    const err = p.error_mw;
                    const energyMwh = err !== null ? err * 0.5 : null;
                    const isShort = err !== null && err > 0;
                    const isLong = err !== null && err < 0;

                    return (
                      <tr key={p.settlement_period} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-300 tabular-nums">{p.settlement_period}</td>
                        <td className="py-2 px-3 text-slate-200 font-sans">{p.start_time_local.split(' ')[1] || p.start_time_local}</td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-bold tabular-nums">
                          {p.actual_generation_mw !== null ? `${p.actual_generation_mw.toLocaleString()} MW` : 'Missing'}
                        </td>
                        <td className="py-2 px-3 text-right text-sky-400 font-bold tabular-nums">
                          {p.forecast_generation_mw !== null ? `${p.forecast_generation_mw.toLocaleString()} MW` : 'Missing'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold tabular-nums">
                          {err !== null ? (
                            <span className={isShort ? 'text-amber-400' : isLong ? 'text-sky-300' : 'text-slate-400'}>
                              {err > 0 ? `+` : ''}{err.toLocaleString()} MW
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-100 tabular-nums">
                          {energyMwh !== null ? (
                            <span className={isShort ? 'text-amber-400' : isLong ? 'text-sky-300' : 'text-slate-300'}>
                              {energyMwh > 0 ? `+` : ''}{energyMwh.toFixed(1)} MWh
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isShort ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 font-sans">
                              <TrendingUp className="w-3 h-3 text-amber-400" /> SHORT (Deficit)
                            </span>
                          ) : isLong ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80 font-sans">
                              <TrendingDown className="w-3 h-3 text-sky-400" /> LONG (Surplus)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-sans">
                              Balanced
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
