# 03 — База данных (PostgreSQL)

Как устроена БД, какие таблицы, как с ними работать через миграции.

---

## 1. Почему PostgreSQL и зачем ORM/миграции

- **PostgreSQL** — надёжная реляционная БД. Подходит для связанных данных
  (пользователи ↔ роли ↔ уроки ↔ прогресс).
- **SQLAlchemy (ORM)** — пишешь Python-классы, а не сырой SQL. Таблица = класс,
  строка = объект. Меньше ручного SQL → меньше ошибок.
- **Alembic (миграции)** — это «версии» структуры БД. Изменил модель — создаёшь
  миграцию — применяешь её. Так структура БД на всех машинах одинаковая, и
  изменения откатываются. Думай о миграциях как о git-коммитах для схемы.

---

## 2. Схема БД (таблицы и связи)

```
        ┌──────────────┐
        │    roles     │
        │──────────────│
        │ id (PK)      │
        │ key          │  administrator / manager / site_manager /
        │ name         │  inspector / welder / fitter
        │ is_privileged│  true → видит все уроки + раздел Users
        └──────┬───────┘
               │ 1
               │
               │ N
        ┌──────┴───────┐
        │    users     │
        │──────────────│
        │ id (PK)      │
        │ name         │
        │ username     │  уникальный, для входа
        │ password_hash│  НИКОГДА не храним пароль открыто
        │ role_id (FK) │ ──→ roles.id
        │ is_active    │  деактивация вместо удаления
        │ must_change_password │  true → заставить сменить при входе
        │ created_at   │
        └──────┬───────┘
               │ 1
               │ N
        ┌──────┴────────────┐         ┌──────────────┐
        │  lesson_progress  │         │  categories  │
        │───────────────────│         │──────────────│
        │ id (PK)           │         │ id (PK)      │
        │ user_id (FK)      │         │ name         │
        │ lesson_id (FK)    │         │ slug         │
        │ status            │         │ parent_id(FK)│ ──→ categories.id
        │ watch_percent     │         │ order        │   (подкатегории)
        │ last_position_sec │         └──────┬───────┘
        │ started_at        │                │ 1
        │ completed_at      │                │ N
        └───────┬───────────┘         ┌──────┴───────────┐
                │ N                    │     lessons      │
                │                      │──────────────────│
                └──────────────────→   │ id (PK)          │
                            1          │ title            │
                                       │ slug             │
        ┌──────────────┐               │ description      │
        │ lesson_roles │               │ duration_seconds │
        │──────────────│               │ vimeo_id         │
        │ lesson_id(FK)│ ──────────→   │ thumbnail_url    │
        │ role_id (FK) │   N : N       │ transcript       │
        └──────────────┘  (видимость)  │ category_id (FK) │
                                       │ is_public        │ ← виден всем
                                       │ order            │
                                       │ created_at       │
                                       └──────────────────┘
```

Связи словами:
- У **роли** много **пользователей** (1:N).
- У **пользователя** одна роль, и много записей **прогресса** (1:N).
- **Категория** может иметь подкатегории через `parent_id` (ссылка на саму себя).
- У **категории** много **уроков** (1:N).
- **Уроки** и **роли** связаны через `lesson_roles` (N:N) — кто видит урок.
- **Прогресс** связывает пользователя и урок; для пары (user, lesson) —
  одна запись.

---

## 3. Ключевые поля и значения

**roles.is_privileged** — самое важное поле модели доступа. `true` для
administrator / manager / site_manager. На него опирается правило видимости.

**lesson_progress.status** — одно из:
- `not_started`
- `in_progress`
- `completed`

**lessons.is_public** — `true`, если урок виден всем (например, Login / Adding
hours). Тогда `lesson_roles` для него можно не заполнять.

---

## 4. Правило видимости — на языке БД

Какие уроки показать пользователю с ролью `role_id`:

```sql
SELECT l.*
FROM lessons l
WHERE
    l.is_public = true
    OR (SELECT is_privileged FROM roles WHERE id = :user_role_id) = true
    OR l.id IN (
        SELECT lesson_id FROM lesson_roles WHERE role_id = :user_role_id
    );
```

В коде эту логику пишем **один раз** в `services/` и переиспользуем (каталог,
рекомендации, dashboard — всё опирается на одну функцию видимости).

---

## 5. Стартовые данные (seed)

При первом запуске нужно залить **6 ролей** (см. таблицу выше). Их `key` и
`is_privileged` фиксированы. Категории и уроки вендор заводит сам.

Seed-роли (минимум для старта):

| key            | name          | is_privileged |
|----------------|---------------|---------------|
| administrator  | Administrator | true          |
| manager        | Manager       | true          |
| site_manager   | Site Manager  | true          |
| inspector      | Inspector     | false         |
| welder         | Welder        | false         |
| fitter         | Fitter        | false         |

Seed сделаем отдельным скриптом / миграцией на соответствующем шаге roadmap.

---

## 6. Работа с миграциями Alembic (команды)

```bash
# один раз — инициализация Alembic в проекте (делается на шаге настройки)
alembic init alembic

# создать миграцию автоматически по изменениям в models/
alembic revision --autogenerate -m "create users and roles"

# применить миграции к БД (привести БД к актуальной схеме)
alembic upgrade head

# откатить последнюю миграцию (если что-то пошло не так)
alembic downgrade -1
```

**Рабочий цикл:** изменил модель в `models/` → `alembic revision --autogenerate`
→ посмотрел сгенерированный файл миграции → `alembic upgrade head`.

> Важно: всегда читай сгенерированную миграцию глазами перед `upgrade`.
> Автогенерация хороша, но не идеальна.
