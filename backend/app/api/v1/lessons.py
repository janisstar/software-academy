"""
Эндпоинты уроков.

Управление контентом (master):
- POST   /api/lesson/       создать (с ролями/ is_public)
- PATCH  /api/lesson/       обновить
- DELETE /api/lesson/       удалить
- POST   /api/lesson/move/  сдвинуть на позицию вверх/вниз

Каталог (любой залогиненный, фильтр по роли):
- GET /api/lessons/?category_id=  список видимых уроков (карточки со статусом прогресса)
- GET /api/lesson/{lesson_id}     полный урок (если он виден пользователю)
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user, require_master
from app.schemas.lesson import (
    LessonCreateIn,
    LessonMoveIn,
    LessonOut,
    LessonUpdateIn,
    LessonWithStatus,
    build_lesson_out,
)
from app.services import lesson_service

router = APIRouter()


@router.post(
    "/lesson/", response_model=LessonOut, status_code=status.HTTP_201_CREATED, tags=["lessons"]
)
def create_lesson(
    body: LessonCreateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> LessonOut:
    """Создать урок и задать видимость (roles / is_public). Access: master."""
    try:
        lesson = lesson_service.create(db, body)
    except lesson_service.LessonError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    return build_lesson_out(lesson)


@router.patch("/lesson/", response_model=LessonOut, tags=["lessons"])
def update_lesson(
    body: LessonUpdateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> LessonOut:
    """Обновить урок (в т.ч. видимость). Access: master."""
    lesson = lesson_service.get(db, body.id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    try:
        lesson = lesson_service.update(db, lesson, body)
    except lesson_service.LessonError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    return build_lesson_out(lesson)


@router.delete("/lesson/", tags=["lessons"])
def delete_lesson(
    id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> dict:
    """Удалить урок. Access: master."""
    lesson = lesson_service.get(db, id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    lesson_service.delete(db, lesson)
    return {"status": "deleted", "id": id}


@router.post("/lesson/move/", tags=["lessons"])
def move_lesson(
    body: LessonMoveIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> dict:
    """
    Сдвинуть урок на одну позицию вверх/вниз внутри своей категории.
    Если он уже крайний — статус "noop" (не ошибка). Access: master.
    """
    lesson = lesson_service.get(db, body.id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    result = lesson_service.move(db, lesson, body.direction)
    return {"status": result, "id": body.id}


@router.get("/lessons/", response_model=list[LessonWithStatus], tags=["lessons"])
def list_lessons(
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
    category_id: int | None = Query(default=None, description="фильтр по категории"),
) -> list[LessonWithStatus]:
    """
    Каталог видимых пользователю уроков со статусом ЕГО прогресса.
    Access: залогиненный.

    Прогресс отдаётся вместе с карточками намеренно: считать статус на клиенте
    значило бы повторять там правила бэкенда (docs/06 — логика на сервере).
    Прогресс строго личный: он всегда берётся для текущей сессии.
    """
    lessons, _ = lesson_service.list_visible_with_status(
        db, actor, category_id=category_id
    )
    return lessons


@router.get("/lesson/{lesson_id}", response_model=LessonOut, tags=["lessons"])
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
) -> LessonOut:
    """Полный урок (для плеера). Access: залогиненный, если урок ему виден."""
    lesson = lesson_service.get(db, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    if not lesson_service.is_visible(actor, lesson):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return build_lesson_out(lesson)
