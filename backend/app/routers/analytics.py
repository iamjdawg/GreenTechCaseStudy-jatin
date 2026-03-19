from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import DashboardStats, WasteData, SustainabilityScore, ReorderSuggestion
from ..services.analytics_service import (
    get_dashboard_stats,
    get_waste_data,
    get_reorder_suggestions,
    get_sustainability_score,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)


@router.get("/waste", response_model=WasteData)
def waste(days: int = Query(default=30, ge=1, le=365), db: Session = Depends(get_db)):
    return get_waste_data(db, days=days)


@router.get("/reorder", response_model=list[ReorderSuggestion])
def reorder(db: Session = Depends(get_db)):
    return get_reorder_suggestions(db)


@router.get("/sustainability", response_model=SustainabilityScore)
def sustainability(db: Session = Depends(get_db)):
    return get_sustainability_score(db)
