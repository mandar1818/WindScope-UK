from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class PairedGenerationPoint(BaseModel):
    """
    Matched 30-minute delivery period observation combining actual outturn (FUELHH)
    with the point-in-time selected forecast (WINDFOR).
    """
    start_time: datetime = Field(..., description="UTC delivery period start timestamp")
    start_time_local: str = Field(..., description="Europe/London formatted delivery start timestamp")
    settlement_date: str = Field(..., description="Settlement date (YYYY-MM-DD)")
    settlement_period: int = Field(..., description="Settlement period number (1 to 50)")
    
    # Actual Generation from FUELHH (fuelType=WIND)
    actual_generation_mw: Optional[float] = Field(None, description="Actual metered wind generation in MW")
    
    # Point-in-time Forecast from WINDFOR
    forecast_generation_mw: Optional[float] = Field(None, description="Selected point-in-time forecast wind generation in MW")
    forecast_publish_time: Optional[datetime] = Field(None, description="UTC publication timestamp of selected forecast")
    forecast_publish_time_local: Optional[str] = Field(None, description="Europe/London formatted publication timestamp")
    
    # Configured Cutoff applied
    decision_cutoff_time: datetime = Field(..., description="Decision cutoff threshold applied to exclude subsequent forecasts")
    decision_cutoff_time_local: str = Field(..., description="Europe/London formatted decision cutoff threshold")
    
    # Error: Sign convention is forecast minus actual
    error_mw: Optional[float] = Field(None, description="Forecast Error in MW (forecast - actual)")
    abs_error_mw: Optional[float] = Field(None, description="Absolute Forecast Error in MW (|forecast - actual|)")
    
    # Observation status
    is_valid_pair: bool = Field(..., description="True if both actual and forecast generation are present and valid")
    status: str = Field(..., description="Status: 'VALID', 'MISSING_FORECAST', 'MISSING_ACTUAL', or 'INCOMPLETE'")
    
    # Exposure direction indicator
    procurement_impact: Optional[str] = Field(
        None, 
        description="Physical market exposure: 'OVERFORECAST_SHORT_RISK', 'UNDERFORECAST_LONG_RISK', or 'BALANCED'"
    )


class ForecastPublication(BaseModel):
    """A single historical forecast submission for a specific delivery period."""
    publish_time: datetime
    publish_time_local: str
    forecast_generation_mw: float
    is_eligible_under_cutoff: bool
    is_selected: bool
    lead_time_hours: float = Field(..., description="Hours between publication and delivery start")

