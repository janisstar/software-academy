"""
Подключение к базе данных.

Здесь создаётся "движок" (engine) — соединение с PostgreSQL,
фабрика сессий и базовый класс для моделей.

Главное, что отсюда используют другие файлы:
- Base    — от него наследуются все модели таблиц (Шаг 3).
- get_db  — "зависимость" FastAPI: даёт эндпоинту сессию БД и закрывает её после.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# Движок не подключается к БД сразу — только при первом запросе.
# Поэтому приложение стартует, даже если БД ещё не поднялась.
# pool_pre_ping=True — проверяет, что соединение живое, перед использованием.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Фабрика сессий. Сессия — это "разговор" с БД в рамках одного запроса.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Базовый класс для всех моделей таблиц (Шаг 3 будет наследоваться от него)."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    Зависимость FastAPI: открывает сессию на время запроса и гарантированно
    закрывает её после. В эндпоинте используется так:

        def my_endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
