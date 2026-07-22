"""
Таблица пользователей (users).

Один пользователь — одна роль (role_id) и одна компания (company_id).
Пароль храним ТОЛЬКО хешем (Argon2id, заполняется на Шаге 5). Логин — по username.
"""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # username (в Welding Log — "un"), уникальный, по нему вход
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    # хеш пароля (никогда не открытый пароль)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(150))
    # необязательный email (нужен для будущего сброса пароля через письмо)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"))
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"))

    # временная блокировка вместо удаления (lock/unlock)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    # true → заставить сменить временный пароль при первом входе
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # связи для удобства (напр. чтобы собрать privileges-объект из роли)
    company: Mapped["Company"] = relationship(back_populates="users")
    role: Mapped["Role"] = relationship()
