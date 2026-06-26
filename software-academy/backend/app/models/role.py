"""
Таблица ролей (roles).

Роль определяет, какие уроки видит пользователь.
Самое важное поле — is_privileged: у administrator/manager/site_manager оно True,
и такие роли видят все уроки + раздел Users.
"""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    # короткий машинный код роли, напр. "welder" — уникальный
    key: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    # человекочитаемое название, напр. "Welder"
    name: Mapped[str] = mapped_column(String(100))
    # привилегированная роль видит все уроки и раздел Users
    is_privileged: Mapped[bool] = mapped_column(Boolean, default=False)
