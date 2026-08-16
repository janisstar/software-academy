"""
Схемы для Reports (личная статистика) и Dashboard (главная).
"""

from pydantic import BaseModel

# Карточка урока со статусом переехала к остальным схемам урока: её отдаёт
# и каталог (GET /api/lessons/), а не только эти два эндпоинта.
from app.schemas.lesson import LessonWithStatus


class ProgressSummary(BaseModel):
    """Сводка по прогрессу (для Reports и шапки Dashboard)."""
    total_visible: int          # сколько уроков доступно пользователю
    completed: int
    in_progress: int
    not_started: int
    completion_percent: int     # 0..100 = completed / total_visible


class ReportsOut(BaseModel):
    """GET /api/reports/ — личная статистика."""
    summary: ProgressSummary
    lessons: list[LessonWithStatus]


class DashboardOut(BaseModel):
    """GET /api/dashboard/ — данные для главной."""
    summary: ProgressSummary
    continue_learning: list[LessonWithStatus]   # начатые, но не завершённые
    recommended: list[LessonWithStatus]         # доступные, ещё не начатые
    recently_watched: list[LessonWithStatus]    # недавние по времени просмотра
    is_new_user: bool                           # нет ни одной записи прогресса
