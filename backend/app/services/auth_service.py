"""
Бизнес-логика авторизации: вход, выход, поиск пользователя по сессии.

Роуты (api/v1/auth.py) — тонкие, вся логика здесь.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.security import generate_session_token, verify_password
from app.models.session import UserSession
from app.models.user import User


def authenticate(db: Session, username: str, password: str) -> User | None:
    """
    Проверить логин+пароль. Возвращает пользователя или None
    (не различаем "нет такого" и "пароль неверный" — так безопаснее,
    злоумышленник не сможет перебирать существующие логины).
    """
    user = db.execute(
        select(User)
        .options(joinedload(User.role))
        .where(User.username == username)
    ).scalar_one_or_none()
    if user is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_session(
    db: Session,
    user: User,
    ip: str | None = None,
    user_agent: str | None = None,
) -> UserSession:
    """Создать серверную сессию для пользователя. Возвращает запись сессии."""
    now = datetime.now(timezone.utc)
    session = UserSession(
        id=generate_session_token(),
        user_id=user.id,
        expires_at=now + timedelta(minutes=settings.SESSION_TTL_MINUTES),
        ip=ip,
        user_agent=user_agent,
    )
    db.add(session)
    db.commit()
    return session


def get_user_by_session(db: Session, session_id: str) -> User | None:
    """
    Найти пользователя по id сессии из cookie.
    None, если сессии нет, она истекла или пользователь заблокирован.
    """
    session = db.execute(
        select(UserSession).where(UserSession.id == session_id)
    ).scalar_one_or_none()
    if session is None:
        return None

    now = datetime.now(timezone.utc)
    expires = session.expires_at
    # SQLite может вернуть naive datetime — приводим к UTC для сравнения
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < now:
        db.delete(session)  # подчистим истёкшую
        db.commit()
        return None

    user = db.execute(
        select(User)
        .options(joinedload(User.role))
        .where(User.id == session.user_id)
    ).scalar_one_or_none()
    if user is None or user.is_locked:
        return None

    session.last_seen_at = now
    db.commit()
    return user


def delete_session(db: Session, session_id: str) -> bool:
    """Удалить сессию (logout). True, если была и удалена."""
    session = db.execute(
        select(UserSession).where(UserSession.id == session_id)
    ).scalar_one_or_none()
    if session is None:
        return False
    db.delete(session)
    db.commit()
    return True
