import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.models.elexon import FuelHHRecord, WindforRecord
from app.services.demo_data_provider import generate_demonstration_dataset

client = TestClient(app)


def test_health_endpoint():
    """Verify GET /health returns operational status."""
    with patch("app.services.elexon_client.ElexonClient.check_api_health", new_callable=AsyncMock) as mock_health:
        mock_health.return_value = True
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["elexon_api_connected"] is True


def test_root_endpoint():
    """Verify root / returns API metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "WindScope UK API"
    assert data["evaluation_scope"] == "January 2026"


def test_january_2026_date_validation_rejected():
    """Dates outside January 2026 must be strictly rejected with HTTP 400."""
    # February 2026 rejected
    resp_feb = client.get("/api/v1/overview?settlement_date=2026-02-01")
    assert resp_feb.status_code == 400
    assert "authorized evaluation scope" in resp_feb.json()["detail"]

    # December 2025 rejected
    resp_dec = client.get("/api/v1/overview?settlement_date=2025-12-31")
    assert resp_dec.status_code == 400
    assert "authorized evaluation scope" in resp_dec.json()["detail"]

    # Malformed date string rejected
    resp_bad = client.get("/api/v1/overview?settlement_date=not-a-date")
    assert resp_bad.status_code == 400
    assert "Invalid date format" in resp_bad.json()["detail"]


@pytest.mark.asyncio
async def test_overview_endpoint_mocked():
    """Verify /api/v1/overview with mocked Elexon data."""
    mock_actuals, mock_forecasts = generate_demonstration_dataset("2026-01-15")
    
    with patch("app.services.elexon_client.ElexonClient.fetch_data_for_date", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = (mock_actuals, mock_forecasts, False, None)
        
        response = client.get("/api/v1/overview?settlement_date=2026-01-15&cutoff=day_ahead_1100")
        assert response.status_code == 200
        data = response.json()
        
        assert data["selected_date"] == "2026-01-15"
        assert data["cutoff_type"] == "day_ahead_1100"
        assert "date_metrics" in data
        assert data["date_metrics"]["valid_observations"] > 0
        assert len(data["generation_series"]) == 48
        assert "exposure_summary" in data
        assert "dominant_risk_category" in data["exposure_summary"]


@pytest.mark.asyncio
async def test_generation_endpoint_mocked():
    """Verify /api/v1/generation returns 48 half-hour matched intervals."""
    mock_actuals, mock_forecasts = generate_demonstration_dataset("2026-01-15")
    
    with patch("app.services.elexon_client.ElexonClient.fetch_data_for_date", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = (mock_actuals, mock_forecasts, False, None)
        
        response = client.get("/api/v1/generation?settlement_date=2026-01-15&cutoff=day_ahead_1100")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["points"]) == 48
        assert data["total_points"] == 48
        # Ensure timestamps and MW units are populated
        first_point = data["points"][0]
        assert first_point["settlement_period"] == 1
        assert first_point["actual_generation_mw"] is not None
        assert first_point["forecast_generation_mw"] is not None


@pytest.mark.asyncio
async def test_accuracy_endpoint_mocked():
    """Verify /api/v1/accuracy calculates metrics over range and daily breakdowns."""
    mock_actuals, mock_forecasts = generate_demonstration_dataset("2026-01-15")
    
    with patch("app.services.elexon_client.ElexonClient.fetch_data_for_date", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = (mock_actuals, mock_forecasts, False, None)
        
        response = client.get("/api/v1/accuracy?settlement_date=2026-01-15&cutoff=day_ahead_1100")
        assert response.status_code == 200
        data = response.json()
        
        assert "aggregate_metrics" in data
        assert "daily_breakdown" in data
        assert "metric_explanations" in data
        assert len(data["daily_breakdown"]) == 1
        assert data["aggregate_metrics"]["mae_mw"] is not None


@pytest.mark.asyncio
async def test_forecast_history_endpoint_mocked():
    """Verify /api/v1/forecast-history returns multi-horizon historical publications."""
    mock_actuals, mock_forecasts = generate_demonstration_dataset("2026-01-15")
    
    with patch("app.services.elexon_client.ElexonClient.fetch_data_for_date", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = (mock_actuals, mock_forecasts, False, None)
        
        response = client.get("/api/v1/forecast-history?delivery_time=2026-01-15T12:00:00Z&cutoff=day_ahead_1100")
        assert response.status_code == 200
        data = response.json()
        
        assert data["settlement_date"] == "2026-01-15"
        assert data["total_publications"] > 0
        assert data["selected_forecast_generation_mw"] is not None
        assert len(data["forecast_publications"]) > 0


def test_data_status_endpoint():
    """Verify /api/v1/data-status returns cutoffs and system information."""
    with patch("app.services.elexon_client.ElexonClient.check_api_health", new_callable=AsyncMock) as mock_health:
        mock_health.return_value = True
        response = client.get("/api/v1/data-status")
        assert response.status_code == 200
        data = response.json()
        assert data["evaluation_month"] == "January 2026"
        assert len(data["available_cutoffs"]) >= 5


@pytest.mark.asyncio
async def test_demonstration_mode_fallback_notice():
    """When Elexon is unavailable, fallback activates with explicit demonstration notice."""
    with patch("app.services.elexon_client.ElexonClient.fetch_fuelhh_actuals", new_callable=AsyncMock) as mock_act:
        mock_act.side_effect = Exception("Simulated connection timeout")
        
        response = client.get("/api/v1/overview?settlement_date=2026-01-15")
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_demonstration_mode"] is True
        assert data["demonstration_notice"] is not None
        assert "DEMONSTRATION MODE" in data["demonstration_notice"]

