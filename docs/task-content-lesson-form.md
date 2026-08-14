# Задача: страница Content / Lessons — форма урока (часть 2 из 2)

## Контекст

Замена заглушки `LessonFormPage` на настоящую форму создания и
редактирования урока. Мокап УТВЕРЖДЁН:
`docs/mockups/content-lessons-mockup-v2.html`, экраны 3 (New lesson)
и 4 (Edit lesson). Таблица (часть 1) готова и принята.

Эндпоинты:

- `GET /api/lesson/{lesson_id}` → LessonOut (title, slug, description,
  duration_seconds, vimeo_id, thumbnail_url, transcript, category_id,
  is_public, order, roles: ключи)
- `POST /api/lesson/` → создать; поле order НЕ передаётся (бэк ставит
  в конец категории)
- `PATCH /api/lesson/` → обновить
- `DELETE /api/lesson/?id=` → удалить
- Категории — существующий `useCategoriesTree`; роли — `useDirectories`.

## Доступ

Только master — гейт по `activeRole`, как на соседних страницах.

## Структура

- Наполнить существующий `LessonFormPage` (mode: new | edit уже есть).
  Если файл разрастается — форму вынести в
  `components/master/LessonForm.tsx` + module.css (решение за тобой,
  отметить в отчёте).
- Хук `useLesson(id)` для edit-режима — паттерн «номер попытки»,
  ошибка → состояние страницы с Retry.
- Типы: псевдонимы `LessonCreatePayload`, `LessonUpdatePayload`,
  `Lesson` (LessonOut) в types/api.ts из codegen. Если чего-то нет
  в schema.d.ts — СТОП, сообщить (не перегенерировать молча).
- i18n: `content.lessons.form.*`, тексты из мокапа.

## Поля формы (карточка Lesson, по мокапу)

- **Title** — text, обязательное.
- **Category** — Select: все категории дерева, подкатегории как
  «Родитель / Подкатегория». Обязательное. В edit-режиме под селектом
  хинт из мокапа («Changing the category moves the lesson to the end
  of the new one») — показывать ВСЕГДА в edit, логика на бэке.
- **Description** — textarea, необязательное.
- **Duration** — два числовых инпута min / sec (по мокапу).
  В payload — `duration_seconds = min * 60 + sec`. Валидация:
  целые ≥ 0, sec ≤ 59. Из LessonOut обратно: min = floor(s/60),
  sec = s % 60. Это конвертация представления, не бизнес-логика.
- **Vimeo ID** — text, обязательное, только цифры (inputmode=numeric,
  проверка на непустую строку из цифр). Хинт из мокапа
  (vimeo.com/**912481203**).
- **Transcript** — textarea, необязательное.
- **thumbnail_url в форме НЕТ** — решение Jenna (поле живёт в БД
  на будущее). В payload его не отправлять вовсе.

## Видимость (карточка Visibility, по мокапу)

- Чекбокс **Public** отдельным блоком.
- Ниже блок ролей: чекбоксы ТОЛЬКО непривилегированных ролей
  (`useDirectories` → фильтр `is_privileged === false`), имена с бэка.
- Public включён → чекбоксы ролей disabled + приглушены (класс
  dimmed из мокапа), подпись меняется на «Public is on — role
  checkboxes are ignored while it's enabled». Состояния чекбоксов
  при этом НЕ сбрасывать — выключил Public, галки вернулись.
- Подпись по умолчанию — из мокапа («Admins, managers and site
  supervisors always see every lesson…»).
- В payload: `is_public` + `roles` = отмеченные ключи. Если Public
  включён, roles всё равно отправляются как есть (бэк их хранит,
  видимость решает is_public) — ничего не обнулять втихую.

## Предпросмотр (правая липкая карточка)

- Vimeo ID валиден (непустые цифры) → живой iframe:
  `https://player.vimeo.com/video/{id}`, `allow="fullscreen"`,
  title для доступности, aspect-ratio 16/9 как в мокапе.
- ID пуст/невалиден → тёмная заглушка из мокапа («Preview appears
  when Vimeo ID is entered»).
- Обновлять iframe с **дебаунсом ~600 мс** после остановки ввода —
  иначе плеер перезагружается на каждый символ. Дебаунс только
  для предпросмотра, в payload значение поля идёт как есть.
- Подпись под превью из мокапа («Wrong video showing?..»).

## Отправка и переходы

- **New**: Create lesson → `POST` → навигация на /content/lessons
  (урок виден в конце своей категории). Cancel → туда же без запроса.
- **Edit**: Save changes → `PATCH` с ПОЛНЫМ payload (id + все поля
  формы, включая неизменённые). Причина: PATCH-семантика бэка
  «None = не менять» не позволяет очистить поле; полный payload
  с пустой строкой для очищенных description/transcript — принятое
  решение (пустая строка вместо NULL, зафиксировано ранее).
  После сохранения → навигация на /content/lessons.
- Кнопки Create/Save disabled, пока форма невалидна (обязательные
  поля) и пока запрос летит.
- Ошибка мутации → текст бэка (utils/apiError) красным капшеном
  над кнопками действий, форма не очищается.
- Ошибка загрузки урока (edit) → состояние страницы с Retry.

## Edit-режим: шапка

- h1 = title урока; caption = «Категория · m:ss» (имя категории из
  дерева, длительность форматтером из части 1).
- ⚠️ Отклонение от мокапа: «created 13 Aug 2026» в caption НЕ делать —
  в LessonOut нет created_at (есть только в master-списке). Не тянуть
  его из списка и не добавлять на бэк — просто короче caption.
  Jenna в курсе.

## Danger zone (только edit, по мокапу)

- Карточка с рамкой danger, текст предупреждения из мокапа
  (удаляется урок И прогресс учеников, необратимо).
- Delete lesson → confirm-модалка (существующий Modal, по образцу
  удаления пользователя) → `DELETE /api/lesson/?id=` → навигация
  на /content/lessons.

## Чего НЕ делать

- НЕ трогать таблицу (часть 1), бэкенд, учебный каталог.
- НЕ добавлять thumbnail_url, slug, order в форму.
- НЕ сбрасывать чекбоксы ролей при включении Public.
- НЕ делать автосохранение/черновики.

## Проверки

`npm run lint`, `npm run build`. Приложение не запускать.

## Testing guide (напиши свой по этому скелету)

1. New: заполнить минимум (title, category, vimeo_id) → Create →
   урок в конце своей категории в таблице.
2. Предпросмотр: ввести реальный Vimeo ID → плеер появился после
   паузы ввода; стереть → заглушка.
3. Duration: 4 min 20 sec → в таблице 4:20; sec=75 → валидация.
4. Public: включить → чекбоксы ролей погасли, подпись сменилась;
   выключить → галки вернулись как были.
5. Edit: открыть урок из таблицы → поля заполнены (roles, public,
   duration разложен в min:sec); изменить категорию → урок в конце
   новой; очистить description → сохранить → в форме снова пусто.
6. Ошибка бэка: несуществующая категория/кривой ID (через DevTools
   или Swagger-манипуляции) → красный текст, форма цела.
7. Danger zone: Delete → confirm → урок исчез из таблицы.
8. Не-master: прямой URL /content/lessons/new → заглушка, без запросов.

## Формат отчёта — стандартный по CLAUDE.md
