"""
Схемы (Pydantic) для роли.

Схема описывает "форму" данных в API. RoleOut — то, что мы ОТДАЁМ наружу
в ответе. Она отделена от модели БД (Role): так мы сами решаем, какие поля
показывать клиенту, и можем менять таблицу, не ломая API.
"""

from pydantic import BaseModel, ConfigDict


class RoleOut(BaseModel):
    # from_attributes=True позволяет Pydantic собрать схему прямо из
    # объекта SQLAlchemy (Role), читая его поля как атрибуты.
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    name: str
    is_privileged: bool
