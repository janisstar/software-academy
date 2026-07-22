"""
Эндпоинты уроков.

Управление контентом (master):
- POST   /api/lesson/   создать (с ролями/ is_public)
- PATCH  /api/lesson/   обновить
- DELETE /api/lesson/   удалить

Каталог (любой залогиненный, фильтр по роли):
- GET /api/lessons/?category_id=  список видимых уроков (краткие карточки)
- GET /api/lesson/{lesson_id}     полный урок (если он виден пользователю)
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user, require_master
from app.schemas.lesson import (
    LessonCardOut,
    LessonCreateIn,
    LessonOut,
    LessonUpdateIn,
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


@router.get("/lessons/", response_model=list[LessonCardOut], tags=["lessons"])
def list_lessons(
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
    category_id: int | None = Query(default=None, description="фильтр по категории"),
) -> list[LessonCardOut]:
    """Каталог видимых пользователю уроков (краткие карточки). Access: залогиненный."""
    lessons = lesson_service.list_visible(db, actor, category_id=category_id)
    return [LessonCardOut.model_validate(l) for l in lessons]


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
