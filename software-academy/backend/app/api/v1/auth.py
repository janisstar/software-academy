"""
Эндпоинты авторизации: вход, выход, "кто я".

Пути — как в Welding Log (/api/login/, /api/logout/), но безопаснее:
- логин/пароль в ТЕЛЕ запроса (не в query/URL);
- сессия в httpOnly-cookie (недоступна JavaScript).
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import LoginIn, LoginOut, UserOut, build_user_out
from app.schemas.company import CompanyOut
from app.api.v1.deps import get_current_user
from app.services import auth_service, consent_service

router = APIRouter()


@router.post("/login/", response_model=LoginOut, tags=["authentication"])
def login(
    body: LoginIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginOut:
    """
    Вход по логину и паролю. Access: Public.
    Успех → создаётся сессия, её id кладётся в httpOnly-cookie;
    возвращаем {message, user, company} (как в Welding Log, но без sessionID в теле).
    """
    user = auth_service.authenticate(db, body.un, body.pw)
    if user is None:
        # одинаковый ответ для "нет юзера" и "неверный пароль" — так безопаснее
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    if user.is_locked:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is locked")

    session = auth_service.create_session(
        db,
        user,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=session.id,
        httponly=True,                       # недоступна JavaScript (защита от XSS)
        secure=settings.SESSION_COOKIE_SECURE,  # в проде (HTTPS) — True
        samesite="lax",                      # защита от CSRF в базовых сценариях
        max_age=settings.SESSION_TTL_MINUTES * 60,
        path="/",
    )
    pending = consent_service.pending_documents(db, user.id)
    return LoginOut(
        user=build_user_out(user, pending_consents=pending),
        company=CompanyOut.model_validate(user.company),
    )


@router.post("/logout/", tags=["authentication"])
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> dict:
    """Выход: удаляем сессию из БД (доступ пропадает мгновенно) и стираем cookie."""
    session_id = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if session_id:
        auth_service.delete_session(db, session_id)
    response.delete_cookie(settings.SESSION_COOKIE_NAME, path="/")
    return {"status": "logged out"}


@router.get("/me/", response_model=UserOut, tags=["authentication"])
def me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    """Текущий пользователь (по cookie сессии). Удобно для фронтенда."""
    pending = consent_service.pending_documents(db, current_user.id)
    return build_user_out(current_user, pending_consents=pending)
