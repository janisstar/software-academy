"""
Таблица уроков (lessons) и связь «урок ↔ роли» (lesson_roles).

Видимость урока: is_public (виден всем) ИЛИ роль привилегированная
ИЛИ роль пользователя есть в списке ролей урока.
Academy хранит только метаданные + vimeo_id; само видео — на Vimeo.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# Связь многие-ко-многим: какие роли видят этот урок.
# ondelete=CASCADE — при удалении урока/роли строки связи убираются автоматически.
lesson_roles = Table(
    "lesson_roles",
    Base.metadata,
    Column("lesson_id", ForeignKey("lessons.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(210), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    vimeo_id: Mapped[str] = mapped_column(String(50))
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    # виден всем, независимо от ролей
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    category: Mapped["Category"] = relationship()
    # роли, которым виден урок (пусто + is_public=false = видят только привилегированные)
    roles: Mapped[list["Role"]] = relationship(secondary=lesson_roles)
