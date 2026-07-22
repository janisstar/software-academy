"""
Заливка стартовых данных в БД.

Запуск (в Docker):
    docker compose exec backend python -m app.seed
    docker compose exec backend python -m app.seed --reset   # очистить роли и залить заново

Что засевается:
- 7 ролей (master, admin, manager, site, inspector, user, fitter);
- компания-платформа SevenHeaven (id=1);
- первый master-пользователь (логин master) — временный пароль печатается ОДИН раз.

Скрипт идемпотентный: повторный запуск не создаёт дубликатов
(и не печатает пароль заново — он показывается только при создании).
"""

import sys

from app.core.database import SessionLocal
from app.services.company_service import seed_platform_company
from app.services.role_service import reset_roles, seed_roles
from app.services.user_service import seed_master_user


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

        temp_password = seed_master_user(db)
        if temp_password:
            print("Master-пользователь создан. Логин: master")
            print(f"ВРЕМЕННЫЙ ПАРОЛЬ (показывается один раз): {temp_password}")
            print("Сохрани его — после входа смени на постоянный.")
        else:
            print("Master-пользователь: уже был.")
        print("Готово.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
