"""
Настройки приложения.

Читаем значения из файла .env (или из переменных окружения, что важно для Docker).
Любая настройка проекта (адрес БД и т.п.) живёт здесь, а не разбросана по коду.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Откуда брать настройки: из файла .env, кодировка utf-8.
    # extra="ignore" — если в .env есть лишние переменные, не падаем.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Приложение ---
    APP_NAME: str = "Software Academy API"
    APP_VERSION: str = "0.1.0"

    # --- База данных ---
    # Пример: postgresql+psycopg://academy:academy@localhost:5432/academy
    DATABASE_URL: str

    # --- Сессии (настройки добавим на Шаге 5, при реализации входа) ---
    # SESSION_TTL_MINUTES: int = ...


# Один общий экземпляр настроек на всё приложение.
# Импортируем его так:  from app.core.config import settings
settings = Settings()
