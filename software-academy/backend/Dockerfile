# Лёгкий официальный образ с Python 3.12
FROM python:3.12-slim

# Не создавать .pyc и не буферизировать вывод (логи видны сразу)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Рабочая папка внутри контейнера
WORKDIR /app

# Сначала зависимости — чтобы Docker кэшировал слой и не переустанавливал
# их при каждом изменении кода.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Затем — наш код
COPY . .

# Запуск сервера. host 0.0.0.0 — чтобы был доступен снаружи контейнера.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
