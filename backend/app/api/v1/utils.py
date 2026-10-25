from datetime import datetime
from fastapi import HTTPException
from app.models.cutoff import CutoffType, CutoffDescription, AVAILABLE_CUTOFFS


def validate_january_2026_date(date_str: str) -> str:
    """
    Validates that the provided date string is YYYY-MM-DD and falls strictly within January 2026.
    """
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format '{date_str}'. Expected YYYY-MM-DD (e.g. 2026-01-15)."
        )
        
    if dt.year != 2026 or dt.month != 1:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Date '{date_str}' is outside the authorized evaluation scope. "
                "The WindScope UK pilot is scoped strictly to January 2026 delivery periods (2026-01-01 to 2026-01-31)."
            )
        )
    return date_str


def get_cutoff_info(cutoff_type: CutoffType) -> CutoffDescription:
    """Retrieves full metadata description for a decision cutoff."""
    for c in AVAILABLE_CUTOFFS:
        if c.id == cutoff_type:
            return c
    return AVAILABLE_CUTOFFS[0]

