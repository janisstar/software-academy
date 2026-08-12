"""
Эндпоинты master-интерфейса (доступ только роли master):

- GET /api/master/dashboard/  сводка платформы (компании, люди, контент, активность)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import require_master
from app.core.database import get_db
from app.models.user import User
from app.schemas.master_dashboard import MasterDashboardOut
from app.services import master_dashboard_service

router = APIRouter()


@router.get("/master/dashboard/", response_model=MasterDashboardOut, tags=["master"])
def master_dashboard(
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> MasterDashboardOut:
    """Сводка «здоровья платформы». Access: master."""
    return master_dashboard_service.get_master_dashboard(db)
