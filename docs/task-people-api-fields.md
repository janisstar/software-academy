# Задача: created_at и users_count в API + заполнить прочерки на фронте

Раздел People готов, но две колонки показывают «—», потому что API не отдаёт
данные. Задача в двух частях: сначала бэкенд, потом codegen + фронтенд.
Прочитай `docs/06-api-conventions.md`; правки минимальные.

## Часть А — бэкенд

**Миграций НЕТ**: поля `users.created_at` и `companies.created_at` уже
существуют в БД (см. `docs/03-database-guide.md`) — их просто нет в схемах
ответа.

1. **`UserOut`** (`app/schemas/user.py`): добавить `created_at: datetime`.
   Проверь все места, где `UserOut` собирается из модели — поле должно
   заполняться везде (список, один пользователь, ответ создания и т.д.).
2. **`CompanyOut`** (`app/schemas/company.py`): добавить
   `created_at: datetime` и `users_count: int` — число пользователей
   компании.
   - `users_count` считать ОДНИМ запросом для всего списка (join/подзапрос
     с group by), НЕ по запросу на каждую компанию (N+1 запрещён).
   - Заполнить во всех местах, где собирается `CompanyOut`
     (`GET /api/companies/`, `GET /api/user/company/`, ответ создания).
3. Убедиться, что ничего не сломалось в местах, которые уже используют эти
   схемы (например, login-ответ содержит company). Существующие поля и
   формы ответов НЕ менять.

Статическая проверка: `docker compose exec backend python -c "import app.main"`
+ убедиться, что openapi-схема содержит новые поля.

## Часть Б — фронтенд (после части А)

1. Бэкенд поднят → `npm run gen:api` → `schema.d.ts` обновился
   (руками не править). Проверить, что псевдонимы в `types/api.ts`
   подхватили поля.
2. **UsersTable**: колонка Created — `formatShortDate(user.created_at)`
   вместо прочерка.
3. **CompaniesTable**: колонка Users — `users_count`; колонка Created —
   `formatShortDate(company.created_at)`.
4. Больше ничего не менять: никаких новых компонентов, сортировок и т.п.

## Границы — НЕ трогать

- Никаких новых эндпоинтов (управление компаниями — PATCH/lock/страница —
  отдельное будущее решение, не в этой задаче).
- Модели БД и миграции.
- Дашборд (`RecentUser`/`RecentCompany` — отдельные схемы, их не трогать).

## Проверки и отчёт

Бэкенд: импорт-проверка. Фронтенд: `tsc` / `npm run build`. Отчёт по формату
CLAUDE.md + testing guide:

- перезапустить бэкенд (docker compose up -d --build backend, если без
  reload) → Swagger: в ответе `GET /api/users/` у пользователей есть
  `created_at`; в `GET /api/companies/` — `created_at` и `users_count`;
- People → Users: колонка Created заполнена датами (Aug 12, 2026);
- People → Companies: Users показывает число людей (сверь: у компании
  из тестов — сколько ты реально создала), Created заполнена;
- создать нового пользователя → в списке у него сегодняшняя дата;
- логин/вход не сломан (login-ответ содержит company с новыми полями).
