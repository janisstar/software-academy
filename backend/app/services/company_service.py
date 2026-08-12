"""
Бизнес-логика для компаний.

Пока здесь только засев служебной компании-платформы (для master).
Управление компаниями через API добавим на шаге Users/контента.
"""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.user import User

# Название служебной компании-платформы (к ней привязаны master-пользователи).
# На чистой БД она засевается первой и получает id=1.
PLATFORM_COMPANY_NAME = "SevenHeaven"


def seed_platform_company(db: Session) -> bool:
    """
    Создать компанию-платформу, если её ещё нет. Идемпотентно (сверяем по имени).
    Возвращает True, если создали; False, если уже была.
    """
    existing = db.execute(
        select(Company).where(Company.name == PLATFORM_COMPANY_NAME)
    ).scalar_one_or_none()
    if existing is not None:
        return False
    db.add(Company(name=PLATFORM_COMPANY_NAME))
    db.commit()
    return True


def create_company(
    db: Session,
    name: str,
    businessid: str | None = None,
    email: str | None = None,
) -> Company:
    """Создать компанию-клиента (только master)."""
    company = Company(name=name, businessid=businessid, email=email)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def list_companies_with_user_counts(db: Session) -> list[tuple[Company, int]]:
    """
    Все компании вместе с числом людей в каждой — ОДНИМ запросом.

    Считаем в БД (COUNT + GROUP BY), а не по запросу на компанию: иначе на
    список из N компаний ушло бы N+1 запросов.

    outerjoin, а не join: компания без людей должна остаться в списке с нулём,
    а INNER JOIN выбросил бы её совсем.
    """
    users_count = func.count(User.id)
    rows = db.execute(
        select(Company, users_count.label("users_count"))
        .outerjoin(User, User.company_id == Company.id)
        .group_by(Company.id)
        .order_by(Company.id)
    ).all()
    return [(row[0], row.users_count) for row in rows]


def count_users(db: Session, company_id: int) -> int:
    """Сколько людей в одной компании (COUNT в БД, строки в память не грузим)."""
    return db.execute(
        select(func.count(User.id)).where(User.company_id == company_id)
    ).scalar_one()


def get_company(db: Session, company_id: int) -> Company | None:
    """Компания по id."""
    return db.execute(
        select(Company).where(Company.id == company_id)
    ).scalar_one_or_none()
