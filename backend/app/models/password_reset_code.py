"""
Таблица кодов сброса пароля (password_reset_codes).

Сценарий (как в Welding Log): пользователь забыл пароль → admin/master
генерирует код (живёт 15 минут) → передаёт человеку офлайн → тот вводит код
и задаёт новый пароль. Код одноразовый, храним только его ХЕШ (как пароль).
"""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PasswordResetCode(Base):
    __tablename__ = "password_reset_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    # хеш кода (сам код показывается админу один раз и не хранится)
    code_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # одноразовость: после успешного сброса помечаем использованным
    used: Mapped[bool] = mapped_column(Boolean, default=False)
