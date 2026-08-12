# Задача: Master Dashboard (фронтенд)

Реализовать страницу Dashboard master-интерфейса по утверждённому мокапу
`docs/mockups/master-dashboard-mockup.html`. Бэкенд готов:
`GET /api/master/dashboard/` (только master, остальным 403 — уже проверено).

Прочитай `frontend/CLAUDE.md`. Мокап — источник правды по виду; токены в нём
скопированы из `src/styles/` — в коде использовать НАШИ переменные, не хексы.

## Шаг 1 — типы из codegen

1. Бэкенд поднят (`docker compose up -d`) → `npm run gen:api` →
   обновится `src/api/schema.d.ts` (руками не править).
2. В `src/types/api.ts` добавить псевдоним `MasterDashboard`
   (тип ответа `GET /api/master/dashboard/`) — по образцу существующих.

## Шаг 2 — вызов API

`src/api/masterDashboard.ts` — функция `fetchMasterDashboard()` по образцу
существующих вызовов (client.ts, `credentials: "include"`). Загрузка данных
на странице — по образцу существующих страниц/хуков (посмотри, как уже
делается, и повтори тот же паттерн; ничего нового не изобретать).

## Шаг 3 — компоненты

**Общие (`components/ui/`)** — пригодятся в People и Reports:

- `StatCard` — карточка-счётчик: label, value, sub (ReactNode, чтобы можно
  было подсветить «3 locked» опасным цветом), вариант `accent` (тёмная
  teal-800, как Online now в мокапе).
- `DataTable` — простая таблица: колонки (заголовок + рендер ячейки), строки,
  пустое состояние (текст по центру). БЕЗ сортировки/пагинации — не нужно.
- `Chip` — пилюля (как чип роли в мокапе): фон --color-accent-tint,
  текст --color-text-on-tint.

Перед созданием проверь, нет ли уже похожего в ui/ (Card существует —
StatCard и карточки строить НА нём, если это разумно по его API).

**Master-специфичные (`components/master/`)**:

- `DashboardStats` — ряд из четырёх StatCard (Companies, Users, Lessons,
  Online now — последняя accent, с пульсирующей точкой; пульс отключается
  при prefers-reduced-motion, как в мокапе).
- `PopularLessons` — карточка «Popular lessons»: строки название + число +
  полоса-бар. Ширина бара = completions / max(completions) * 100%.
  В шапке карточки справа — «{completions_total} completions total».
  Пусто → текст «No completions yet».
- `RecentUsers`, `RecentCompanies` — карточки с DataTable по мокапу
  (User: имя + un серым; Company; Role чипом. Companies: название + дата).
  Даты форматировать как в мокапе (Aug 10, 2026) — `Intl.DateTimeFormat('en')`.

## Шаг 4 — страница

`pages/master/Dashboard.tsx` (существующая заглушка):

- Шапку-приветствие («SEVENHEAVEN · PLATFORM» / «Good day, Keimo») ОСТАВИТЬ
  как есть. Под ней — каптион «Platform overview».
- Если `activeRole !== 'master'` → оставить текущую заглушку «In development»
  (личный дашборд admin/работников — будущая задача). Платформенные данные
  грузить ТОЛЬКО для master (не ловить 403 постфактум).
- Для master: DashboardStats → ряд PopularLessons + RecentUsers →
  RecentCompanies на всю ширину.
- Состояния: загрузка (простой текст/скелет — как принято в проекте),
  ошибка (текст + кнопка Retry), пустые списки — через DataTable/тексты.
- Раскладка и брейкпоинт 900px — как в мокапе (stats 4→2 колонки,
  row2 2→1). CSS Modules, токены из styles/.

## i18n

Все строки — ключи в `src/i18n/locales/en.json` (раздел вида
`masterDashboard.*`). Никаких захардкоженных строк в компонентах.

## Границы — НЕ трогать

- Бэкенд, роуты, navConfig, MasterLayout/SideNav/TabBar, useAuth,
  FirstLoginGate, другие страницы.
- Логика «онлайн за 10 минут» живёт на бэке — фронт просто показывает число.
- Никакого автообновления/поллинга — данные грузятся один раз при заходе.

## Проверки

Только статические: `tsc` / `npm run build`. Отчёт по формату CLAUDE.md +
testing guide:

- запустить фронт (5173, strictPort) и бэк,
- войти под keimo → /home → ожидание: счётчики совпадают со Swagger-ответом,
- сузить окно <900px → раскладка перестроилась, TabBar на месте,
- войти под НЕ-master → ожидание: старая заглушка «In development», НЕТ
  запроса к /api/master/dashboard/ (проверить во вкладке Network),
- проверить пустую базу-состояние: «No completions yet» (если применимо).
