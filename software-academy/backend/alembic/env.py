"""
Конфигурация запуска миграций Alembic.

Главное, что мы тут настроили:
1. Адрес БД берём из настроек приложения (app.core.config), а не из alembic.ini.
2. target_metadata = Base.metadata — по нему autogenerate сравнивает модели с БД.
3. Импортируем модели (app.models), чтобы Alembic их "увидел".
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.core.database import Base
import app.models  # noqa: F401  — регистрирует все модели на Base.metadata

# Объект конфигурации Alembic (читает alembic.ini)
config = context.config

# Подставляем адрес БД из настроек приложения
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Настройка логирования из alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# По этой "карте таблиц" Alembic понимает, что должно быть в БД
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Режим без подключения к БД: генерирует SQL-скрипт."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Обычный режим: подключаемся к БД и применяем миграции."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
