"""
Эндпоинты прогресса (личный, тег progress):

- POST /api/progress/              автосохранение (плеер шлёт периодически)
- GET  /api/progress/              весь мой прогресс
- GET  /api/progress/{lesson_id}   мой прогресс по конкретному уроку

Прогресс СТРОГО личный: всегда работаем только с current_user, чужой недоступен.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user
from app.schemas.progress import ProgressOut, ProgressSaveIn
from app.services import lesson_service, progress_service

router = APIRouter()


def _to_out(record) -> ProgressOut:
    return ProgressOut(
        lesson_id=record.lesson_id,
        status=record.status,
        watch_percent=record.watch_percent,
        last_position_seconds=record.last_position_seconds,
        started_at=record.started_at,
        completed_at=record.completed_at,
    )


@router.post("/progress/", response_model=ProgressOut, tags=["progress"])
def save_progress(
    body: ProgressSaveIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProgressOut:
    """Автосохранение прогресса по уроку. Только для видимых пользователю уроков."""
    lesson = lesson_service.get(db, body.lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    if not lesson_service.is_visible(current_user, lesson):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    record = progress_service.save(
        db, current_user.id, body.lesson_id, body.watch_percent, body.last_position_seconds
    )
    return _to_out(record)


@router.get("/progress/", response_model=list[ProgressOut], tags=["progress"])
def my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProgressOut]:
    """Весь мой прогресс."""
    return [_to_out(r) for r in progress_service.list_for_user(db, current_user.id)]


@router.get("/progress/{lesson_id}", response_model=ProgressOut, tags=["progress"])
def my_progress_for_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProgressOut:
    """Мой прогресс по конкретному уроку (для возобновления с последней позиции)."""
    record = progress_service.get_for_user(db, current_user.id, lesson_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No progress yet")
    return _to_out(record)
