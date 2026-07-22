"""
Бизнес-логика прогресса.

Автосохранение: плеер периодически шлёт watch_percent + last_position.
Статус вычисляется сам:
  - completed, если watch_percent >= COMPLETE_THRESHOLD (досмотрел почти до конца);
  - in_progress, если начал смотреть (>0);
  - not_started иначе.
Прогресс не «откатывается»: если урок уже completed, он таким и остаётся,
а watch_percent не уменьшается (пользователь может пересматривать с начала).
"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.progress import (
    COMPLETED,
    IN_PROGRESS,
    NOT_STARTED,
    LessonProgress,
)

# с какого процента считаем урок завершённым (видео редко проматывают до 100%)
COMPLETE_THRESHOLD = 90


def _status_for(percent: int) -> str:
    if percent >= COMPLETE_THRESHOLD:
        return COMPLETED
    if percent > 0:
        return IN_PROGRESS
    return NOT_STARTED


def get_for_user(db: Session, user_id: int, lesson_id: int) -> LessonProgress | None:
    return db.execute(
        select(LessonProgress)
        .where(LessonProgress.user_id == user_id)
        .where(LessonProgress.lesson_id == lesson_id)
    ).scalar_one_or_none()


def list_for_user(db: Session, user_id: int) -> list[LessonProgress]:
    return list(
        db.execute(
            select(LessonProgress).where(LessonProgress.user_id == user_id)
        ).scalars().all()
    )


def save(
    db: Session,
    user_id: int,
    lesson_id: int,
    watch_percent: int,
    last_position_seconds: int,
) -> LessonProgress:
    """Создать/обновить запись прогресса (автосохранение из плеера)."""
    now = datetime.now(timezone.utc)
    record = get_for_user(db, user_id, lesson_id)

    if record is None:
        record = LessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            status=NOT_STARTED,
            watch_percent=0,
            last_position_seconds=0,
            started_at=now,
        )
        db.add(record)

    # процент не уменьшаем (пользователь мог перемотать назад)
    record.watch_percent = max(record.watch_percent or 0, watch_percent)
    record.last_position_seconds = last_position_seconds
    if record.started_at is None:
        record.started_at = now

    new_status = _status_for(record.watch_percent)
    # уже завершённый урок остаётся завершённым
    if record.status == COMPLETED:
        new_status = COMPLETED
    if new_status == COMPLETED and record.completed_at is None:
        record.completed_at = now
    record.status = new_status
    record.updated_at = now

    db.commit()
    db.refresh(record)
    return record
