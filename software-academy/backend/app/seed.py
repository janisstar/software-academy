"""
Заливка стартовых данных в БД.

Запуск (в Docker):
    docker compose exec backend python -m app.seed
    docker compose exec backend python -m app.seed --reset   # очистить и залить заново

Запуск (локально, из папки backend с активным venv):
    python -m app.seed
    python -m app.seed --reset

--reset нужен, когда поменялись ключи ролей: очищает таблицу и засевает заново.
Без --reset скрипт идемпотентный — добавляет только недостающие роли.
"""

import sys

from app.core.database import SessionLocal
from app.services.role_service import reset_roles, seed_roles


def main() -> None:
    reset = "--reset" in sys.argv
    db = SessionLocal()
    try:
        if reset:
            removed = reset_roles(db)
            print(f"Очищена таблица roles (удалено: {removed}).")
        added = seed_roles(db)
        print(f"Готово. Добавлено новых ролей: {added}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
