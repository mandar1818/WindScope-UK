import React, { useState, useEffect } from 'react';
import { OverviewResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { DateSelector } from '../components/common/DateSelector';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { ForecastVsActualChart } from '../components/charts/ForecastVsActualChart';
import { ForecastErrorChart } from '../components/charts/ForecastErrorChart';
import { ProcurementExposureWidget } from '../components/exposure/ProcurementExposureWidget';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Database, AlertCircle, Sparkles } from 'lucide-react';

interface OverviewPageProps {
  initialDate?: string;
  initialCutoff?: CutoffType;
  onSelectDeliveryPeriod?: (date: string, sp: number) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  initialDate = '2026-01-15',
  initialCutoff = 'day_ahead_1100',
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
      {/* Top Filter Bar */}
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

      {loading && <LoadingSpinner message={`Ingesting Elexon data for ${selectedDate}...`} />}

      {error && (
        <ErrorAlert
          title="Data Ingestion Error"
          message={error}
          onRetry={() => loadData(selectedDate, selectedCutoff)}
        />
      )}

      {!loading && !error && data && (
        <>
          {/* Market Process Notice */}
          <div className="rounded-lg bg-navy-900/60 border border-navy-800 p-3 flex items-start space-x-3 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-100">
                Evaluating {data.selected_date} Delivery with {data.cutoff_info.name}:
              </span>{' '}
              {data.cutoff_info.description} {data.cutoff_info.market_relevance}
            </div>
          </div>

          {/* Primary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title="Mean Absolute Error"
              value={data.date_metrics.mae_mw}
              unit="MW"
              subtitle="Average magnitude of forecast error across 48 settlement periods"
              tooltip="MAE = (1/N) * Sum(|Forecast - Actual|). Low values indicate tighter tracking."
              highlight="teal"
            />
            <MetricCard
              title="Root Mean Squared Error"
              value={data.date_metrics.rmse_mw}
              unit="MW"
              subtitle="Heavily penalizes extreme forecast misses"
              tooltip="RMSE = Sqrt((1/N) * Sum((Forecast - Actual)^2)). Sensitive to large deviations."
              highlight="neutral"
            />
            <MetricCard
              title="WAPE Volume Error"
              value={data.date_metrics.wape_percent}
              unit="%"
              subtitle="Weighted absolute percentage error over total daily wind volume"
              tooltip="WAPE = (Sum(|Error|) / Sum(Actual)) * 100. Robust metric avoiding individual period division by zero."
              highlight="green"
            />
            <MetricCard
              title="Forecast Bias"
              value={data.date_metrics.bias_mw}
              unit="MW"
              signPrefix={true}
              subtitle={
                data.date_metrics.bias_direction === 'OVERFORECASTING'
                  ? '⚠️ System Overforecasting (Wind short risk)'
                  : data.date_metrics.bias_direction === 'UNDERFORECASTING'
                  ? 'ℹ️ System Underforecasting (Wind long risk)'
                  : 'Balanced on average'
              }
              tooltip="Forecast Bias = Mean(Forecast - Actual). SIGN CONVENTION: Positive indicates overforecasting; negative indicates underforecasting."
              highlight={
                data.date_metrics.bias_direction === 'OVERFORECASTING'
                  ? 'amber'
                  : data.date_metrics.bias_direction === 'UNDERFORECASTING'
                  ? 'teal'
                  : 'neutral'
              }
            />
          </div>

          {/* Secondary KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-navy-900/60 border border-navy-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Mean Actual:</span>
              <strong className="text-emerald-400">{data.date_metrics.mean_actual_mw?.toLocaleString() ?? 'N/A'} MW</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-900/60 border border-navy-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Mean Forecast:</span>
              <strong className="text-cyan-400">{data.date_metrics.mean_forecast_mw?.toLocaleString() ?? 'N/A'} MW</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-900/60 border border-navy-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Valid Observations:</span>
              <strong className="text-slate-100">{data.date_metrics.valid_observations} / 48 periods</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-900/60 border border-navy-800 text-slate-300 flex justify-between items-center">
              <span className="text-slate-400">Excluded (Missing):</span>
              <strong className={data.date_metrics.excluded_observations > 0 ? 'text-amber-400' : 'text-slate-400'}>
                {data.date_metrics.excluded_observations}
              </strong>
            </div>
          </div>

          {/* Forecast vs Actual Chart */}
          <ForecastVsActualChart
            data={data.generation_series}
            title={`January 2026 Wind Generation Profile: Delivery Date ${data.selected_date}`}
            subtitle={`Matched against WINDFOR publications prior to ${data.cutoff_info.name}`}
          />

          {/* Forecast Error Chart */}
          <ForecastErrorChart
            data={data.generation_series}
            title={`Settlement Interval Forecast Error (Forecast minus Actual)`}
            subtitle="Error in MW for each 30-minute settlement period"
          />

          {/* Day-Ahead Procurement Exposure Analysis */}
          <ProcurementExposureWidget exposure={data.exposure_summary} />

          {/* Data Freshness & Source Status Footer Card */}
          <div className="rounded-xl border border-navy-800 bg-navy-950/60 p-4 text-xs font-mono text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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
