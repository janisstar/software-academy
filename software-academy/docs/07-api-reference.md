# 07 — Справочник API (для фронтенда)

Карта всех эндпоинтов MVP. Полная интерактивная версия — Swagger на `/docs`.
Базовый префикс — `/api/`, пути со слешем на конце (кроме путей с `{параметром}`).

## Авторизация в двух словах

- Вход: `POST /api/login/` с телом `{ "un": "...", "pw": "..." }`.
- В ответ сервер ставит **httpOnly-cookie** с сессией. Фронт **ничего не хранит
  вручную** — браузер сам шлёт cookie. В `fetch`/`axios` нужен режим с cookie:
  `fetch(url, { credentials: "include" })` (для axios — `withCredentials: true`).
- CORS: разреши адрес фронтенда в `CORS_ORIGINS` (по умолчанию `http://localhost:5173`).
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
| PATCH | `/api/category/` | master | обновить |
| DELETE | `/api/category/?id=` | master | удалить (только пустую) |
| GET | `/api/categories/` | сессия | дерево (отфильтровано по роли) |

**Lessons**
| POST | `/api/lesson/` | master | создать (`roles`/`is_public`) |
| PATCH | `/api/lesson/` | master | обновить (в т.ч. видимость) |
| DELETE | `/api/lesson/?id=` | master | удалить |
| GET | `/api/lessons/?category_id=` | сессия | каталог карточек (по роли) |
| GET | `/api/lesson/{lesson_id}` | сессия | полный урок (если виден) |

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
