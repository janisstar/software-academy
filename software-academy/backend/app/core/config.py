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

    # --- Юридические документы (тексты — на фронте, здесь только версии) ---
    # При изменении текста повышаем версию → согласие потребуется заново.
    PRIVACY_POLICY_VERSION: str = "1.0"
    TERMS_VERSION: str = "1.0"

    # --- Сессии ---
    # Срок жизни сессии в минутах. Пока длинный (30 дней); позже можно ~60.
    SESSION_TTL_MINUTES: int = 60 * 24 * 30
    # Имя cookie, в которой браузер хранит идентификатор сессии
    SESSION_COOKIE_NAME: str = "session_id"
    # Secure-флаг cookie: в проде (HTTPS) — True; локально по http — False
    SESSION_COOKIE_SECURE: bool = False


# Один общий экземпляр настроек на всё приложение.
# Импортируем его так:  from app.core.config import settings
settings = Settings()
