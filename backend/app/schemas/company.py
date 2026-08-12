"""
Схемы для компаний.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    businessid: str | None = None
    email: str | None = None
    is_locked: bool
    # когда компанию создали (UTC)
    created_at: datetime
    # сколько людей в компании; это НЕ колонка таблицы — значение считают в БД
    users_count: int


def build_company_out(company, users_count: int) -> CompanyOut:
    """
    Собрать CompanyOut из модели Company + посчитанное число людей.

    users_count в таблице companies не хранится, поэтому его всегда передают
    снаружи: для списка — одним запросом с GROUP BY, для одной компании —
    отдельным COUNT (см. services/company_service.py).
    """
    return CompanyOut(
        id=company.id,
        name=company.name,
        businessid=company.businessid,
        email=company.email,
        is_locked=company.is_locked,
        created_at=company.created_at,
        users_count=users_count,
    )


class CompanyCreateIn(BaseModel):
    """POST /api/company/ — создать компанию-клиента (только master)."""
    name: str
    businessid: str | None = None
    email: str | None = None
