"""
Схемы для компаний.
"""

from pydantic import BaseModel, ConfigDict


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    businessid: str | None = None
    email: str | None = None
    is_locked: bool


class CompanyCreateIn(BaseModel):
    """POST /api/company/ — создать компанию-клиента (только master)."""
    name: str
    businessid: str | None = None
    email: str | None = None
