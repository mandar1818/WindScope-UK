import React, { useState, useEffect } from 'react';
import { AccuracyResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { DailyAccuracyTable } from '../components/tables/DailyAccuracyTable';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import {
  Calculator,
  AlertTriangle,
  BookOpen,
  Layers,
  Award,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';

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

  // Derive best and worst performing days from daily breakdown
  const daily = data?.daily_breakdown || [];
  const bestDay = daily.length > 0
    ? [...daily].filter((d) => d.mae_mw !== null).sort((a, b) => (a.mae_mw ?? 999999) - (b.mae_mw ?? 999999))[0]
    : null;
  const worstDay = daily.length > 0
    ? [...daily].filter((d) => d.mae_mw !== null).sort((a, b) => (b.mae_mw ?? 0) - (a.mae_mw ?? 0))[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Control Header Ribbon */}
      <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-navy-800 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-accent-cyan border border-cyan-800">
                BENCHMARK EVALUATION
              </span>
              <h2 className="text-base font-bold text-slate-100 tracking-wide font-sans">
                Multi-Day Wind Forecast Accuracy &amp; Outturn Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Evaluate portfolio forecast error distributions, volumetric WAPE, and systematic forecast bias across January 2026
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-navy-950 border border-navy-800 text-slate-300">
              Evaluation Window: <strong className="text-accent-teal">{startDate} &rarr; {endDate}</strong>
            </span>
          </div>
        </div>

        {/* Filters */}
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
                className="bg-navy-950 border border-navy-600 rounded px-2.5 py-1 text-xs font-mono font-bold text-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-teal"
              />
              <span className="text-slate-400 text-xs font-mono">to</span>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={endDate}
                disabled={loading}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-navy-950 border border-navy-600 rounded px-2.5 py-1 text-xs font-mono font-bold text-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-teal"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setStartDate('2026-01-01');
                  setEndDate('2026-01-07');
                }}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700 transition-colors"
              >
                Week 1
              </button>
              <button
                onClick={() => {
                  setStartDate('2026-01-01');
                  setEndDate('2026-01-15');
                }}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700 transition-colors"
              >
                1-15 Jan
              </button>
              <button
                onClick={() => {
                  setStartDate('2026-01-01');
                  setEndDate('2026-01-31');
                }}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700 transition-colors"
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
            <div className="rounded-lg bg-amber-950/40 border border-amber-700/60 p-3.5 text-xs text-amber-200 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="font-sans">
                <span className="font-bold">Missing Observation Notice:</span>{' '}
                {data.aggregate_metrics.excluded_observations} settlement periods were excluded from accuracy metrics
                because either the actual metered generation or eligible forecast was missing.
                Metrics are calculated strictly across the {data.aggregate_metrics.valid_observations} complete matched pairs.
              </div>
            </div>
          )}

          {/* Aggregate KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              title="Aggregate MAE"
              value={data.aggregate_metrics.mae_mw}
              unit="MW"
              subtitle={`Mean absolute error across ${data.aggregate_metrics.valid_observations} evaluated periods`}
              tooltip="MAE = (1/N) * Sum(|Forecast - Actual|)"
              highlight="teal"
              precision={1}
              statusBadge="TRACKING ACCURACY"
            />
            <MetricCard
              title="Aggregate RMSE"
              value={data.aggregate_metrics.rmse_mw}
              unit="MW"
              subtitle="Square root of mean squared error (heavily penalizes outliers)"
              tooltip="RMSE = Sqrt((1/N) * Sum((Forecast - Actual)^2))"
              highlight="neutral"
              precision={1}
              statusBadge="TAIL RISK"
            />
            <MetricCard
              title="Aggregate WAPE"
              value={data.aggregate_metrics.wape_percent}
              unit="%"
              subtitle="Volume error weighted over total actual fleet wind generation"
              tooltip="WAPE = (Sum(|Error|) / Sum(Actual)) * 100"
              highlight="green"
              precision={1}
              statusBadge="VOLUME ERROR"
            />
            <MetricCard
              title="Aggregate Forecast Bias"
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
              precision={1}
              statusBadge={data.aggregate_metrics.bias_direction}
            />
          </div>

          {/* Performance Extremes & Observation Accounting Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div className="rounded-lg bg-[#0c1427] p-3.5 border border-navy-800">
              <span className="text-slate-400 text-[11px] block">Observation Integrity</span>
              <div className="text-base font-bold text-slate-100 mt-1">
                {data.aggregate_metrics.valid_observations} / {data.aggregate_metrics.total_periods} SPs
              </div>
              <span className="text-[10px] text-slate-500 font-sans">
                {data.aggregate_metrics.excluded_observations > 0
                  ? `${data.aggregate_metrics.excluded_observations} missing pairs excluded`
                  : '100% paired observations'}
              </span>
            </div>

            <div className="rounded-lg bg-[#0c1427] p-3.5 border border-navy-800">
              <span className="text-slate-400 text-[11px] block">Fleet Mean Actual</span>
              <div className="text-base font-bold text-accent-cyan mt-1">
                {data.aggregate_metrics.mean_actual_mw?.toLocaleString() ?? 'N/A'} MW
              </div>
              <span className="text-[10px] text-slate-500 font-sans">
                Mean transmission wind outturn
              </span>
            </div>

            <div className="rounded-lg bg-[#0c1427] p-3.5 border border-navy-800">
              <span className="text-slate-400 text-[11px] block flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> Best Accuracy Day
              </span>
              <div className="text-base font-bold text-emerald-400 mt-1">
                {bestDay ? `${bestDay.settlement_date}` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-400 font-sans">
                {bestDay ? `MAE ${bestDay.mae_mw?.toFixed(0)} MW (WAPE ${bestDay.wape_percent?.toFixed(1)}%)` : ''}
              </span>
            </div>

            <div className="rounded-lg bg-[#0c1427] p-3.5 border border-navy-800">
              <span className="text-slate-400 text-[11px] block flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Highest Variance Day
              </span>
              <div className="text-base font-bold text-amber-400 mt-1">
                {worstDay ? `${worstDay.settlement_date}` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-400 font-sans">
                {worstDay ? `MAE ${worstDay.mae_mw?.toFixed(0)} MW (WAPE ${worstDay.wape_percent?.toFixed(1)}%)` : ''}
              </span>
            </div>
          </div>

          {/* Daily Accuracy Table */}
          <DailyAccuracyTable records={data.daily_breakdown} />

          {/* Metric Formulations Card */}
          <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-navy-800 pb-3">
              <BookOpen className="w-5 h-5 text-accent-teal" />
              <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
                Quantitative Accuracy Formulations &amp; Mathematical Conventions
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono leading-relaxed">
              <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                <span className="font-bold text-cyan-400 font-sans uppercase">Mean Absolute Error (MAE)</span>
                <p className="text-slate-300 font-sans text-[11px]">
                  Average expected magnitude of forecast error across evaluated delivery intervals. Linear penalty.
                </p>
                <div className="bg-[#070d19] p-2 rounded text-slate-200 border border-navy-850">
                  MAE = (1 / N) * &sum; |Forecast_i - Actual_i|
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                <span className="font-bold text-emerald-400 font-sans uppercase">Root Mean Squared Error (RMSE)</span>
                <p className="text-slate-300 font-sans text-[11px]">
                  Penalizes large outlier forecast errors quadratic-wise. Critical for power reserve dimensioning.
                </p>
                <div className="bg-[#070d19] p-2 rounded text-slate-200 border border-navy-850">
                  RMSE = &radic; [ (1 / N) * &sum; (Forecast_i - Actual_i)&sup2; ]
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                <span className="font-bold text-accent-teal font-sans uppercase">Weighted Absolute Percentage Error (WAPE)</span>
                <p className="text-slate-300 font-sans text-[11px]">
                  Avoids single-interval division by zero during calm wind periods by summing total error volume over total actual volume.
                </p>
                <div className="bg-[#070d19] p-2 rounded text-slate-200 border border-navy-850">
                  WAPE (%) = [ &sum; |Forecast_i - Actual_i| / &sum; |Actual_i| ] * 100
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                <span className="font-bold text-amber-400 font-sans uppercase">Forecast Bias &amp; Directional Risk</span>
                <p className="text-slate-300 font-sans text-[11px]">
                  Signed deviation: Forecast minus Actual. Positive bias = Overforecast (Short risk); Negative bias = Underforecast (Long risk).
                </p>
                <div className="bg-[#070d19] p-2 rounded text-slate-200 border border-navy-850">
                  Bias = (1 / N) * &sum; (Forecast_i - Actual_i)
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
