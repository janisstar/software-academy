"""
Бизнес-логика для пользователей (Шаг 7).

Права проверяются в роутах (deps), здесь — только работа с данными.
"""

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.core.security import generate_temp_password, hash_password
from app.models.company import Company
from app.models.password_reset_code import PasswordResetCode
from app.models.user_consent import UserConsent
from app.models.progress import LessonProgress
from app.models.role import Role
from app.models.session import UserSession
from app.models.user import User
from app.services.company_service import PLATFORM_COMPANY_NAME

MASTER_USERNAME = "master"  # логин для ПЕРВОГО master при засеве


def get_by_username(db: Session, username: str) -> User | None:
    """Найти пользователя по логину (с ролью и компанией)."""
    return db.execute(
        select(User)
        .options(joinedload(User.role), joinedload(User.company))
        .where(User.username == username)
    ).scalar_one_or_none()


def list_users(
    db: Session,
    company_id: int | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[User]:
    """Список пользователей (опционально — одной компании), с пагинацией."""
    stmt = (
        select(User)
        .options(joinedload(User.role), joinedload(User.company))
        .order_by(User.id)
        .limit(limit)
        .offset(offset)
    )
    if company_id is not None:
        stmt = stmt.where(User.company_id == company_id)
    return list(db.execute(stmt).scalars().all())


def create_user(
    db: Session,
    username: str,
    name: str,
    role: Role,
    company_id: int,
    email: str | None = None,
) -> tuple[User, str]:
    """
    Создать пользователя с временным паролем.
    Возвращает (пользователь, временный пароль) — пароль показать один раз.
    """
    temp_password = generate_temp_password()
    user = User(
        username=username,
        password_hash=hash_password(temp_password),
        name=name,
        email=email,
        company_id=company_id,
        role_id=role.id,
        must_change_password=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, temp_password


def update_user(
    db: Session,
    user: User,
    name: str | None = None,
    email: str | None = None,
    new_username: str | None = None,
    role: Role | None = None,
) -> User:
    """Обновить поля пользователя (меняется только переданное)."""
    if name is not None:
        user.name = name
    if email is not None:
        user.email = email
    if new_username is not None:
        user.username = new_username
    if role is not None:
        user.role_id = role.id
    db.commit()
    db.refresh(user)
    return user


def set_locked(db: Session, user: User, locked: bool) -> User:
    """Заблокировать/разблокировать. При блокировке гасим все сессии."""
    user.is_locked = locked
    db.commit()
    if locked:
        db.execute(delete(UserSession).where(UserSession.user_id == user.id))
        db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    """
    GDPR-удаление: пользователь и всё связанное с ним стирается насовсем
    (сессии, коды сброса; на будущих шагах сюда добавится прогресс).
    """
    db.execute(delete(UserSession).where(UserSession.user_id == user.id))
    db.execute(
        delete(PasswordResetCode).where(PasswordResetCode.user_id == user.id)
    )
    db.execute(delete(UserConsent).where(UserConsent.user_id == user.id))
    db.execute(delete(LessonProgress).where(LessonProgress.user_id == user.id))
    db.delete(user)
    db.commit()


def count_masters(db: Session) -> int:
    """Сколько master в системе (нельзя удалить/понизить последнего)."""
    return len(
        db.execute(
            select(User.id)
            .join(Role, User.role_id == Role.id)
            .where(Role.key == "master")
        ).scalars().all()
    )


def seed_master_user(db: Session) -> str | None:
    """
    Создать первого master, если В СИСТЕМЕ НЕТ НИ ОДНОГО пользователя
    с ролью master (ищем по роли, а не по логину — логин можно переименовать).
    Возвращает временный пароль или None, если master уже есть.
    """
    if count_masters(db) > 0:
        return None

    role = db.execute(select(Role).where(Role.key == "master")).scalar_one()
    company = db.execute(
        select(Company).where(Company.name == PLATFORM_COMPANY_NAME)
    ).scalar_one()

    user, temp_password = create_user(
        db,
        username=MASTER_USERNAME,
        name="Platform Master",
        role=role,
        company_id=company.id,
    )
    return temp_password
