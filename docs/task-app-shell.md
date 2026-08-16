# Задача: каркас учебной области `app` (layout + маршрутизация + заглушки)

Мокап: `docs/mockups/app-shell-dashboard-mockup.html` (экраны 1, 3, 4 —
смотреть ТОЛЬКО шапку, табы и блок пользователя; контент dashboard в этой
задаче НЕ делаем, будет отдельная задача).

## СТОП-проверка перед началом

1. Бэкенд поднят, `npm run gen:api` выполнен, `src/api/schema.d.ts`
   закоммичен и свежий. Если есть расхождения — ОСТАНОВИСЬ и сообщи.
2. Прочитай `frontend/CLAUDE.md` и этот файл целиком до первого изменения.

## Контекст

Учебная область `app` — интерфейс для всех ролей, кроме master
(admin/manager/site/inspector/user/fitter). Решения зафиксированы
(НЕ переобсуждать):

- Interface-область: `pages/app`, `components/app`. Никаких ролевых папок.
- Навигация: desktop — ВЕРХНЯЯ шапка с горизонтальными ссылками
  (НЕ боковая панель, это новый layout, не копия MasterLayout);
  mobile (<600px) — нижние табы (паттерн как TabBar у master).
- Пункты: Dashboard / Lessons / Reports / Settings; у privileged
  (admin/manager/site) дополнительно People.
- Пути короткие, без префикса: `/dashboard`, `/lessons`, `/reports`,
  `/settings`.
- Mobile-first: учебные экраны оптимизируются под телефон.

## Что сделать

### 1. Роуты и константы

- В `constants/routes.ts` добавить `APP_PATHS` = dashboard `/dashboard`,
  lessons `/lessons`, reports `/reports`, settings `/settings`
  (по образцу существующих CONTENT_PATHS / AUTH_PATHS).
- В `AppRoutes` добавить 4 роута под `ProtectedRoute` + `FirstLoginGate`
  (как master-роуты), внутри нового `AppLayout`.

### 2. Маршрутизация по роли после логина

- Сейчас после логина все попадают в master-интерфейс. Изменить:
  `master` → как сейчас; ВСЕ остальные роли → `/dashboard`.
- Использовать существующий `activeRole(privileges)` из types/api.ts.
  Никакой новой логики ролей на фронте.
- Защита в обе стороны: не-master на master-путях → redirect `/dashboard`;
  master на app-путях → redirect в свой интерфейс (master уроки не смотрит).
  Сначала посмотри, как сейчас гейтится master-область, и сделай
  симметрично, минимальным способом.
- ВАЖНО: пути `/people/*` доступны и privileged-ролям (как сейчас) —
  их не ломать. Пункт People в app-навигации ведёт на существующий
  `/people/users`.

### 3. Layout: `components/app/`

- `AppLayout` — обёртка страниц области.
- `AppHeader` (desktop): высота 64px, фон surface, нижний бордер ink-100;
  слева Brand (переиспользуй `ui/Brand`), затем горизонтальные ссылки,
  справа блок пользователя. Активная ссылка: цвет accent +
  подчёркивание 2px снизу (см. мокап). Контент по --layout-max-width.
- `AppTabBar` (mobile <600px): нижние табы с иконками, по паттерну
  master TabBar (активность вложенных путей — как isEntryActive).
- `appNavConfig.ts` — конфиг пунктов (ключ i18n, путь, видимость),
  по образцу master navConfig. People — только privileged, через
  activeRole; master-логики в конфиге нет.
- Блок пользователя: Avatar (инициалы) + имя + «Роль · Компания»
  (имя роли — с бэка, как в People; НЕ словарь на фронте) + Log out.
  Посмотри `UserIdentity` у master: если переиспользуется/адаптируется —
  переиспользуй, если нет — сделай app-вариант, объясни выбор в отчёте.

### 4. Страницы-заглушки: `pages/app/`

- `AppDashboardPage`, `AppLessonsPage`, `AppReportsPage`,
  `AppSettingsPage` — заголовок + «In development» (тот же паттерн,
  что был у master-заглушек). Никаких запросов к API в этой задаче.

### 5. i18n

- Все строки — ключи в en-файле переводов (блок `app.nav.*`,
  `app.stub.*` или по сложившейся структуре файла).

## Дизайн

- Только токены из styles/ — ни одного hex в компонентах.
- Рабочая область: кнопки/чипы --radius-xs, никаких пилюль.
- CSS Modules по компонентам, как принято.

## НЕ трогать

- MasterLayout, SideNav, master-страницы и master-роуты (кроме
  минимальной правки redirect-логики по п.2).
- Логику логина, useAuth, FirstLoginGate (гейт первого входа работает
  ДО выбора интерфейса и не меняется).
- Учебные API (/api/dashboard/ и т.д.) — в этой задаче НЕ вызываются.

## Проверки

- Только статические: `tsc` / `npm run build`. Приложение не запускать.

## Отчёт

По формату из CLAUDE.md + testing guide для Jenna:

1. Войти как обычный пользователь (не master) → должен попасть на
   `/dashboard`, видеть шапку с 4 пунктами, заглушку.
2. Пройтись по Lessons / Reports / Settings — заглушки, активный пункт
   подсвечен.
3. Сузить окно <600px → шапка сжимается, снизу табы, активный таб
   подсвечен.
4. Войти как admin → в навигации 5 пунктов (+People), People ведёт
   на существующий список пользователей.
5. Войти как keimo (master) → как раньше, в master-интерфейс; руками
   открыть `/dashboard` → redirect в master-интерфейс.
6. Не-master руками открыть `/content/lessons` → redirect на `/dashboard`.
7. Новый пользователь с временным паролем → гейт первого входа
   работает как раньше, после — `/dashboard`.
