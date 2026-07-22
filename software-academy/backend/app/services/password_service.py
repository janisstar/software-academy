"""
Бизнес-логика паролей: смена своего, сброс через код от админа.

Безопасность:
- новые пароли хешируются Argon2id;
- код сброса живёт RESET_CODE_TTL_MINUTES, одноразовый, храним только хеш;
- при смене/сбросе пароля старые сессии пользователя удаляются
  (украденная сессия перестаёт работать).
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.security import (
    generate_temp_password,
    hash_password,
    verify_password,
)
from app.models.password_reset_code import PasswordResetCode
from app.models.session import UserSession
from app.models.user import User

RESET_CODE_TTL_MINUTES = 15


def delete_user_sessions(
    db: Session, user_id: int, except_session_id: str | None = None
) -> int:
    """Удалить сессии пользователя (кроме, опционально, текущей). Вернуть число удалённых."""
    stmt = delete(UserSession).where(UserSession.user_id == user_id)
    if except_session_id is not None:
        stmt = stmt.where(UserSession.id != except_session_id)
    result = db.execute(stmt)
    db.commit()
    return result.rowcount or 0


def change_password(
    db: Session,
    user: User,
    old_pw: str,
    new_pw: str,
    current_session_id: str | None,
) -> bool:
    """
    Сменить свой пароль. False — старый пароль неверный.
    Текущая сессия сохраняется, остальные удаляются.
    """
    if not verify_password(old_pw, user.password_hash):
        return False
    user.password_hash = hash_password(new_pw)
    user.must_change_password = False
    db.commit()
    delete_user_sessions(db, user.id, except_session_id=current_session_id)
    return True


def create_reset_code(db: Session, target_user: User) -> str:
    """
    Создать код сброса для пользователя (по просьбе admin/master).
    Возвращает сам код — показать один раз; в БД остаётся только хеш.
    Старые неиспользованные коды пользователя гасим (актуален только последний).
    """
    db.execute(
        delete(PasswordResetCode).where(PasswordResetCode.user_id == target_user.id)
    )
    code = generate_temp_password(8)
    db.add(
        PasswordResetCode(
            user_id=target_user.id,
            code_hash=hash_password(code),
            expires_at=datetime.now(timezone.utc)
            + timedelta(minutes=RESET_CODE_TTL_MINUTES),
        )
    )
    db.commit()
    return code


def confirm_reset(db: Session, user: User, code: str, new_pw: str) -> bool:
    """
    Проверить код и установить новый пароль. False — код неверный/просрочен/использован.
    Все сессии пользователя удаляются (в том числе возможного злоумышленника).
    """
    record = db.execute(
        select(PasswordResetCode)
        .where(PasswordResetCode.user_id == user.id)
        .where(PasswordResetCode.used == False)  # noqa: E712
        .order_by(PasswordResetCode.created_at.desc())
    ).scalars().first()
    if record is None:
        return False

    expires = record.expires_at
    if expires.tzinfo is None:  # SQLite может вернуть naive datetime
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        return False

    if not verify_password(code, record.code_hash):
        return False

    user.password_hash = hash_password(new_pw)
    user.must_change_password = False
    record.used = True
    db.commit()
    delete_user_sessions(db, user.id)
    return True
