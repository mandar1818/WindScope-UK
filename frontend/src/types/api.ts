export type CutoffType =
  | 'day_ahead_1100'
  | 'day_ahead_1200'
  | 'day_ahead_1700'
  | 'gate_closure_1h'
  | 'gate_closure_2h';

export interface CutoffDescription {
  id: CutoffType;
  name: string;
  description: string;
  market_relevance: string;
}

export interface PairedGenerationPoint {
  start_time: string;
  start_time_local: string;
  settlement_date: string;
  settlement_period: number;
  actual_generation_mw: number | null;
  forecast_generation_mw: number | null;
  forecast_publish_time: string | null;
  forecast_publish_time_local: string | null;
  decision_cutoff_time: string;
  decision_cutoff_time_local: string;
  error_mw: number | null;
  abs_error_mw: number | null;
  is_valid_pair: boolean;
  status: 'VALID' | 'MISSING_FORECAST' | 'MISSING_ACTUAL' | 'INCOMPLETE';
  procurement_impact?: 'OVERFORECAST_SHORT_RISK' | 'UNDERFORECAST_LONG_RISK' | 'BALANCED' | null;
}

export interface ForecastPublication {
  publish_time: string;
  publish_time_local: string;
  forecast_generation_mw: number;
  is_eligible_under_cutoff: boolean;
  is_selected: boolean;
  lead_time_hours: number;
}

export interface AccuracyMetrics {
  mae_mw: number | null;
  rmse_mw: number | null;
  wape_percent: number | null;
  bias_mw: number | null;
  mean_actual_mw: number | null;
  mean_forecast_mw: number | null;
  total_periods: number;
  valid_observations: number;
  excluded_observations: number;
  bias_direction: 'OVERFORECASTING' | 'UNDERFORECASTING' | 'UNBIASED' | 'INSUFFICIENT_DATA';
  metric_calculation_notes: string;
}

export interface DailyAccuracyRecord {
  settlement_date: string;
  mae_mw: number | null;
  rmse_mw: number | null;
  wape_percent: number | null;
  bias_mw: number | null;
  valid_observations: number;
  excluded_observations: number;
  mean_actual_mw: number | null;
  mean_forecast_mw: number | null;
}

export interface SourceStatus {
  elexon_api_online: boolean;
  fuelhh_available: boolean;
  windfor_available: boolean;
  is_demonstration_mode: boolean;
  demonstration_notice?: string | null;
  data_source_description: string;
  last_updated_utc: string;
}

export interface ExposureSummary {
  overforecast_energy_mwh: number;
  underforecast_energy_mwh: number;
  net_energy_variance_mwh: number;
  max_single_period_overforecast_mw: number;
  max_single_period_underforecast_mw: number;
  dominant_risk_category: 'NET_SHORT_EXPOSURE' | 'NET_LONG_EXPOSURE' | 'RELATIVELY_BALANCED';
  risk_explanation: string;
  disclaimer: string;
}

export interface OverviewResponse {
  evaluation_window: string;
  selected_date: string;
  cutoff_type: CutoffType;
  cutoff_info: CutoffDescription;
  data_source: string;
  is_demonstration_mode: boolean;
  demonstration_notice?: string | null;
  date_metrics: AccuracyMetrics;
  window_metrics?: AccuracyMetrics | null;
  generation_series: PairedGenerationPoint[];
  exposure_summary: ExposureSummary;
  source_status: SourceStatus;
}

export interface GenerationResponse {
  settlement_date: string;
  cutoff_type: CutoffType;
  cutoff_info: CutoffDescription;
  data_source: string;
  is_demonstration_mode: boolean;
  demonstration_notice?: string | null;
  metrics: AccuracyMetrics;
  points: PairedGenerationPoint[];
  total_points: number;
}

export interface AccuracyResponse {
  evaluation_window: string;
  selected_date?: string | null;
  cutoff_type: CutoffType;
  cutoff_info: CutoffDescription;
  data_source: string;
  is_demonstration_mode: boolean;
  demonstration_notice?: string | null;
  aggregate_metrics: AccuracyMetrics;
  daily_breakdown: DailyAccuracyRecord[];
  metric_explanations: Record<string, string>;
}

export interface ForecastHistoryResponse {
  target_delivery_time_utc: string;
  target_delivery_time_local: string;
  settlement_date: string;
  settlement_period: number;
  actual_generation_mw: number | null;
  selected_cutoff: CutoffType;
  selected_cutoff_time: string;
  selected_cutoff_time_local: string;
  selected_forecast_generation_mw: number | null;
  selected_forecast_publish_time: string | null;
  selected_forecast_publish_time_local: string | null;
  latest_forecast_generation_mw: number | null;
  latest_forecast_publish_time: string | null;
  latest_forecast_publish_time_local: string | null;
  forecast_publications: ForecastPublication[];
  total_publications: number;
  is_demonstration_mode: boolean;
}

export interface DataStatusResponse {
  elexon_api_online: boolean;
  fuelhh_available: boolean;
  windfor_available: boolean;
  cached_dates_count: number;
  evaluation_month: string;
  is_demonstration_mode: boolean;
  demonstration_notice?: string | null;
  last_checked_utc: string;
  available_cutoffs: CutoffDescription[];
}
