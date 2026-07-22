"""
Эндпоинты Users (управление людьми) — в стиле Welding Log:

- POST   /api/user/            создать (privileged) → временный пароль
- PATCH  /api/user/            обновить (своё имя/email — любой; остальное — privileged)
- DELETE /api/user/            удалить насовсем (GDPR)
- POST   /api/user/lock/       заблокировать/разблокировать
- GET    /api/user/{username}  один пользователь (своя запись или privileged)
- GET    /api/users/           список (privileged; master видит все компании)

Права: master — любые компании; admin/manager/site — только своя.
Защита от самострела: нельзя удалить/заблокировать себя и последнего master.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.role import Role
from app.models.user import User
from app.api.v1.deps import check_company_access, get_current_user, require_privileged
from app.schemas.auth import UserOut, build_user_out
from app.schemas.user import (
    UserCreateIn,
    UserCreateOut,
    UserDeleteIn,
    UserLockIn,
    UserUpdateIn,
)
from app.services import company_service, user_service

router = APIRouter()


def _get_role_or_404(db: Session, key: str) -> Role:
    role = db.execute(select(Role).where(Role.key == key)).scalar_one_or_none()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{key}' not found"
        )
    return role


def _get_user_or_404(db: Session, username: str) -> User:
    user = user_service.get_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post(
    "/user/", response_model=UserCreateOut, status_code=status.HTTP_201_CREATED, tags=["users"]
)
def create_user(
    body: UserCreateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_privileged),
) -> UserCreateOut:
    """
    Создать пользователя. Access: privileged.
    master — в любой компании (companyid обязателен); admin/manager/site — только в своей.
    Роль master может выдать только master. Ответ содержит временный пароль (один раз).
    """
    if user_service.get_by_username(db, body.un) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
        )

    role = _get_role_or_404(db, body.role)
    # master — singleton, создаётся только seed-ом; через API запрещено
    if role.key == "master":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="master is a singleton and cannot be created via API",
        )

    if actor.role.key == "master":
        if body.companyid is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="companyid is required for master",
            )
        company = company_service.get_company(db, body.companyid)
        if company is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )
        company_id = company.id
    else:
        company_id = actor.company_id  # своя компания, companyid из запроса игнорируем

    user, temp_password = user_service.create_user(
        db, username=body.un, name=body.name, role=role,
        company_id=company_id, email=body.email,
    )
    return UserCreateOut(user=build_user_out(user), temp_password=temp_password)


@router.patch("/user/", response_model=UserOut, tags=["users"])
def update_user(
    body: UserUpdateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
) -> UserOut:
    """
    Обновить пользователя. Access: своя запись (имя/email/логин) или privileged.
    Смена роли — только privileged; свою роль менять нельзя;
    выдать/забрать master может только master.
    """
    target = _get_user_or_404(db, body.un)
    is_self = actor.id == target.id

    if not is_self:
        if not actor.role.is_privileged:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )
        check_company_access(actor, target)

    new_role: Role | None = None
    if body.role is not None:
        if is_self:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Cannot change own role"
            )
        new_role = _get_role_or_404(db, body.role)
        # master — singleton: нельзя ни назначить master, ни сменить роль самому master
        if new_role.key == "master" or target.role.key == "master":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="master role is managed only via deployment seed",
            )

    if body.new_un is not None and body.new_un != target.username:
        if user_service.get_by_username(db, body.new_un) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
            )

    updated = user_service.update_user(
        db, target, name=body.name, email=body.email,
        new_username=body.new_un, role=new_role,
    )
    return build_user_out(updated)


@router.delete("/user/", tags=["users"])
def delete_user(
    body: UserDeleteIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_privileged),
) -> dict:
    """
    Удалить пользователя НАСОВСЕМ (GDPR: сессии, коды сброса, позже — прогресс).
    Access: privileged (в рамках своей компании; master — везде).
    Нельзя удалить себя и последнего master.
    """
    target = _get_user_or_404(db, body.un)
    if target.id == actor.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Cannot delete yourself"
        )
    if target.role.key == "master":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="master is a singleton and cannot be deleted via API",
        )
    check_company_access(actor, target)
    user_service.delete_user(db, target)
    return {"status": "deleted", "un": body.un}


@router.post("/user/lock/", response_model=UserOut, tags=["users"])
def lock_user(
    body: UserLockIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_privileged),
) -> UserOut:
    """
    Заблокировать/разблокировать. Access: privileged (в рамках компании).
    Блокировка мгновенно гасит все сессии пользователя. Себя блокировать нельзя.
    """
    target = _get_user_or_404(db, body.un)
    if target.id == actor.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Cannot lock yourself"
        )
    if target.role.key == "master":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="master cannot be locked"
        )
    check_company_access(actor, target)
    updated = user_service.set_locked(db, target, body.locked)
    return build_user_out(updated)


@router.get("/user/{username}", response_model=UserOut, tags=["users"])
def get_user(
    username: str,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
) -> UserOut:
    """Один пользователь. Access: своя запись или privileged (в рамках компании)."""
    target = _get_user_or_404(db, username)
    if actor.id != target.id:
        if not actor.role.is_privileged:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )
        check_company_access(actor, target)
    return build_user_out(target)


@router.get("/users/", response_model=list[UserOut], tags=["users"])
def list_users(
    db: Session = Depends(get_db),
    actor: User = Depends(require_privileged),
    companyid: int | None = Query(default=None, description="master: фильтр по компании"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[UserOut]:
    """
    Список пользователей. Access: privileged.
    master видит всех (можно фильтровать ?companyid=); остальные — только свою компанию.
    """
    if actor.role.key == "master":
        company_filter = companyid
    else:
        company_filter = actor.company_id  # чужие компании недоступны
    users = user_service.list_users(db, company_id=company_filter, limit=limit, offset=offset)
    return [build_user_out(u) for u in users]
