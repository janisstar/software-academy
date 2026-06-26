# Backend — Software Academy

Python-бэкенд (FastAPI + SQLAlchemy + PostgreSQL).

Папки наполняются по шагам из `../docs/05-roadmap.md`. Сейчас здесь только
структура-скелет. Как устроен бэкенд и как добавлять эндпоинты — см.
`../docs/02-backend-guide.md`. Запуск и Docker — `../docs/04-server-and-docker.md`.

## Структура `app/`
- `core/`    — конфиг, подключение к БД, безопасность (JWT, хеш паролей)
- `models/`  — таблицы БД (SQLAlchemy)
- `schemas/` — формы запросов/ответов (Pydantic)
- `services/`— бизнес-логика
- `api/v1/`  — эндпоинты (REST API)
