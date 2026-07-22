"""
Бизнес-логика для ролей.

Здесь живёт работа с данными ролей. Роут (api/) сюда обращается, сам в БД не лезет.
Так логику легко переиспользовать и тестировать.
"""

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.role import Role

# Фиксированный стартовый набор ролей (см. docs/06-api-conventions.md).
# Ключи совпадают с платформой Welding Log: один человек — одна роль.
# is_privileged=True → видит весь каталог и управляет людьми (master/admin/manager/site).
DEFAULT_ROLES = [
    {"key": "master", "name": "Master", "is_privileged": True},      # вендор: контент + все компании
    {"key": "admin", "name": "Administrator", "is_privileged": True},
    {"key": "manager", "name": "Manager", "is_privileged": True},
    {"key": "site", "name": "Site Supervisor", "is_privileged": True},
    {"key": "inspector", "name": "Inspector", "is_privileged": False},
    {"key": "user", "name": "Welder", "is_privileged": False},
    {"key": "fitter", "name": "Fitter", "is_privileged": False},
]


def list_roles(db: Session) -> list[Role]:
    """Вернуть все роли, отсортированные по id."""
    return list(db.execute(select(Role).order_by(Role.id)).scalars().all())


def seed_roles(db: Session) -> int:
    """
    Залить стартовые роли. Добавляет только те, которых ещё нет (сверяем по key).
    Идемпотентно: повторный запуск не создаёт дубликатов.
    Возвращает количество фактически добавленных ролей.
    """
    existing_keys = set(db.execute(select(Role.key)).scalars().all())
    added = 0
    for data in DEFAULT_ROLES:
        if data["key"] not in existing_keys:
            db.add(Role(**data))
            added += 1
    db.commit()
    return added


def reset_roles(db: Session) -> int:
    """
    Полностью очистить таблицу roles (для пере-засева с новыми ключами).
    Безопасно, ПОКА на роли не ссылаются пользователи (таблицы users ещё нет).
    Возвращает число удалённых строк.
    """
    result = db.execute(delete(Role))
    db.commit()
    return result.rowcount or 0
