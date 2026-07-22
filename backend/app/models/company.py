"""
Таблица компаний (companies).

Компания — это завод-клиент. Пользователи привязаны к компании через company_id.
Контент (уроки/категории) общий для всех компаний, поэтому к компании не привязан.

Служебная «компания-платформа» (SevenHeaven, id=1) — к ней привязаны
master-пользователи (вендор). Так у каждого пользователя всегда есть company_id.
"""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    # рег. номер / VAT — необязательно
    businessid: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # контактный email компании — необязательно
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # блокировка всей компании разом
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # обратная связь: все пользователи этой компании
    users: Mapped[list["User"]] = relationship(back_populates="company")
