import React, { useState, useEffect } from 'react';
import { OverviewResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { DateSelector } from '../components/common/DateSelector';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { ForecastVsActualChart } from '../components/charts/ForecastVsActualChart';
import { ForecastErrorChart } from '../components/charts/ForecastErrorChart';
import { ProcurementExposureWidget } from '../components/exposure/ProcurementExposureWidget';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { CardSkeleton, ChartSkeleton } from '../components/common/Skeleton';
import {
  Database,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  Layers,
  Info,
  FlaskConical,
  BookOpen,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface OverviewPageProps {
  initialDate?: string;
  initialCutoff?: CutoffType;
  onSelectDeliveryPeriod?: (date: string, sp: number) => void;
  onNavigate?: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  initialDate = '2026-01-15',
  initialCutoff = 'day_ahead_1100',
  onNavigate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedCutoff, setSelectedCutoff] = useState<CutoffType>(initialCutoff);
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
      setError(err?.message || 'Failed to load overview data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate, selectedCutoff);
  }, [selectedDate, selectedCutoff]);

  return (
    <div className="space-y-6">
      <section className="mb-6 border-b border-slate-800 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-sky-300/80">Great Britain · Wind generation</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">Forecast performance and delivery exposure</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Compare published wind forecasts with metered generation, using only submissions available at the selected decision cutoff.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onNavigate?.('explorer')} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">View observations</button>
            <button type="button" onClick={() => onNavigate?.('testing-lab')} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">Run validation checks</button>
          </div>
        </div>
      </section>

      {/* Executive Control Header Ribbon */}
      <div className="rounded-md border border-slate-800 bg-[#101b2b] p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-navy-800 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                UK NATIONAL WIND
              </span>
              <h2 className="text-base font-bold text-slate-100 tracking-wide font-sans">
                Wind Power Forecasting &amp; Day-Ahead Procurement Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Reconstructing point-in-time trading intelligence for Great Britain electricity settlement periods
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-navy-950 border border-navy-800 text-slate-300">
              Delivery Date: <strong className="text-sky-300">{selectedDate}</strong>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton height={360} />
          <ChartSkeleton height={240} />
          <ChartSkeleton height={220} />
        </div>
      )}

      {/* Error Notice */}
      {error && !loading && (
        <ErrorAlert
          title="Data Ingestion Error"
          message={error}
          onRetry={() => loadData(selectedDate, selectedCutoff)}
        />
      )}

      {/* Data Loaded Successfully */}
      {!loading && !error && data && (
        <>
          {/* Market Process Notice Banner */}
          <div className="rounded-md bg-slate-900/60 border border-slate-800 p-3.5 flex items-start space-x-3 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-sky-300 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5 font-sans">
              <span className="font-semibold text-slate-100">
                Evaluating {data.selected_date} Delivery with {data.cutoff_info.name}:
              </span>{' '}
              <span className="text-slate-300">
                {data.cutoff_info.description} {data.cutoff_info.market_relevance}
              </span>
            </div>
          </div>

          {/* 5 Primary Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. MAE */}
            <MetricCard
              title="Mean Absolute Error (MAE)"
              value={data.date_metrics.mae_mw}
              unit="MW"
              subtitle="Average magnitude of forecast error across 48 settlement periods"
              tooltip="MAE = (1/N) * Sum(|Forecast - Actual|). Low values indicate tighter tracking."
              highlight="teal"
              precision={1}
              statusBadge="TIGHTNESS"
            />

            {/* 2. RMSE */}
            <MetricCard
              title="Root Mean Squared Error (RMSE)"
              value={data.date_metrics.rmse_mw}
              unit="MW"
              subtitle="Heavily penalizes extreme forecast misses"
              tooltip="RMSE = Sqrt((1/N) * Sum((Forecast - Actual)^2)). Sensitive to large deviations."
              highlight="neutral"
              precision={1}
              statusBadge="OUTLIER SENSITIVITY"
            />

            {/* 3. WAPE */}
            <MetricCard
              title="WAPE Volume Error"
              value={data.date_metrics.wape_percent}
              unit="%"
              subtitle="Weighted percentage volume error over total daily wind volume"
              tooltip="WAPE = (Sum(|Error|) / Sum(Actual)) * 100. Robust metric avoiding individual period division by zero."
              highlight="green"
              precision={1}
              statusBadge="VOLUME ERROR"
            />

            {/* 4. Forecast Bias */}
            <MetricCard
              title="Forecast Bias"
              value={data.date_metrics.bias_mw}
              unit="MW"
              signPrefix={true}
              subtitle={
                data.date_metrics.bias_direction === 'OVERFORECASTING'
                  ? 'System Overforecast (Short risk)'
                  : data.date_metrics.bias_direction === 'UNDERFORECASTING'
                  ? 'System Underforecast (Long risk)'
                  : 'Balanced on average'
              }
              tooltip="Forecast Bias = Mean(Forecast - Actual). Positive indicates overforecasting; negative indicates underforecasting."
              highlight={
                data.date_metrics.bias_direction === 'OVERFORECASTING'
                  ? 'amber'
                  : data.date_metrics.bias_direction === 'UNDERFORECASTING'
                  ? 'teal'
                  : 'neutral'
              }
              precision={1}
              statusBadge={data.date_metrics.bias_direction}
            />

            {/* 5. Valid Observations */}
            <MetricCard
              title="Valid Observations"
              value={data.date_metrics.valid_observations}
              unit="/ 48"
              subtitle={
                data.date_metrics.excluded_observations === 0
                  ? '100% complete half-hourly paired observations'
                  : `${data.date_metrics.excluded_observations} periods excluded due to missing actuals/forecast`
              }
              tooltip="Settlement periods with both metered actual generation and eligible forecasts."
              highlight={data.date_metrics.excluded_observations > 0 ? 'amber' : 'neutral'}
              precision={0}
              statusBadge="OBSERVATION INTEGRITY"
            />
          </div>

          {/* Secondary Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#101b2b] border border-slate-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Fleet Mean Actual:</span>
              <strong className="text-emerald-400">
                {data.date_metrics.mean_actual_mw?.toLocaleString() ?? 'N/A'} MW
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-[#0c1427] border border-navy-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Fleet Mean Forecast:</span>
              <strong className="text-cyan-400">
                {data.date_metrics.mean_forecast_mw?.toLocaleString() ?? 'N/A'} MW
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-[#0c1427] border border-navy-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Net Variance Energy:</span>
              <strong
                className={
                  data.exposure_summary.net_energy_variance_mwh > 0
                    ? 'text-amber-400'
                    : data.exposure_summary.net_energy_variance_mwh < 0
                    ? 'text-cyan-400'
                    : 'text-slate-200'
                }
              >
                {data.exposure_summary.net_energy_variance_mwh > 0 ? '+' : ''}
                {data.exposure_summary.net_energy_variance_mwh.toLocaleString()} MWh
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-[#0c1427] border border-navy-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Dominant Exposure:</span>
              <strong className="text-slate-100 font-sans">
                {data.exposure_summary.dominant_risk_category === 'NET_SHORT_EXPOSURE'
                  ? 'Net Short (Buy)'
                  : data.exposure_summary.dominant_risk_category === 'NET_LONG_EXPOSURE'
                  ? 'Net Long (Spill)'
                  : 'Balanced'}
              </strong>
            </div>
          </div>

          {/* Chart 1: Forecast vs Actual Generation */}
          <ForecastVsActualChart
            data={data.generation_series}
            title={`January 2026 Wind Generation Profile: Delivery Date ${data.selected_date}`}
            subtitle={`Official FUELHH actuals paired with latest WINDFOR submissions prior to ${data.cutoff_info.name}`}
          />

          {/* Chart 2: Forecast Error Analysis */}
          <ForecastErrorChart
            data={data.generation_series}
            title="Settlement Interval Forecast Error (Forecast minus Actual)"
            subtitle="Error in MW for each 30-minute settlement period with directional market risk indicator"
          />

          {/* Chart 3 & Section 5: Day-Ahead Procurement Exposure Analysis */}
          <ProcurementExposureWidget
            exposure={data.exposure_summary}
            generationPoints={data.generation_series}
          />

          {/* Data Freshness & Source Status Footer Card */}
          <div className="rounded-md border border-slate-800 bg-[#0e1726] p-4 text-xs font-mono text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-accent-teal" />
              <span>
                Source: <strong className="text-slate-200">{data.data_source}</strong> ({data.source_status.data_source_description})
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span>
                Resolution: <strong className="text-slate-200">30 minutes</strong>
              </span>
              <span>
                Window: <strong className="text-slate-200">{data.evaluation_window}</strong>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
