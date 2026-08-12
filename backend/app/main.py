"""
Точка входа приложения.

Здесь создаётся объект FastAPI и подключаются эндпоинты.
Запуск для разработки:   uvicorn app.main:app --reload
Документация Swagger:     http://localhost:8000/docs
"""

import logging

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.v1 import (
    auth, categories, companies, consents, dashboard, lessons, master, passwords,
    progress, roles, users,
)
from app.core.config import settings
from app.core.database import get_db

logger = logging.getLogger("app")

# Создаём приложение. title/version попадают в Swagger.
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)


# Единый формат для НЕПРЕДВИДЕННЫХ ошибок: клиент получает чистый JSON,
# а не трейсбек. Обычные HTTPException и ошибки валидации (422) FastAPI
# отдаёт сам в формате {"detail": ...} — их не трогаем.
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

# CORS — разрешаем фронтенду (React) обращаться к API из браузера.
# ВАЖНО: с cookie-сессиями и allow_credentials=True на ПРОДЕ нельзя "*" —
# нужно перечислить конкретные адреса фронтенда (CORS_ORIGINS в настройках).
# Для локальной разработки список берётся из settings (по умолчанию Vite-порт).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем эндпоинты разделов. Все они живут под /api/.
app.include_router(auth.router, prefix="/api")
app.include_router(passwords.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(consents.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(lessons.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(master.router, prefix="/api")


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
