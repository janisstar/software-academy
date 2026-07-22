"""
Бизнес-логика для компаний.

Пока здесь только засев служебной компании-платформы (для master).
Управление компаниями через API добавим на шаге Users/контента.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company

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


def list_companies(db: Session) -> list[Company]:
    """Все компании (только master)."""
    return list(db.execute(select(Company).order_by(Company.id)).scalars().all())


def get_company(db: Session, company_id: int) -> Company | None:
    """Компания по id."""
    return db.execute(
        select(Company).where(Company.id == company_id)
    ).scalar_one_or_none()
