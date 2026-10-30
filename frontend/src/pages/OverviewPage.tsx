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
import { Database, Info } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Operational Control Toolbar */}
      <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              National Wind Power Forecasting &amp; Day-Ahead Balancing Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating national metered wind generation against point-in-time Day-Ahead forecasts for GB settlement periods
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Date: <strong className="text-slate-100">{selectedDate}</strong>
            </span>
          </div>
        </div>

        {/* Date and Cutoff Selectors */}
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

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton height={340} />
          <ChartSkeleton height={220} />
          <ChartSkeleton height={240} />
        </div>
      )}

      {/* Error Alert */}
      {error && !loading && (
        <ErrorAlert
          title="Data Ingestion Error"
          message={error}
          onRetry={() => loadData(selectedDate, selectedCutoff)}
        />
      )}

      {/* Main Content Area */}
      {!loading && !error && data && (
        <>
          {/* 5 Primary Analytical Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. MAE */}
            <MetricCard
              title="Mean Absolute Error (MAE)"
              value={data.date_metrics.mae_mw}
              unit="MW"
              subtitle="Average magnitude across 48 periods"
              tooltip="MAE = (1/N) * Sum(|Forecast - Actual|). Low values indicate tighter tracking."
              highlight="neutral"
              precision={1}
            />

            {/* 2. RMSE */}
            <MetricCard
              title="Root Mean Squared Error"
              value={data.date_metrics.rmse_mw}
              unit="MW"
              subtitle="Penalizes large forecast misses"
              tooltip="RMSE = Sqrt((1/N) * Sum((Forecast - Actual)^2)). Sensitive to extreme errors."
              highlight="neutral"
              precision={1}
            />

            {/* 3. WAPE */}
            <MetricCard
              title="WAPE Volume Error"
              value={data.date_metrics.wape_percent}
              unit="%"
              subtitle="Weighted percentage volume error"
              tooltip="WAPE = (Sum(|Error|) / Sum(Actual)) * 100. Stable metric protected against division by zero."
              highlight="teal"
              precision={1}
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
            />

            {/* 5. Valid Observations */}
            <MetricCard
              title="Valid Observations"
              value={data.date_metrics.valid_observations}
              unit="/ 48"
              subtitle={
                data.date_metrics.excluded_observations === 0
                  ? '100% paired observations'
                  : `${data.date_metrics.excluded_observations} periods excluded`
              }
              tooltip="Settlement periods with both metered actual generation and valid forecasts."
              highlight="neutral"
              precision={0}
            />
          </div>

          {/* Secondary Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-[#0e1526] border border-slate-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Mean Actual:</span>
              <strong className="text-emerald-400 tabular-nums">
                {data.date_metrics.mean_actual_mw?.toLocaleString() ?? 'N/A'} MW
              </strong>
            </div>
            <div className="p-2.5 rounded bg-[#0e1526] border border-slate-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Mean Forecast:</span>
              <strong className="text-sky-400 tabular-nums">
                {data.date_metrics.mean_forecast_mw?.toLocaleString() ?? 'N/A'} MW
              </strong>
            </div>
            <div className="p-2.5 rounded bg-[#0e1526] border border-slate-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Net Energy Variance:</span>
              <strong
                className={`tabular-nums ${
                  data.exposure_summary.net_energy_variance_mwh > 0
                    ? 'text-amber-400'
                    : data.exposure_summary.net_energy_variance_mwh < 0
                    ? 'text-sky-400'
                    : 'text-slate-200'
                }`}
              >
                {data.exposure_summary.net_energy_variance_mwh > 0 ? '+' : ''}
                {data.exposure_summary.net_energy_variance_mwh.toLocaleString()} MWh
              </strong>
            </div>
            <div className="p-2.5 rounded bg-[#0e1526] border border-slate-800 text-slate-300 flex justify-between items-center">
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
            subtitle={`Official FUELHH actuals paired with WINDFOR submissions selected prior to ${data.cutoff_info.name}`}
          />

          {/* Chart 2: Forecast Error Analysis */}
          <ForecastErrorChart
            data={data.generation_series}
            title="Half-Hourly Forecast Deviation (Forecast minus Actual)"
            subtitle="Error in MW for each 30-minute settlement period with directional risk indicators"
          />

          {/* Chart 3 & Section: Day-Ahead Procurement Exposure Analysis */}
          <ProcurementExposureWidget
            exposure={data.exposure_summary}
            generationPoints={data.generation_series}
          />

          {/* Data Freshness & Source Status Footer Card */}
          <div className="rounded border border-slate-800 bg-[#0a0f1d] p-3 text-xs font-mono text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Data Sources: <strong className="text-slate-300">FUELHH &amp; WINDFOR</strong> ({data.source_status.data_source_description})
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span>
                Resolution: <strong className="text-slate-300">30 min (48 SPs)</strong>
              </span>
              <span>
                Window: <strong className="text-slate-300">{data.evaluation_window}</strong>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
