"""
Таблица прогресса (lesson_progress).

Личный прогресс пользователя по уроку. Одна запись на пару (user, lesson).
Прогресс СТРОГО личный — чужой не видит никто (включая admin/master).
"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

# статусы прогресса
NOT_STARTED = "not_started"
IN_PROGRESS = "in_progress"
COMPLETED = "completed"


class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    # одна запись прогресса на пару (пользователь, урок)
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), index=True)

    status: Mapped[str] = mapped_column(String(20), default=NOT_STARTED)
    watch_percent: Mapped[int] = mapped_column(Integer, default=0)      # 0..100
    last_position_seconds: Mapped[int] = mapped_column(Integer, default=0)

    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
