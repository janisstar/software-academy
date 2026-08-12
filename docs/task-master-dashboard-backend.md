# Задача: GET /api/master/dashboard/ (бэкенд)

Платформенная сводка для master-интерфейса. Только бэкенд — фронтенд будет
отдельной задачей позже. Прочитай `docs/06-api-conventions.md` и
`docs/02-backend-guide.md` перед началом.

## Зачем

`GET /api/dashboard/` — личный учебный дашборд (continue/recommended), он
master-у не подходит: master уроки не смотрит и прогресса не имеет. Ему нужна
сводка «здоровья платформы»: компании, пользователи, контент, активность.

## Контракт эндпоинта

**`GET /api/master/dashboard/`** — доступ ТОЛЬКО роли `master`, остальным 403.
Тег Swagger: `Master`. Путь со слешем на конце (наша конвенция).

Форма ответа:

```jsonc
{
  "companies": {
    "total": 5,          // все компании
    "locked": 1          // is_locked = true
  },
  "users": {
    "total": 42,
    "locked": 3,
    "pending_first_login": 7   // must_change_password = true
  },
  "content": {
    "categories": 6,
    "lessons": 28,
    "public_lessons": 4        // is_public = true
  },
  "activity": {
    "online_now": 4,           // уникальные user_id в sessions,
                               // у кого last_seen_at за последние 10 минут
    "completions_total": 156,  // COUNT lesson_progress WHERE status = 'completed'
    "top_lessons": [           // топ-5 уроков по числу завершений, по убыванию
      { "id": 12, "title": "Daily Welding Report", "completions": 40 }
    ]
  },
  "recent": {
    "companies": [             // 5 последних по created_at, по убыванию
      { "id": 3, "name": "Acme Oy", "created_at": "..." }
    ],
    "users": [                 // 5 последних по created_at, по убыванию
      { "id": 12, "un": "j.salmela", "name": "Jenna Salmela",
        "company_name": "Acme Oy", "role_key": "user", "created_at": "..." }
    ]
  }
}
```

Уточнения к контракту:

- `top_lessons`: только уроки, у которых есть хотя бы одно завершение
  (уроки с нулём завершений в топ не попадают). Если завершений нет вообще —
  пустой массив.
- Компания-платформа (id=1) и master-пользователь входят в счётчики как есть —
  отдельно не исключаем (MVP, не усложняем).
- НИКАКОЙ разбивки прогресса по компаниям или людям — только анонимные
  агрегаты по всей платформе. Прогресс строго личный (заблокированное решение).

## Шаг 0 — проверка last_seen_at (сделать ПЕРВЫМ, доложить)

Для `online_now` нужно, чтобы `sessions.last_seen_at` обновлялся при каждом
авторизованном запросе. Проверь `get_current_user` (core/security.py или где
он живёт):

- Если `last_seen_at` уже обновляется — просто доложи, ничего не меняй.
- Если НЕ обновляется — добавь обновление в `get_current_user`
  (простое присваивание `datetime.now(timezone.utc)` + commit в рамках
  текущей db-сессии; без троттлинга, MVP). Доложи об этом изменении отдельно.

## Реализация (обычная схема)

1. **Схема** — `app/schemas/master_dashboard.py`: Pydantic-модели по контракту
   (вложенные модели: CompaniesBlock, UsersBlock, ContentBlock, ActivityBlock,
   TopLesson, RecentCompany, RecentUser, MasterDashboardOut). Имена полей —
   ровно как в контракте.
2. **Сервис** — `app/services/master_dashboard_service.py`: одна функция
   `get_master_dashboard(db) -> MasterDashboardOut`. Все счётчики — через
   `func.count()` (НЕ загружать все строки в память). Топ уроков — join
   lessons + lesson_progress, group by, order by count desc, limit 5.
   `online_now` — `COUNT(DISTINCT user_id)` по sessions с
   `last_seen_at >= now - 10 минут`. Окно 10 минут — константой в сервисе
   с комментарием.
3. **Роут** — `app/api/v1/master.py` (новый файл): thin route, проверка
   `master` по текущему пользователю (посмотри, как проверяются роли в
   существующих роутах — например, master-only в companies/categories — и
   сделай ТАК ЖЕ, не изобретай новый способ). Не master → 403 с
   `{"detail": "..."}`.
4. **Подключение** — include_router в общем месте (как подключены остальные),
   тег `Master`.

## Границы — НЕ трогать

- Существующие сервисы/роуты/модели (кроме возможного `get_current_user`
  из Шага 0 — и только его).
- Никаких миграций: новые таблицы/поля НЕ нужны, только чтение существующих.
- `GET /api/dashboard/` (личный) остаётся как есть.
- Фронтенд не трогаем вообще — отдельная задача.

## Проверки

Только статические: компиляция/импорты (например,
`docker compose exec backend python -c "import app.main"`), без запуска
runtime-флоу. Jenna тестирует сама.

## Отчёт (по формату CLAUDE.md)

Кратко: что сделано, файлы, вывод статической проверки, и testing guide:

- что перезапустить,
- как войти под keimo в Swagger,
- вызвать `GET /api/master/dashboard/` → ожидаемая форма ответа,
- проверить 403 под НЕ-master пользователем,
- как проверить `online_now` (войти вторым пользователем → счётчик растёт).
