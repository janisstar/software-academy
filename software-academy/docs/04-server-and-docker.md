# 04 — Сервер и Docker

Как запустить бэкенд: сначала локально (чтобы понять, что происходит), потом
через Docker (чтобы запускалось одной командой у всех одинаково).

---

## 1. Переменные окружения (.env)

Бэкенду нужны настройки: адрес БД, секрет для JWT. Их не пишут в коде и не
коммитят в git. Они лежат в файле `.env` (в репозитории — только шаблон
`.env.example`).

`backend/.env.example`:
```env
# Подключение к базе данных
DATABASE_URL=postgresql+psycopg://academy:academy@localhost:5432/academy

# Секрет для подписи JWT-токенов (в проде — длинная случайная строка!)
JWT_SECRET=change-me-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Чтобы начать: скопируй шаблон в реальный файл и при необходимости поправь.
```bash
cp backend/.env.example backend/.env
```

---

## 2. Запуск локально (без Docker) — чтобы понять механику

Это полезно пройти руками хотя бы раз — увидишь все шаги по отдельности.

```bash
cd backend

# 1. виртуальное окружение
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 2. зависимости
pip install -r requirements.txt

# 3. нужна работающая PostgreSQL (локально или в Docker — см. ниже)

# 4. применить миграции
alembic upgrade head

# 5. запустить сервер
uvicorn app.main:app --reload
```

Открой в браузере:
- `http://localhost:8000/docs` — Swagger (интерактивная документация API)
- `http://localhost:8000/health` — проверка, что сервер жив (вернём такой эндпоинт)

---

## 3. Docker — зачем он нужен

**Проблема без Docker:** у тебя одна версия Python и Postgres, у коллеги другая,
на сервере третья — и «у меня работает, у тебя нет». 

**Docker** упаковывает приложение и его окружение в «контейнер» — изолированную
коробку, которая запускается одинаково везде. **docker-compose** запускает
несколько контейнеров вместе одной командой: у нас это **бэкенд + PostgreSQL**.

Понятия простыми словами:
- **Образ (image)** — рецепт/слепок: «Python + наш код + зависимости».
- **Контейнер (container)** — запущенный экземпляр образа.
- **Dockerfile** — инструкция, как собрать образ нашего бэкенда.
- **docker-compose.yml** — описание, какие контейнеры запускать и как они
  связаны (бэкенд знает адрес БД).

---

## 4. Что будет в Dockerfile (бэкенд)

Идея файла (соберём на шаге Docker в roadmap):
```dockerfile
FROM python:3.12-slim           # берём лёгкий образ с Python
WORKDIR /app                    # рабочая папка внутри контейнера
COPY requirements.txt .         # сначала зависимости (для кэша)
RUN pip install -r requirements.txt
COPY . .                        # затем наш код
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 5. Что будет в docker-compose.yml

Два сервиса — база и бэкенд:
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: academy
      POSTGRES_PASSWORD: academy
      POSTGRES_DB: academy
    volumes:
      - postgres-data:/var/lib/postgresql/data   # данные не пропадают
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    env_file: ./backend/.env
    depends_on:
      - db
    ports:
      - "8000:8000"

volumes:
  postgres-data:
```

> Примечание: внутри Docker адрес БД в `DATABASE_URL` — не `localhost`, а имя
> сервиса `db` (например `...@db:5432/academy`). Контейнеры видят друг друга по
> именам сервисов.

---

## 6. Запуск через Docker (команды)

```bash
# собрать и запустить всё (бэкенд + БД)
docker compose up --build

# в фоне
docker compose up -d --build

# применить миграции внутри контейнера бэкенда
docker compose exec backend alembic upgrade head

# логи
docker compose logs -f backend

# остановить
docker compose down

# остановить и удалить данные БД (осторожно — сотрёт всё)
docker compose down -v
```

После `up` Swagger будет на `http://localhost:8000/docs`.

---

## 7. Как создать git-репозиторий (Шаг 1 из roadmap)

```bash
cd software-academy
git init
git add .
git commit -m "chore: project docs and skeleton"

# создай пустой репозиторий на GitHub (через сайт), затем:
git remote add origin https://github.com/<твой-аккаунт>/software-academy.git
git branch -M main
git push -u origin main
```

`.gitignore` уже настроен: `.env`, `.venv`, `node_modules`, данные Postgres —
в git не попадут.
