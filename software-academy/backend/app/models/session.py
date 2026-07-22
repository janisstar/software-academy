"""
Таблица сессий (sessions).

Серверные сессии: при входе создаётся запись, её id (случайный токен)
кладётся в httpOnly-cookie браузера. Logout = удаление записи → доступ
пропадает мгновенно. Подробности — docs/06-api-conventions.md, §4.
"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserSession(Base):
    __tablename__ = "sessions"

    # первичный ключ — сам токен сессии (значение cookie)
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    # после этого момента сессия недействительна
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # когда сессию видели в последний раз (полезно для аудита)
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    # откуда входили — для аудита/безопасности (необязательные)
    ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user: Mapped["User"] = relationship()
