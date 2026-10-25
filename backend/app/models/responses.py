from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.models.cutoff import CutoffType, CutoffDescription
from app.models.generation import PairedGenerationPoint, ForecastPublication
from app.models.metrics import AccuracyMetrics, DailyAccuracyRecord


class SourceStatus(BaseModel):
    elexon_api_online: bool
    fuelhh_available: bool
    windfor_available: bool
    is_demonstration_mode: bool
    demonstration_notice: Optional[str] = None
    data_source_description: str
    last_updated_utc: datetime


class OverviewResponse(BaseModel):
    evaluation_window: str = "January 2026"
    selected_date: str
    cutoff_type: CutoffType
    cutoff_info: CutoffDescription
    data_source: str
    is_demonstration_mode: bool
    demonstration_notice: Optional[str] = None
    
    # KPIs for the selected date
    date_metrics: AccuracyMetrics
    # KPIs for entire January 2026 (or available window)
    window_metrics: Optional[AccuracyMetrics] = None
    
    # Hourly/Half-hourly series for the selected date
    generation_series: List[PairedGenerationPoint]
    
    # Procurement exposure summary
    exposure_summary: Dict[str, Any]
    
    source_status: SourceStatus


class GenerationResponse(BaseModel):
    settlement_date: str
    cutoff_type: CutoffType
    cutoff_info: CutoffDescription
    data_source: str
    is_demonstration_mode: bool
    demonstration_notice: Optional[str] = None
    
    metrics: AccuracyMetrics
    points: List[PairedGenerationPoint]
    total_points: int


class AccuracyResponse(BaseModel):
    evaluation_window: str = "January 2026"
    selected_date: Optional[str] = None
    cutoff_type: CutoffType
    cutoff_info: CutoffDescription
    data_source: str
    is_demonstration_mode: bool
    demonstration_notice: Optional[str] = None
    
    aggregate_metrics: AccuracyMetrics
    daily_breakdown: List[DailyAccuracyRecord]
    metric_explanations: Dict[str, str]


class ForecastHistoryResponse(BaseModel):
    target_delivery_time_utc: datetime
    target_delivery_time_local: str
    settlement_date: str
    settlement_period: int
    
    actual_generation_mw: Optional[float]
    
    selected_cutoff: CutoffType
    selected_cutoff_time: datetime
    selected_cutoff_time_local: str
    
    # Point-in-time selected forecast (strictly respecting cutoff)
    selected_forecast_generation_mw: Optional[float]
    selected_forecast_publish_time: Optional[datetime]
    selected_forecast_publish_time_local: Optional[str]
    
    # Latest available forecast right now (regardless of cutoff, for waterfall contrast)
    latest_forecast_generation_mw: Optional[float]
    latest_forecast_publish_time: Optional[datetime]
    latest_forecast_publish_time_local: Optional[str]
    
    # Full history of forecast updates
    forecast_publications: List[ForecastPublication]
    total_publications: int
    
    is_demonstration_mode: bool


class DataStatusResponse(BaseModel):
    elexon_api_online: bool
    fuelhh_available: bool
    windfor_available: bool
    cached_dates_count: int
    evaluation_month: str
    is_demonstration_mode: bool
    demonstration_notice: Optional[str] = None
    last_checked_utc: datetime
    available_cutoffs: List[CutoffDescription]
