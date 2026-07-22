"""
Схемы для управления пользователями (Шаг 7).
"""

from pydantic import BaseModel

from app.schemas.auth import UserOut


class UserCreateIn(BaseModel):
    """POST /api/user/ — создать пользователя. Пароль не передаётся:
    система сама генерирует временный и возвращает его один раз."""
    un: str
    name: str
    role: str                     # ключ роли: admin/manager/site/inspector/user/fitter
    email: str | None = None
    companyid: int | None = None  # master обязан указать; admin/manager/site — игнорируется (своя)


class UserCreateOut(BaseModel):
    """Ответ на создание: пользователь + временный пароль (показывается один раз)."""
    user: UserOut
    temp_password: str


class UserUpdateIn(BaseModel):
    """PATCH /api/user/ — обновить пользователя. un указывает, КОГО меняем;
    остальные поля необязательны — меняется только то, что передано."""
    un: str
    name: str | None = None
    email: str | None = None
    new_un: str | None = None     # переименовать логин
    role: str | None = None       # сменить роль (только привилегированные)


class UserLockIn(BaseModel):
    """POST /api/user/lock/ — заблокировать (true) или разблокировать (false)."""
    un: str
    locked: bool


class UserDeleteIn(BaseModel):
    """DELETE /api/user/ — удалить пользователя (GDPR: данные стираются насовсем)."""
    un: str
