import React, { useState, useEffect } from 'react';
import { AccuracyResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { DailyAccuracyTable } from '../components/tables/DailyAccuracyTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Calculator, AlertTriangle, BookOpen, Layers } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Date Range Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-navy-900/80 p-2.5 rounded-lg border border-navy-700">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Calculator className="w-4 h-4 text-accent-teal" />
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
              className="bg-navy-950 border border-navy-600 rounded px-2.5 py-1 text-xs font-mono font-bold text-accent-cyan"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              min="2026-01-01"
              max="2026-01-31"
              value={endDate}
              disabled={loading}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-navy-950 border border-navy-600 rounded px-2.5 py-1 text-xs font-mono font-bold text-accent-cyan"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => { setStartDate('2026-01-01'); setEndDate('2026-01-07'); }}
              className="px-2 py-0.5 text-[11px] font-mono rounded bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700"
            >
              Week 1
            </button>
            <button
              onClick={() => { setStartDate('2026-01-01'); setEndDate('2026-01-15'); }}
              className="px-2 py-0.5 text-[11px] font-mono rounded bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700"
            >
              1-15 Jan
            </button>
            <button
              onClick={() => { setStartDate('2026-01-01'); setEndDate('2026-01-31'); }}
              className="px-2 py-0.5 text-[11px] font-mono rounded bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700"
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

      {loading && <LoadingSpinner message="Evaluating multi-day outturn accuracy metrics..." />}
      {error && <ErrorAlert title="Calculation Error" message={error} />}

      {!loading && data && (
        <>
          {/* Missing Data Warning if applicable */}
          {data.aggregate_metrics.excluded_observations > 0 && (
            <div className="rounded-lg bg-amber-950/40 border border-amber-700/60 p-3 text-xs text-amber-200 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Missing Observation Notice:</span>{' '}
                {data.aggregate_metrics.excluded_observations} settlement periods were excluded from accuracy metrics
                because either the actual metered generation or eligible forecast was missing.
                Metrics are calculated strictly across the {data.aggregate_metrics.valid_observations} complete matched pairs.
              </div>
            </div>
          )}

          {/* Aggregate KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title="Aggregate MAE"
              value={data.aggregate_metrics.mae_mw}
              unit="MW"
              subtitle={`Mean absolute error across ${data.aggregate_metrics.valid_observations} periods`}
              tooltip="MAE = (1/N) * Sum(|Forecast - Actual|)"
              highlight="teal"
            />
            <MetricCard
              title="Aggregate RMSE"
              value={data.aggregate_metrics.rmse_mw}
              unit="MW"
              subtitle="Square root of mean squared error across the window"
              tooltip="RMSE = Sqrt((1/N) * Sum((Forecast - Actual)^2))"
              highlight="neutral"
            />
            <MetricCard
              title="Aggregate WAPE"
              value={data.aggregate_metrics.wape_percent}
              unit="%"
              subtitle="Weighted percentage volume error over total actual wind generation"
              tooltip="WAPE = (Sum(|Error|) / Sum(Actual)) * 100"
              highlight="green"
            />
            <MetricCard
              title="Aggregate Bias"
              value={data.aggregate_metrics.bias_mw}
              unit="MW"
              signPrefix={true}
              subtitle={
                data.aggregate_metrics.bias_direction === 'OVERFORECASTING'
                  ? 'Systemic Overforecast (Short risk)'
                  : data.aggregate_metrics.bias_direction === 'UNDERFORECASTING'
                  ? 'Systemic Underforecast (Long risk)'
                  : 'Balanced on average'
              }
              tooltip="Bias = Mean(Forecast - Actual). Positive = Overforecast; Negative = Underforecast."
              highlight={
                data.aggregate_metrics.bias_direction === 'OVERFORECASTING'
                  ? 'amber'
                  : data.aggregate_metrics.bias_direction === 'UNDERFORECASTING'
                  ? 'teal'
                  : 'neutral'
              }
            />
          </div>

          {/* Observation Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="rounded-lg bg-navy-900/80 p-3 border border-navy-800">
              <span className="text-slate-400">Total Settlement Periods:</span>
              <div className="text-lg font-bold text-slate-100 mt-0.5">{data.aggregate_metrics.total_periods}</div>
            </div>
            <div className="rounded-lg bg-navy-900/80 p-3 border border-navy-800">
              <span className="text-slate-400">Valid Evaluated Pairs:</span>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{data.aggregate_metrics.valid_observations}</div>
            </div>
            <div className="rounded-lg bg-navy-900/80 p-3 border border-navy-800">
              <span className="text-slate-400">Excluded (Missing Data):</span>
              <div className={`text-lg font-bold mt-0.5 ${data.aggregate_metrics.excluded_observations > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                {data.aggregate_metrics.excluded_observations}
              </div>
            </div>
            <div className="rounded-lg bg-navy-900/80 p-3 border border-navy-800">
              <span className="text-slate-400">Mean Wind Fleet Actual:</span>
              <div className="text-lg font-bold text-accent-cyan mt-0.5">
                {data.aggregate_metrics.mean_actual_mw?.toLocaleString() ?? 'N/A'} MW
              </div>
            </div>
          </div>

          {/* Daily Accuracy Table */}
          <DailyAccuracyTable records={data.daily_breakdown} />

          {/* Metric Definitions & Methodology Explanations Card */}
          <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-navy-800 pb-3">
              <BookOpen className="w-5 h-5 text-accent-teal" />
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                Accuracy Metric Definitions & Mathematical Formulation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono leading-relaxed">
              <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                <span className="font-bold text-cyan-400 font-sans uppercase">Mean Absolute Error (MAE)</span>
                <p className="text-slate-300 font-sans">
                  Represents the average expected magnitude of forecast deviations across delivery intervals, in Megawatts (MW).
                </p>
                <div className="bg-navy-900 p-2 rounded text-slate-200">
                  MAE = (1 / N) * ∑ |Forecast_i - Actual_i|
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                <span className="font-bold text-emerald-400 font-sans uppercase">Root Mean Squared Error (RMSE)</span>
                <p className="text-slate-300 font-sans">
                  Penalizes large outlier forecast errors significantly more than small deviations due to squaring. Critical for reserve sizing.
                </p>
                <div className="bg-navy-900 p-2 rounded text-slate-200">
                  RMSE = √ [ (1 / N) * ∑ (Forecast_i - Actual_i)² ]
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                <span className="font-bold text-accent-teal font-sans uppercase">Weighted Absolute Percentage Error (WAPE)</span>
                <p className="text-slate-300 font-sans">
                  Avoids individual interval division by zero (e.g. low wind calm intervals) by summing total error volume over total generation.
                </p>
                <div className="bg-navy-900 p-2 rounded text-slate-200">
                  WAPE (%) = [ ∑ |Forecast_i - Actual_i| / ∑ |Actual_i| ] * 100
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                <span className="font-bold text-amber-400 font-sans uppercase">Forecast Bias & Sign Convention</span>
                <p className="text-slate-300 font-sans">
                  Signed deviation: Forecast minus Actual. Positive bias indicates overforecasting; negative bias indicates underforecasting.
                </p>
                <div className="bg-navy-900 p-2 rounded text-slate-200">
                  Bias = (1 / N) * ∑ (Forecast_i - Actual_i)
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
