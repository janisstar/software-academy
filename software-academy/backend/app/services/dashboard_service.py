"""
Бизнес-логика Reports и Dashboard.

Всё считается ТОЛЬКО по видимым пользователю урокам: для рабочего «100%» —
это «прошёл всё, что мне назначено», а не весь каталог.
Собирает данные из lesson_service (видимость) + progress_service (прогресс).
"""

from app.models.progress import COMPLETED, IN_PROGRESS
from app.models.user import User
from app.schemas.dashboard import LessonWithStatus, ProgressSummary
from app.services import lesson_service, progress_service
from sqlalchemy.orm import Session

# сколько элементов класть в ряды Dashboard
ROW_LIMIT = 10


def _build(db: Session, user: User):
    """Собрать видимые уроки + статусы по ним. Возвращает (lessons_with_status, progress_by_lesson)."""
    lessons = lesson_service.list_visible(db, user)
    progress = {p.lesson_id: p for p in progress_service.list_for_user(db, user.id)}

    items: list[LessonWithStatus] = []
    for lesson in lessons:
        p = progress.get(lesson.id)
        item = LessonWithStatus(
            id=lesson.id,
            title=lesson.title,
            slug=lesson.slug,
            description=lesson.description,
            duration_seconds=lesson.duration_seconds,
            thumbnail_url=lesson.thumbnail_url,
            category_id=lesson.category_id,
            order=lesson.order,
            status=p.status if p else "not_started",
            watch_percent=p.watch_percent if p else 0,
        )
        items.append(item)
    return items, progress


def _summary(items: list[LessonWithStatus]) -> ProgressSummary:
    total = len(items)
    completed = sum(1 for i in items if i.status == COMPLETED)
    in_progress = sum(1 for i in items if i.status == IN_PROGRESS)
    not_started = total - completed - in_progress
    percent = round(completed / total * 100) if total else 0
    return ProgressSummary(
        total_visible=total,
        completed=completed,
        in_progress=in_progress,
        not_started=not_started,
        completion_percent=percent,
    )


def reports(db: Session, user: User):
    """Личная статистика: сводка + все видимые уроки со статусами."""
    items, _ = _build(db, user)
    return _summary(items), items


def dashboard(db: Session, user: User):
    """Данные для главной: сводка + ряды continue/recommended/recently."""
    items, progress = _build(db, user)
    summary = _summary(items)

    continue_learning = [i for i in items if i.status == IN_PROGRESS][:ROW_LIMIT]
    recommended = [i for i in items if i.status == "not_started"][:ROW_LIMIT]

    # недавно смотренные — по времени обновления прогресса (свежие первыми)
    watched_ids = sorted(
        progress.keys(),
        key=lambda lid: progress[lid].updated_at,
        reverse=True,
    )
    by_id = {i.id: i for i in items}
    recently_watched = [by_id[lid] for lid in watched_ids if lid in by_id][:ROW_LIMIT]

    return {
        "summary": summary,
        "continue_learning": continue_learning,
        "recommended": recommended,
        "recently_watched": recently_watched,
        "is_new_user": len(progress) == 0,
    }
