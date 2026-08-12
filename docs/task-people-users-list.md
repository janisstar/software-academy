# Задача: People → Users list (часть 1 из 4)

Первая часть раздела People. ТОЛЬКО список пользователей — страница
пользователя, создание и Companies будут отдельными задачами.

Мокап — источник правды по виду: `docs/mockups/people-mockup.html`,
**экран 1 (Users list)**. Прочитай `frontend/CLAUDE.md`.

## Шаг 0 — разведка (доложить до кода)

1. Открой `src/api/schema.d.ts` и проверь: есть ли в типе пользователя из
   `GET /api/users/` поле `must_change_password`?
   - Есть → статус «Pending first login» строим по нему.
   - НЕТ → СТОП по этому пункту: делаем только статусы Active/Locked
     (без таба Pending), и отдельно доложи — добавление поля в ответ бэка
     будет отдельной задачей. Бэкенд в этой задаче НЕ трогать.
2. Проверь в navConfig/AppRoutes, какой путь у страницы Users
   (например /people/users) — используй существующий, не переименовывай.

## Токены (colors.css)

Добавить в `src/styles/colors.css` токены цветов ролей (значения — из мокапа):

```css
/* Цвета чипов ролей (People и далее) */
--role-master-bg: var(--teal-800);   --role-master-text: #ffffff;
--role-admin-bg: #e3e8fd;            --role-admin-text: #3d4ec7;
--role-manager-bg: #efe4fb;          --role-manager-text: #7b3fc4;
--role-site-bg: #fdeed8;             --role-site-text: #a05e1a;
--role-inspector-bg: #ddf0fb;        --role-inspector-text: #1a6f9e;
--role-user-bg: var(--color-accent-tint); --role-user-text: var(--color-text-on-tint);
--role-fitter-bg: #fbe4ee;           --role-fitter-text: #b03a6e;
```

В компонентах — только токены, никаких хексов.

## Данные

- `GET /api/users/` — список (с `?companyid=` когда выбран фильтр).
  Пагинацию UI пока НЕ делаем: грузим с limit=200, в подвале таблицы —
  «N users». Ключ роли пользователя — через существующий
  `activeRole(privileges)`; `locked` — из privileges.
- `GET /api/roles/` — один раз, для человеческих имён ролей
  (key → name: `user` → «Welder» и т.д.). Никаких словарей имён на фронте.
- `GET /api/companies/` — для селекта фильтра. ТОЛЬКО если activeRole ===
  'master'; для admin/manager/site фильтр не показываем (бэк сам отдаёт
  только их компанию).
- Загрузка — тем же паттерном, что useMasterDashboard (посмотри и повтори).

## UI (переиспользуем ui/, новое — по мокапу)

Новые общие компоненты в `components/ui/`:

- `Switch` — toggle из мокапа (вкл = мятный, выкл = серый), с aria-label,
  состоянием disabled и переходом только при отсутствии
  prefers-reduced-motion.
- `StatusBadge` — точка + текст: variant active (зелёная точка,
  --color-status-completed), pending (полое кольцо), locked (красная точка
  и красный текст). Размеры/вид — из мокапа.
- `SegmentedTabs` — пилюльные табы с счётчиками (как в мокапе).

Новые master-компоненты в `components/master/`:

- `RoleChip` — чип роли: принимает role key + display name, красится
  токенами --role-{key}-*. Строится на ui/Chip, если его API позволяет
  задавать цвета; иначе самостоятельный компонент (доложи, что выбрал).
- `UsersTable` — на базе ui/DataTable: колонки User (имя + un серым,
  имя — ссылка), Company, Role (RoleChip), Status (StatusBadge),
  Created (formatShortDate, скрыта <900px), Access (Switch,
  выровнен вправо).

## Страница

`pages/master/UsersPage` (существующая заглушка):

- Шапка: eyebrow «People», заголовок «Users», справа кнопка «+ Add user» —
  ведёт на роут создания, которого ещё нет: создай МИНИМАЛЬНУЮ заглушку
  страницы New user («In development») и роут к ней, чтобы кнопка жила.
- Тулбар: SegmentedTabs (All / Pending first login / Locked — с числами;
  фильтрация клиентская по загруженному списку) + селект компаний
  (только master; смена → перезапрос с ?companyid=).
- Таблица UsersTable. Клик по имени → страница пользователя: создай
  минимальную заглушку-роут (например /people/users/:username,
  «In development») — наполнение будет следующей задачей.
- Toggle Access: сразу зовёт `POST /api/user/lock/` (без confirm), после
  успеха — обновить данные. Для master-пользователя Switch disabled
  (API запрещает лочить master). Ошибка запроса → короткий текст ошибки,
  состояние не менять.
- Состояния: загрузка / ошибка + Retry / пусто («No users yet») — как на
  дашборде.
- Раскладка и брейкпоинты — из мокапа (<900px скрыть Created).

## i18n

Все строки — ключи `people.users.*` в en.json. Имена ролей — С БЭКА
(roles.name), не из i18n.

## Границы — НЕ трогать

Бэкенд; дашборд и его компоненты (кроме переиспользования); navConfig
(кроме добавления новых под-роутов, если они там описываются); auth;
FirstLoginGate.

## Проверки

`tsc` / `npm run build`. Отчёт по формату CLAUDE.md + testing guide:

- войти под keimo → People → Users: таблица со всеми пользователями,
  фильтр компаний виден;
- подсветка SideNav: на /people/users активен пункт Users (и остаётся
  на нём при переходе на страницу-заглушку пользователя);
- табы: числа сходятся с содержимым, переключение фильтрует;
- toggle у обычного пользователя: выключить → статус Locked, точка красная;
  включить обратно; toggle у keimo — disabled;
- фильтр по компании: список сжимается, табы пересчитываются;
- <900px: колонка Created пропала; <600px: TabBar внизу;
- «+ Add user» и клик по имени ведут на заглушки «In development»
  (не 404).
