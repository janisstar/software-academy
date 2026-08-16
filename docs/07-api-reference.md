# 07 — Справочник API (для фронтенда)

Карта всех эндпоинтов MVP. Полная интерактивная версия — Swagger на `/docs`.
Базовый префикс — `/api/`, пути со слешем на конце (кроме путей с `{параметром}`).

## Авторизация в двух словах

- Вход: `POST /api/login/` с телом `{ "un": "...", "pw": "..." }`.
- В ответ сервер ставит **httpOnly-cookie** с сессией. Фронт **ничего не хранит
  вручную** — браузер сам шлёт cookie. В `fetch`/`axios` нужен режим с cookie:
  `fetch(url, { credentials: "include" })` (для axios — `withCredentials: true`).
- CORS: в **локальной разработке не нужен** — dev-сервер Vite проксирует `/api`
  на бэкенд (`frontend/vite.config.ts`), поэтому для браузера запросы
  same-origin и порт фронта не имеет значения. `CORS_ORIGINS` нужен только
  когда фронт ходит на API по абсолютному адресу (прод, стенд, `VITE_API_URL`).
- Выход: `POST /api/logout/`.
- «Кто я»: `GET /api/me/` → пользователь + `pending_consents` + `must_change_password`.

## Что фронт должен проверить сразу после логина

1. `must_change_password === true` → вести на экран смены пароля.
2. `pending_consents` не пуст → показать Privacy/Terms и вызвать
   `accept_*`, пока список не опустеет.
Только потом пускать в приложение.

## Роль и права

У пользователя одна роль; в ответах — объект `privileges` (ключ роли = 1).
`is_privileged` (master/admin/manager/site) видят раздел Users и весь каталог;
рабочие (inspector/user/fitter) — только назначенные уроки. `master` — вендор
(контент + все компании), singleton.

---

## Эндпоинты по разделам

**Health** — `GET /`, `GET /health`, `GET /health/db` (public).

**Authentication**
| Метод | Путь | Доступ | Назначение |
|---|---|---|---|
| POST | `/api/login/` | public | вход → cookie, `{message,user,company}` |
| POST | `/api/logout/` | сессия | выход |
| GET | `/api/me/` | сессия | текущий пользователь |

**Password management**
| POST | `/api/user/change-password/` | сессия | сменить свой пароль |
| POST | `/api/admin/password-reset/code/` | privileged | выдать код сброса (15 мин) |
| POST | `/api/user/password-reset/confirm/` | public | ввести код + новый пароль |
| GET | `/api/generate/password/` | сессия | сгенерировать пароль |

**Consents (GDPR)**
| POST | `/api/accept_privacy_policy/` | сессия | принять Privacy Policy |
| POST | `/api/accept_terms_and_conditions/` | сессия | принять Terms |

**Users**
| POST | `/api/user/` | privileged | создать (→ `temp_password`) |
| PATCH | `/api/user/` | свой/privileged | обновить (имя/email/логин/роль) |
| DELETE | `/api/user/` | privileged | удалить (GDPR) |
| POST | `/api/user/lock/` | privileged | заблокировать/разблокировать |
| GET | `/api/user/{username}` | свой/privileged | один пользователь |
| GET | `/api/users/` | privileged | список (`?companyid=`,`limit`,`offset`) |

**Companies**
| POST | `/api/company/` | master | создать компанию |
| GET | `/api/companies/` | master | список компаний |
| GET | `/api/user/company/` | сессия | своя компания |

**Categories**
| POST | `/api/category/` | master | создать (parent_id=null → верхний уровень) |
| PATCH | `/api/category/` | master | обновить имя; `parent_id` переносит на другой уровень (null → наверх), поле не прислано = не трогать |
| DELETE | `/api/category/?id=` | master | удалить (только пустую) |
| POST | `/api/category/move/` | master | сдвинуть `{id, direction:"up"\|"down"}` в своём уровне |
| GET | `/api/categories/` | сессия | дерево (отфильтровано по роли) + `lessons_count` / `subcategories_count` в каждом узле |

**Lessons**
| POST | `/api/lesson/` | master | создать (`roles`/`is_public`) |
| PATCH | `/api/lesson/` | master | обновить (в т.ч. видимость) |
| DELETE | `/api/lesson/?id=` | master | удалить |
| POST | `/api/lesson/move/` | master | сдвинуть `{id, direction:"up"\|"down"}` в своей категории |
| GET | `/api/lessons/?category_id=` | сессия | каталог карточек (по роли) со статусом прогресса текущего пользователя (`status`, `watch_percent`); порядок — обход дерева категорий (родитель → его подкатегории), внутри категории — порядок уроков |
| GET | `/api/lesson/{lesson_id}` | сессия | полный урок (если виден) |

**Master** (только роль `master`)
| GET | `/api/master/dashboard/` | master | сводка платформы |
| GET | `/api/master/lessons/` | master | ВСЕ уроки для таблицы управления (с `is_public`, `roles`, `vimeo_id`, `created_at`) |

**Progress** (личный)
| POST | `/api/progress/` | сессия | автосохранение `{lesson_id,watch_percent,last_position_seconds}` |
| GET | `/api/progress/` | сессия | весь мой прогресс |
| GET | `/api/progress/{lesson_id}` | сессия | прогресс по уроку (возобновление) |

**Reports / Dashboard** (личные)
| GET | `/api/reports/` | сессия | сводка + уроки со статусами |
| GET | `/api/dashboard/` | сессия | сводка + continue/recommended/recently + `is_new_user` |

**Roles** — `GET /api/roles/` — список ролей (для форм создания пользователя).

---

## Настройки (Settings) — на клиенте

Язык (i18n), тема, скорость плеера, субтитры — хранятся на **клиенте**
(localStorage), серверных эндпоинтов для них нет. «Профиль» в Settings — это
`GET /api/me/` + `PATCH /api/user/` (имя/email) + `POST /api/user/change-password/`.

## Ошибки

Единый формат: `{"detail": ...}`. Валидация тела — `422` c массивом в `detail`;
бизнес-ошибки — `400/403/404/409` со строкой в `detail`; непредвиденные — `500`
c `{"detail": "Internal server error"}`.
