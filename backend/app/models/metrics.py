from typing import Optional, List
from pydantic import BaseModel, Field


class AccuracyMetrics(BaseModel):
    """
    Standard quantitative forecast accuracy metrics evaluated on matched pairs.
    Sign convention: Error = Forecast - Actual. Positive bias = Overforecasting.
    """
    mae_mw: Optional[float] = Field(None, description="Mean Absolute Error in MW")
    rmse_mw: Optional[float] = Field(None, description="Root Mean Squared Error in MW")
    wape_percent: Optional[float] = Field(
        None, 
        description="Weighted Absolute Percentage Error (%): (Sum(|Error|) / Sum(Actual)) * 100. Safe zero-handling applied."
    )
    bias_mw: Optional[float] = Field(
        None, 
        description="Forecast Bias in MW: Mean(Forecast - Actual). Positive means overforecasting; negative means underforecasting."
    )
    mean_actual_mw: Optional[float] = Field(None, description="Mean Actual Generation in MW")
    mean_forecast_mw: Optional[float] = Field(None, description="Mean Forecast Generation in MW")
    
    total_periods: int = Field(..., description="Total target delivery periods in evaluation window")
    valid_observations: int = Field(..., description="Count of valid matched forecast-actual pairs")
    excluded_observations: int = Field(..., description="Count of excluded or missing observations")
    
    bias_direction: str = Field(
        ..., 
        description="Categorical bias: 'OVERFORECASTING', 'UNDERFORECASTING', 'UNBIASED', or 'INSUFFICIENT_DATA'"
    )
    metric_calculation_notes: str = Field(
        ..., 
        description="Methodology and data validation notes"
    )


class DailyAccuracyRecord(BaseModel):
    """Accuracy metrics aggregated for an individual calendar day."""
    settlement_date: str
    mae_mw: Optional[float]
    rmse_mw: Optional[float]
    wape_percent: Optional[float]
    bias_mw: Optional[float]
    valid_observations: int
    excluded_observations: int
    mean_actual_mw: Optional[float]
    mean_forecast_mw: Optional[float]

