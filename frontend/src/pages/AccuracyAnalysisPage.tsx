import React, { useState, useEffect } from 'react';
import { AccuracyResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { DailyAccuracyTable } from '../components/tables/DailyAccuracyTable';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { Calculator, AlertTriangle } from 'lucide-react';

export const AccuracyAnalysisPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-01-15');
  const [selectedCutoff, setSelectedCutoff] = useState<CutoffType>('day_ahead_1100');

  const [data, setData] = useState<AccuracyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (start: string, end: string, cutoff: CutoffType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAccuracy(start, end, cutoff);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate accuracy metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(startDate, endDate, selectedCutoff);
  }, [startDate, endDate, selectedCutoff]);

  const daily = data?.daily_breakdown || [];
  const bestDay = daily.length > 0
    ? [...daily].filter((d) => d.mae_mw !== null).sort((a, b) => (a.mae_mw ?? 999999) - (b.mae_mw ?? 999999))[0]
    : null;
  const worstDay = daily.length > 0
    ? [...daily].filter((d) => d.mae_mw !== null).sort((a, b) => (b.mae_mw ?? 0) - (a.mae_mw ?? 0))[0]
    : null;

  return (
    <div className="space-y-4">
      {/* Control Header */}
      <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Multi-Day Forecast Accuracy Evaluation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Portfolio error distributions, volumetric WAPE, and systematic forecast bias across January 2026
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Window: <strong className="text-slate-100">{startDate} &rarr; {endDate}</strong>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {/* Date Range Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-300">
              <Calculator className="w-3.5 h-3.5 text-sky-400" />
              <span>Range:</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={startDate}
                disabled={loading}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono font-medium text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
              />
              <span className="text-slate-500 text-xs font-mono">to</span>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={endDate}
                disabled={loading}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono font-medium text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setStartDate('2026-01-01');
                  setEndDate('2026-01-07');
                }}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
              >
                W1
              </button>
              <button
                onClick={() => {
                  setStartDate('2026-01-01');
                  setEndDate('2026-01-15');
                }}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
              >
                1-15 Jan
              </button>
              <button
                onClick={() => {
                  setStartDate('2026-01-01');
                  setEndDate('2026-01-31');
                }}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
              >
                Full Jan
              </button>
            </div>
          </div>

          {/* Cutoff Selector */}
          <CutoffSelector
            selectedCutoff={selectedCutoff}
            onChange={setSelectedCutoff}
            disabled={loading}
          />
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={8} />
        </div>
      )}

      {error && !loading && <ErrorAlert title="Calculation Error" message={error} />}

      {!loading && data && (
        <>
          {/* Missing Data Notice if applicable */}
          {data.aggregate_metrics.excluded_observations > 0 && (
            <div className="rounded border border-amber-800/80 bg-amber-950/40 p-3 text-xs text-amber-200 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="font-sans">
                <span className="font-semibold text-amber-300">Observation Filter Note:</span>{' '}
                {data.aggregate_metrics.excluded_observations} settlement periods were excluded because either metered actual generation or valid forecast was absent.
                Metrics are computed across the {data.aggregate_metrics.valid_observations} complete matched pairs.
              </div>
            </div>
          )}

          {/* Aggregate KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              title="Aggregate MAE"
              value={data.aggregate_metrics.mae_mw}
              unit="MW"
              subtitle={`Across ${data.aggregate_metrics.valid_observations} matched periods`}
              tooltip="MAE = (1/N) * Sum(|Forecast - Actual|)"
              highlight="neutral"
              precision={1}
            />
            <MetricCard
              title="Aggregate RMSE"
              value={data.aggregate_metrics.rmse_mw}
              unit="MW"
              subtitle="Square root of mean squared error"
              tooltip="RMSE = Sqrt((1/N) * Sum((Forecast - Actual)^2))"
              highlight="neutral"
              precision={1}
            />
            <MetricCard
              title="Aggregate WAPE"
              value={data.aggregate_metrics.wape_percent}
              unit="%"
              subtitle="Weighted percentage volume error"
              tooltip="WAPE = (Sum(|Error|) / Sum(Actual)) * 100"
              highlight="teal"
              precision={1}
            />
            <MetricCard
              title="Aggregate Forecast Bias"
              value={data.aggregate_metrics.bias_mw}
              unit="MW"
              signPrefix={true}
              subtitle={
                data.aggregate_metrics.bias_direction === 'OVERFORECASTING'
                  ? 'System Overforecasting (Short risk)'
                  : data.aggregate_metrics.bias_direction === 'UNDERFORECASTING'
                  ? 'System Underforecasting (Long surplus)'
                  : 'System Balanced'
              }
              tooltip="Bias = Mean(Forecast - Actual)"
              highlight={
                data.aggregate_metrics.bias_direction === 'OVERFORECASTING'
                  ? 'amber'
                  : data.aggregate_metrics.bias_direction === 'UNDERFORECASTING'
                  ? 'teal'
                  : 'neutral'
              }
              precision={1}
            />
          </div>

          {/* Best / Worst Performing Delivery Days */}
          {(bestDay || worstDay) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {bestDay && (
                <div className="p-3 rounded-lg bg-[#0e1526] border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 text-[11px] block font-sans">Lowest Error Delivery Day:</span>
                    <strong className="text-emerald-400 font-bold text-sm">{bestDay.settlement_date}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block font-sans">Daily MAE:</span>
                    <strong className="text-emerald-400 font-bold text-sm tabular-nums">
                      {bestDay.mae_mw?.toLocaleString()} MW
                    </strong>
                  </div>
                </div>
              )}
              {worstDay && (
                <div className="p-3 rounded-lg bg-[#0e1526] border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 text-[11px] block font-sans">Highest Error Delivery Day:</span>
                    <strong className="text-amber-400 font-bold text-sm">{worstDay.settlement_date}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block font-sans">Daily MAE:</span>
                    <strong className="text-amber-400 font-bold text-sm tabular-nums">
                      {worstDay.mae_mw?.toLocaleString()} MW
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Daily Accuracy Table */}
          <DailyAccuracyTable
            records={data.daily_breakdown}
          />
        </>
      )}
    </div>
  );
};
