"""
Точка входа приложения.

Здесь создаётся объект FastAPI и подключаются эндпоинты.
Запуск для разработки:   uvicorn app.main:app --reload
Документация Swagger:     http://localhost:8000/docs
"""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

# Создаём приложение. title/version попадают в Swagger.
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# CORS — разрешаем фронтенду (React) обращаться к API из браузера.
# Пока режим разработки: разрешаем всё. На проде сузим список адресов.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def root() -> dict:
    """Корневой эндпоинт — просто отвечает, что API работает."""
    return {"name": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/health", tags=["health"])
def health() -> dict:
    """Проверка, что сервер жив (не трогает БД)."""
    return {"status": "ok"}


@app.get("/health/db", tags=["health"])
def health_db(db: Session = Depends(get_db)) -> dict:
    """
    Проверка, что бэкенд видит базу данных.
    Выполняет простейший запрос SELECT 1.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:  # noqa: BLE001 — здесь намеренно ловим всё
        return {"status": "error", "database": "unavailable", "detail": str(exc)}
