"""
Схемы для прогресса обучения.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class ProgressSaveIn(BaseModel):
    """
    POST /api/progress/ — автосохранение прогресса (плеер шлёт периодически).
    Статус вычисляется автоматически по watch_percent (см. progress_service).
    """
    lesson_id: int
    watch_percent: int = Field(ge=0, le=100)
    last_position_seconds: int = Field(default=0, ge=0)


class ProgressOut(BaseModel):
    lesson_id: int
    status: str
    watch_percent: int
    last_position_seconds: int
    started_at: datetime | None = None
    completed_at: datetime | None = None
