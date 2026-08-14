"""
Эндпоинты master-интерфейса (доступ только роли master):

- GET /api/master/dashboard/  сводка платформы (компании, люди, контент, активность)
- GET /api/master/lessons/    все уроки для таблицы управления контентом
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import require_master
from app.core.database import get_db
from app.models.user import User
from app.schemas.lesson import MasterLessonOut, build_master_lesson_out
from app.schemas.master_dashboard import MasterDashboardOut
from app.services import lesson_service, master_dashboard_service

router = APIRouter()


@router.get("/master/dashboard/", response_model=MasterDashboardOut, tags=["master"])
def master_dashboard(
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> MasterDashboardOut:
    """Сводка «здоровья платформы». Access: master."""
    return master_dashboard_service.get_master_dashboard(db)


@router.get("/master/lessons/", response_model=list[MasterLessonOut], tags=["master"])
def master_lessons(
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> list[MasterLessonOut]:
    """
    Все уроки для таблицы управления контентом. Access: master.
    Без фильтров и пагинации: контента мало, фильтрация клиентская (как в Users).
    Названия категорий фронт берёт из GET /api/categories/.
    """
    lessons = lesson_service.list_all_for_master(db)
    return [build_master_lesson_out(lesson) for lesson in lessons]
