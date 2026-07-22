"""
Эндпоинты управления паролями (тег Password Management, как в Welding Log):

- POST /api/user/change-password/        — сменить свой пароль (залогинен)
- POST /api/admin/password-reset/code/   — admin/master: код сброса (15 мин)
- POST /api/user/password-reset/confirm/ — ввести код и задать новый пароль
- GET  /api/generate/password/           — сгенерировать надёжный пароль
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import generate_temp_password
from app.models.user import User
from app.api.v1.deps import check_company_access, get_current_user, require_privileged
from app.schemas.password import (
    ChangePasswordIn,
    ResetCodeOut,
    ResetCodeRequestIn,
    ResetConfirmIn,
)
from app.services import password_service

router = APIRouter()


@router.post("/user/change-password/", tags=["password management"])
def change_password(
    body: ChangePasswordIn,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Сменить свой пароль (нужен старый). Access: любой залогиненный.
    Снимает must_change_password. Другие сессии пользователя удаляются.
    """
    current_session_id = request.cookies.get(settings.SESSION_COOKIE_NAME)
    ok = password_service.change_password(
        db, current_user, body.old_pw, body.new_pw, current_session_id
    )
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect"
        )
    return {"status": "password changed"}


@router.post(
    "/admin/password-reset/code/", response_model=ResetCodeOut, tags=["password management"]
)
def create_reset_code(
    body: ResetCodeRequestIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_privileged),
) -> ResetCodeOut:
    """
    Сгенерировать код сброса пароля (действует 15 минут). Access: privileged.
    master — для любого пользователя; admin/manager/site — только своей компании.
    Код показывается ОДИН раз — передай его человеку офлайн.
    """
    target = db.execute(
        select(User).where(User.username == body.un)
    ).scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    check_company_access(actor, target)

    code = password_service.create_reset_code(db, target)
    return ResetCodeOut(
        un=target.username,
        code=code,
        expires_minutes=password_service.RESET_CODE_TTL_MINUTES,
    )


@router.post("/user/password-reset/confirm/", tags=["password management"])
def confirm_reset(body: ResetConfirmIn, db: Session = Depends(get_db)) -> dict:
    """
    Подтвердить код и установить новый пароль. Access: Public
    (человек не залогинен — он ведь забыл пароль). Код одноразовый.
    """
    user = db.execute(
        select(User).where(User.username == body.un)
    ).scalar_one_or_none()
    # Не раскрываем, существует ли логин: и для "нет юзера", и для
    # неверного/просроченного кода — один и тот же ответ.
    if user is None or not password_service.confirm_reset(
        db, user, body.code, body.new_pw
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code"
        )
    return {"status": "password reset"}


@router.get("/generate/password/", tags=["password management"])
def generate_password(current_user: User = Depends(get_current_user)) -> dict:
    """Сгенерировать надёжный случайный пароль (удобно при создании пользователей)."""
    return {"password": generate_temp_password(12)}
