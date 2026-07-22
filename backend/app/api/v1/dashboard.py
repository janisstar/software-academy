"""
Эндпоинты Reports и Dashboard (личные, только для текущего пользователя):

- GET /api/reports/   личная статистика (сводка + уроки со статусами)
- GET /api/dashboard/ данные для главной (continue / recommended / recently)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user
from app.schemas.dashboard import DashboardOut, ReportsOut
from app.services import dashboard_service

router = APIRouter()


@router.get("/reports/", response_model=ReportsOut, tags=["reports"])
def my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportsOut:
    """Личная статистика обучения (по видимым мне урокам)."""
    summary, lessons = dashboard_service.reports(db, current_user)
    return ReportsOut(summary=summary, lessons=lessons)


@router.get("/dashboard/", response_model=DashboardOut, tags=["dashboard"])
def my_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardOut:
    """Данные для главной: прогресс в шапке + ряды continue/recommended/recently."""
    return DashboardOut(**dashboard_service.dashboard(db, current_user))
