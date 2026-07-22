"""
Бизнес-логика для пользователей.

Пока здесь только засев первого master-пользователя (проблема "курицы и яйца":
пользователей создаёт master через API, но самого первого master создать некому —
поэтому его засеваем скриптом). Полный CRUD пользователей — на Шаге 7.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import generate_temp_password, hash_password
from app.models.role import Role
from app.models.user import User
from app.services.company_service import PLATFORM_COMPANY_NAME
from app.models.company import Company

MASTER_USERNAME = "master"


def seed_master_user(db: Session) -> str | None:
    """
    Создать первого master-пользователя, если его ещё нет.
    Возвращает временный пароль (показать один раз) или None, если уже был.
    """
    existing = db.execute(
        select(User).where(User.username == MASTER_USERNAME)
    ).scalar_one_or_none()
    if existing is not None:
        return None

    role = db.execute(select(Role).where(Role.key == "master")).scalar_one()
    company = db.execute(
        select(Company).where(Company.name == PLATFORM_COMPANY_NAME)
    ).scalar_one()

    temp_password = generate_temp_password()
    db.add(
        User(
            username=MASTER_USERNAME,
            password_hash=hash_password(temp_password),
            name="Platform Master",
            company_id=company.id,
            role_id=role.id,
            must_change_password=True,  # сменить при первом входе (эндпоинт — Шаг 6)
        )
    )
    db.commit()
    return temp_password
