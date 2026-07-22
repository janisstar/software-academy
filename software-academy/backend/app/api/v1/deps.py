"""
Общие зависимости для защищённых эндпоинтов.

get_current_user читает сессию из httpOnly-cookie и возвращает пользователя.
Использование:  user: User = Depends(get_current_user)
"""

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.services import auth_service


def get_current_user(
    db: Session = Depends(get_db),
    session_id: str | None = Cookie(default=None, alias=settings.SESSION_COOKIE_NAME),
) -> User:
    """Достать пользователя по cookie сессии. Иначе — 401."""
    if session_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    user = auth_service.get_user_by_session(db, session_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session"
        )
    return user


def require_privileged(current_user: User = Depends(get_current_user)) -> User:
    """
    Пускать только привилегированные роли (master/admin/manager/site).
    Использование:  user: User = Depends(require_privileged)
    """
    if not current_user.role.is_privileged:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user


def require_master(current_user: User = Depends(get_current_user)) -> User:
    """Пускать только master (управление контентом и платформой)."""
    if current_user.role.key != "master":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Master only"
        )
    return current_user


def check_company_access(actor: User, target: User) -> None:
    """
    Может ли actor управлять target: master — любым, остальные — только своей компанией.
    Нет доступа → 403.
    """
    if actor.role.key == "master":
        return
    if actor.company_id != target.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
