"""
Схемы для авторизации и ответа "пользователь".

UserOut повторяет форму Welding Log: privileges-объект собирается из ОДНОЙ
роли пользователя (ключ роли = 1, остальные = 0, locked из is_locked).
См. docs/06-api-conventions.md, §5.
"""

from pydantic import BaseModel

# порядок ключей — как в Welding Log
PRIVILEGE_KEYS = ["master", "admin", "manager", "site", "user", "fitter", "inspector"]


class LoginIn(BaseModel):
    """Тело запроса POST /api/login/ (пароль — в теле, не в URL)."""
    un: str
    pw: str


class UserOut(BaseModel):
    """Пользователь в ответе API (форма как у Welding Log)."""
    id: int
    un: str
    name: str
    email: str | None = None
    companyid: int
    privileges: dict[str, int]
    must_change_password: bool = False


def build_user_out(user) -> UserOut:
    """
    Собрать UserOut из модели User: privileges-объект из одной роли.
    user.role должен быть загружен (relationship).
    """
    privileges = {key: 0 for key in PRIVILEGE_KEYS}
    if user.role.key in privileges:
        privileges[user.role.key] = 1
    privileges["locked"] = 1 if user.is_locked else 0
    return UserOut(
        id=user.id,
        un=user.username,
        name=user.name,
        email=user.email,
        companyid=user.company_id,
        privileges=privileges,
        must_change_password=user.must_change_password,
    )
