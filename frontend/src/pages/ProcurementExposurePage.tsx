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
      <div className="rounded-lg border border-nature-border bg-white p-3.5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-nature-border gap-2">
          <div>
            <h2 className="text-base font-semibold text-nature-text">
              Day-Ahead Procurement Exposure &amp; Physical Balancing Analytics
            </h2>
            <p className="text-xs text-nature-muted mt-0.5">
              Translating wind power forecast uncertainty into energy imbalance volume (MWh) and cash-out settlement risk under BSC Section T
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-nature-bg border border-nature-border text-nature-text font-medium">
              Delivery Date: <strong className="text-nature-forest">{selectedDate}</strong>
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
          <div className="rounded-lg border border-nature-border bg-white overflow-hidden space-y-0 shadow-sm">
            <div className="p-3.5 border-b border-nature-border flex justify-between items-center bg-nature-bg">
              <div>
                <h3 className="text-sm font-semibold text-nature-text">
                  Half-Hourly Physical Imbalance Schedule (48 Settlement Periods)
                </h3>
                <p className="text-xs text-nature-muted mt-0.5">
                  Energy volume exposure computed as Power Deviation (MW) &times; 0.5 hours = Interval MWh
                </p>
              </div>
              <span className="text-xs text-nature-muted font-mono">
                {data.selected_date} Delivery
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-nature-bg text-nature-muted border-b border-nature-border">
                  <tr>
                    <th className="py-2.5 px-3 font-medium text-[11px]">SP</th>
                    <th className="py-2.5 px-3 font-medium text-[11px]">Time (London GMT)</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-right text-nature-actual">Actual Outturn</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-right text-nature-forecast">Selected Forecast</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-right">Power Delta (MW)</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-right text-nature-text">Interval Energy (MWh)</th>
                    <th className="py-2.5 px-3 font-medium text-[11px] text-center">Portfolio Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nature-border">
                  {data.generation_series.map((p) => {
                    const err = p.error_mw;
                    const energyMwh = err !== null ? err * 0.5 : null;
                    const isShort = err !== null && err > 0;
                    const isLong = err !== null && err < 0;

                    return (
                      <tr key={p.settlement_period} className="hover:bg-nature-bg/60 transition-colors">
                        <td className="py-2 px-3 font-bold text-nature-text tabular-nums">{p.settlement_period}</td>
                        <td className="py-2 px-3 text-nature-text font-sans">{p.start_time_local.split(' ')[1] || p.start_time_local}</td>
                        <td className="py-2 px-3 text-right text-nature-actual font-bold tabular-nums">
                          {p.actual_generation_mw !== null ? `${p.actual_generation_mw.toLocaleString()} MW` : 'Missing'}
                        </td>
                        <td className="py-2 px-3 text-right text-nature-forecast font-bold tabular-nums">
                          {p.forecast_generation_mw !== null ? `${p.forecast_generation_mw.toLocaleString()} MW` : 'Missing'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold tabular-nums">
                          {err !== null ? (
                            <span className={isShort ? 'text-nature-risk' : isLong ? 'text-nature-forecast' : 'text-nature-muted'}>
                              {err > 0 ? `+` : ''}{err.toLocaleString()} MW
                            </span>
                          ) : (
                            <span className="text-nature-muted/60">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-nature-text tabular-nums">
                          {energyMwh !== null ? (
                            <span className={isShort ? 'text-nature-risk' : isLong ? 'text-nature-forecast' : 'text-nature-text'}>
                              {energyMwh > 0 ? `+` : ''}{energyMwh.toFixed(1)} MWh
                            </span>
                          ) : (
                            <span className="text-nature-muted/60">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isShort ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-nature-risk-light text-nature-risk border border-nature-risk/40 font-sans">
                              <TrendingUp className="w-3 h-3 text-nature-risk" /> SHORT (Deficit)
                            </span>
                          ) : isLong ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-nature-forest-light text-nature-forest border border-nature-forest/40 font-sans">
                              <TrendingDown className="w-3 h-3 text-nature-forest" /> LONG (Surplus)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-nature-bg text-nature-muted border border-nature-border font-sans">
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
