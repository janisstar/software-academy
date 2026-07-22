# 03 — База данных (PostgreSQL)

Как устроена БД, какие таблицы, как с ними работать через миграции.
Конвенции по ролям/компаниям/авторизации — в `06-api-conventions.md`.

---

## 1. Почему PostgreSQL и зачем ORM/миграции

- **PostgreSQL** — надёжная реляционная БД для связанных данных (компании ↔
  пользователи ↔ роли ↔ уроки ↔ прогресс). Всё в **одной** базе.
- **SQLAlchemy (ORM)** — таблица = Python-класс, строка = объект. Меньше ручного SQL.
- **Alembic (миграции)** — «версии» структуры БД. Изменил модель → создал
  миграцию → применил. Как git-коммиты, но для схемы.

---

## 2. Таблицы и связи

```
┌──────────────┐         ┌──────────────┐
│  companies   │         │    roles     │
│──────────────│         │──────────────│
│ id (PK)      │         │ id (PK)      │
│ name         │         │ key          │ master/admin/manager/site/
│ businessid?  │         │ name         │ inspector/user/fitter
│ email?       │         │ is_privileged│
│ is_locked    │         └──────┬───────┘
│ created_at   │                │ 1
└──────┬───────┘                │
       │ 1                      │ N
       │ N               ┌──────┴───────┐
┌──────┴────────────────→│    users     │
│                        │──────────────│
│   (company_id FK)      │ id (PK)      │
│                        │ username (un)│ уникальный, для входа
│                        │ password_hash│ Argon2id, НЕ открытый пароль
│                        │ name         │
│                        │ email?       │ необязательное
│                        │ company_id FK│ ──→ companies.id
│                        │ role_id FK   │ ──→ roles.id
│                        │ is_locked    │ блокировка (lock/unlock)
│                        │ must_change_password │ временный пароль при 1-м входе
│                        │ created_at   │
│                        └──┬────────┬──┘
│                       1 │        │ 1
│                         │ N      │ N
│              ┌──────────┴───┐  ┌─┴──────────────────┐
│              │   sessions   │  │  lesson_progress   │
│              │──────────────│  │────────────────────│
│              │ id (PK,token)│  │ id (PK)            │
│              │ user_id FK   │  │ user_id FK         │
│              │ created_at   │  │ lesson_id FK ──────┼──→ lessons.id
│              │ expires_at   │  │ status             │
│              │ last_seen_at │  │ watch_percent      │
│              │ ip           │  │ last_position_sec  │
│              │ user_agent   │  │ started_at         │
│              └──────────────┘  │ completed_at       │
│                                └────────────────────┘
│
│   ┌──────────────┐          ┌──────────────────┐
│   │  categories  │          │     lessons      │
│   │──────────────│          │──────────────────│
│   │ id (PK)      │ 1      N │ id (PK)          │
│   │ name         │──────────│ title            │
│   │ slug         │          │ slug             │
│   │ parent_id FK │          │ description      │
│   │ order        │          │ duration_seconds │
│   └──────────────┘          │ vimeo_id         │
│                             │ thumbnail_url    │
│   ┌──────────────┐          │ transcript       │
│   │ lesson_roles │ N : N    │ category_id FK   │
│   │──────────────│──────────│ is_public        │ виден всем
│   │ lesson_id FK │ видимость│ order            │
│   │ role_id FK   │          │ created_at       │
│   └──────────────┘          └──────────────────┘
```

Связи словами:
- У **компании** много **пользователей** (1:N). У пользователя одна компания и одна роль.
- У **пользователя** много **сессий** (вход с разных устройств) и много записей **прогресса**.
- **Контент общий**: категории/уроки не привязаны к компании.
- **Категория** может иметь подкатегории через `parent_id`.
- **Уроки** ↔ **роли** через `lesson_roles` (N:N) — кто видит урок.

---

## 3. Ключевые поля

- **roles.is_privileged** — `true` у master/admin/manager/site. На него
  опирается правило видимости каталога.
- **users.role_id** — одна роль (см. `06-api-conventions.md`, §2). В ответе API
  из неё собирается `privileges`-объект.
- **users.company_id** — обязательно у всех; master привязан к компании-платформе (id=1).
- **users.is_locked / must_change_password** — блокировка и обязательная смена
  временного пароля при первом входе.
- **lesson_progress.status** — `not_started` / `in_progress` / `completed`.
- **lessons.is_public** — `true`, если урок виден всем (тогда `lesson_roles` пуст).

---

## 4. Правило видимости уроков (на языке БД)

Какие уроки показать пользователю с ролью `role_id`:

```sql
SELECT l.*
FROM lessons l
WHERE
    l.is_public = true
    OR (SELECT is_privileged FROM roles WHERE id = :user_role_id) = true
    OR l.id IN (SELECT lesson_id FROM lesson_roles WHERE role_id = :user_role_id);
```

Эту логику пишем один раз в `services/` и переиспользуем (каталог, dashboard,
рекомендации). Контент общий — фильтра по компании в видимости нет.

---

## 5. Стартовые данные (seed)

При старте заливаем **7 ролей** (фиксированные ключи) и **компанию-платформу**
(id=1) для master. Команда:

```bash
docker compose exec backend python -m app.seed          # добавить недостающее
docker compose exec backend python -m app.seed --reset  # очистить роли и залить заново
```

| key       | name           | is_privileged |
|-----------|----------------|---------------|
| master    | Master         | true          |
| admin     | Administrator  | true          |
| manager   | Manager        | true          |
| site      | Site Supervisor| true          |
| inspector | Inspector      | false         |
| user      | Welder         | false         |
| fitter    | Fitter         | false         |

---

## 6. Миграции Alembic (команды)

```bash
# создать миграцию по изменениям в models/ (autogenerate)
docker compose exec backend alembic revision --autogenerate -m "create companies and users"

# применить миграции к БД
docker compose exec backend alembic upgrade head

# откатить последнюю
docker compose exec backend alembic downgrade -1
```

**Рабочий цикл:** изменил модель → autogenerate → ГЛАЗАМИ посмотрел файл
миграции → upgrade. Автогенерация хороша, но не идеальна — всегда проверяй.
