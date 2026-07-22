"""
Заливка стартовых данных в БД.

Запуск (в Docker):
    docker compose exec backend python -m app.seed
    docker compose exec backend python -m app.seed --reset   # очистить роли и залить заново

Что засевается:
- 7 ролей (master, admin, manager, site, inspector, user, fitter);
- компания-платформа SevenHeaven (id=1) — для master-пользователей.

Скрипт идемпотентный: повторный запуск не создаёт дубликатов.
--reset нужен только если поменялись ключи ролей (чистит таблицу roles).
Первый master-пользователь засевается на Шаге 5 (нужен хеш пароля Argon2id).
"""

import sys

from app.core.database import SessionLocal
from app.services.company_service import seed_platform_company
from app.services.role_service import reset_roles, seed_roles


def main() -> None:
    reset = "--reset" in sys.argv
    db = SessionLocal()
    try:
        if reset:
            removed = reset_roles(db)
            print(f"Очищена таблица roles (удалено: {removed}).")

        added = seed_roles(db)
        print(f"Роли: добавлено новых — {added}.")

        created = seed_platform_company(db)
        print(
            "Компания-платформа SevenHeaven: создана."
            if created
            else "Компания-платформа SevenHeaven: уже была."
        )
        print("Готово.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
