"""
Эндпоинты для ролей.

Роут тонкий: принимает запрос, берёт сессию БД и зовёт сервис.
Вся логика — в services/role_service.py.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.role import RoleOut
from app.services import role_service

router = APIRouter()


@router.get("/roles/", response_model=list[RoleOut], tags=["roles"])
def get_roles(db: Session = Depends(get_db)) -> list[RoleOut]:
    """Список всех ролей."""
    return role_service.list_roles(db)
