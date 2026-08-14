# Задача: master-список уроков + parent_id в PATCH категории + счётчики в дереве

## Контекст

Продолжение подготовки API для master-раздела Content
(после task-content-order-move — move-эндпоинты уже сделаны и приняты).
Аудит показал три недостающие вещи для интерфейса:

- в `LessonCardOut` нет `is_public` / `roles` / `vimeo_id` / `created_at` —
  таблицу управления уроками не построить;
- `PATCH /api/category/` не принимает `parent_id` — подкатегорию нельзя
  перенести к другому родителю;
- в `CategoryOut` нет счётчиков — дерево не покажет «(5 уроков)» и не
  сможет заранее погасить кнопку Delete.

Три независимые части. Миграций НЕ будет ни в одной (только чтение
существующих полей; `created_at` у уроков в БД уже есть).

---

## Часть 1. `GET /api/master/lessons/`

Админский список всех уроков для таблицы управления. Учебный
`GET /api/lessons/` НЕ трогаем — он остаётся лёгким каталогом учеников.

- **Доступ:** только master, существующий `Depends(require_master)`,
  остальным 403 `{"detail": "Master only"}` — как у master/dashboard.
- **Роут:** в существующий `api/v1/master.py`, тег `master`.
- **Без параметров** (ни фильтров, ни пагинации — фильтрация будет
  клиентской, как в Users; контента мало).
- **Ответ:** `list[MasterLessonOut]`, новая схема в `schemas/`
  (рядом с master_dashboard или в lesson.py — где чище по соседству):

```
id: int
title: str
slug: str
category_id: int
vimeo_id: str
duration_seconds: int
is_public: bool
roles: list[str]        # ключи, как в LessonOut
order: int
created_at: datetime
```

(`description`, `transcript`, `thumbnail_url` в списке НЕ нужны —
для формы редактирования есть `GET /api/lesson/{id}`.)

- **Сортировка:** join с categories, порядок
  `Category.order, Category.id, Lesson.order, Lesson.id` — уроки идут
  сгруппированно по категориям в их порядке, внутри категории по order.
  Имена категорий фронт возьмёт из `GET /api/categories/` сам —
  дублировать `category_name` в ответе не надо.
- **Без N+1:** roles подгрузить одним запросом
  (selectinload/joinedload по образцу существующего lesson_service).

## Часть 2. `parent_id` в `PATCH /api/category/`

Добавить возможность перенести подкатегорию к другому родителю или
на верхний уровень.

**Ловушка PATCH-null (важно!):** `parent_id: int | None = None` не
различает «поле не прислали» и «прислали null» (перенос на верхний
уровень). Различать через `"parent_id" in data.model_fields_set`
(Pydantic v2): поле в сете → применяем значение (включая null);
не в сете → не трогаем. В сервис передать это различие явно
(например, отдельным булевым аргументом или передачей всего
`model_fields_set`) — выбери, что чище по соседнему коду.

**Валидации при реальной смене parent_id (по порядку):**

1. Новый parent существует → иначе 422 `"Category not found"`
   (текст как в lesson_service при кривой category_id).
2. Нельзя стать родителем самой себя (`parent_id == id`) →
   400 `"Category cannot be its own parent"`.
3. Новый parent — верхнего уровня (`parent.parent_id IS NULL`) →
   иначе 400 `"Max category depth is 2"` (глубина жёстко 2 уровня,
   как в category_service).
4. У переносимой категории нет своих подкатегорий →
   иначе 400 `"Category with subcategories cannot become a subcategory"`
   (иначе получилась бы глубина 3).

**Order при переносе:** если parent_id реально изменился — назначить
`order = next_order(...)` в НОВОМ ряду (встаёт в конец), через готовый
`services/ordering.py`. Если прислали тот же parent_id — ничего не
делать (как сделано с category_id у урока в прошлой задаче).

## Часть 3. Счётчики в дереве категорий

В `CategoryOut` (и, соответственно, в `CategoryTreeOut`) добавить:

```
lessons_count: int         # уроков непосредственно в категории
subcategories_count: int   # прямых подкатегорий
```

- Оба обязательные, БЕЗ дефолта — как решили с `users_count` у компаний
  (пусть падает на разработке, а не врёт нулём).
- Считать БЕЗ N+1: два агрегирующих запроса с group_by на всё дерево
  (по образцу outerjoin-подхода в company_service), затем раздать
  значения по узлам в памяти.
- `lessons_count` — только уроки самой категории, НЕ включая уроки
  подкатегорий (никакой рекурсивной суммы).
- Проверить, что `GET /api/categories/` для НЕпривилегированных ролей
  тоже отдаёт новые поля корректно (их дерево — подмножество, счётчики
  при этом показывают полные числа по категории — это ок, не фильтровать
  счётчики по видимости).

## Чего НЕ делать

- НЕ трогать `GET /api/lessons/`, `LessonCardOut`, `LessonOut`,
  правило видимости, move-эндпоинты.
- НЕ добавлять фильтры/пагинацию/поиск в master-список.
- НЕ добавлять `category_name` в MasterLessonOut.
- НЕ делать миграций (полей в БД не появляется).
- НЕ пересчитывать slug — отложено сознательно.

## Проверки

Статические как обычно (compileall — зависимости бэка живут в Docker).
Напомнить в отчёте про `npm run gen:api` (схемы ответов изменились:
CategoryOut + новая MasterLessonOut).

## Testing guide (напиши свой по этому скелету)

Swagger под keimo, на данных из прошлого теста (категории A/B/C,
подкатегории A1/A2, уроки L1–L3, M):

1. `GET /api/master/lessons/` → все уроки, сгруппированы по категориям
   в порядке категорий, внутри — по order; у каждого есть `is_public`,
   `roles`, `vimeo_id`, `created_at`.
2. Тот же запрос под НЕ-master (тестовый admin) → 403 "Master only".
3. `GET /api/categories/` → у A `lessons_count` = фактическое число
   уроков, `subcategories_count` = 2; у A1/A2 нули.
4. `PATCH /api/category/` `{id: A2, parent_id: <id B>}` → A2 ушла под B,
   `order` у неё = конец ряда B; у A `subcategories_count` стал 1.
5. `PATCH /api/category/` `{id: A2, parent_id: null}` → A2 на верхнем
   уровне, в конце ряда.
6. Ошибки: перенос под саму себя → 400; под подкатегорию → 400
   "Max category depth is 2"; A (с подкатегориями) в подкатегорию →
   400; несуществующий parent → 422.
7. PATCH категории БЕЗ поля parent_id (только name) → parent не тронут.

## Формат отчёта — стандартный по CLAUDE.md

Резюме, файлы, конвенции, вывод статических проверок, testing guide,
одно предложение follow-up.
