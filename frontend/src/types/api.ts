// Дружелюбные псевдонимы поверх СГЕНЕРИРОВАННЫХ схем OpenAPI.
//
// Единый источник правды по формам API — файл `src/api/schema.d.ts`, который
// генерируется командой `npm run gen:api` из бэкенда и НИКОГДА не правится
// руками. Здесь мы лишь даём этим схемам короткие удобные имена, чтобы
// компоненты импортировали типы отсюда, а не лезли в `schema.d.ts` напрямую.
//
// После любого изменения схемы бэка: `npm run gen:api` — и имена ниже
// автоматически подхватят новую форму (либо TypeScript подсветит расхождение).

import type { components } from '../api/schema'

type Schemas = components['schemas']

// --- Ошибки -----------------------------------------------------------------

// Тело ошибки после разбора в client.ts (см. parseApiErrorDetail):
// FastAPI отдаёт { detail: ... }, но клиент всегда сводит его к строке.
export type ApiErrorDetail = string

// --- Пользователь, вход, компания -------------------------------------------

export type UserOut = Schemas['UserOut']
export type CompanyOut = Schemas['CompanyOut']
export type RoleOut = Schemas['RoleOut']

// Ответ POST /api/login/ — { message, user, company }.
export type LoginResponse = Schemas['LoginOut']

// Тело запроса POST /api/login/ — { un, pw }.
export type LoginPayload = Schemas['LoginIn']

// GET /api/me/ отдаёт того же пользователя, что и вход.
export type MeResponse = UserOut

// Тело запроса POST /api/user/lock/ — { un, locked }.
export type UserLockPayload = Schemas['UserLockIn']

// Тело запроса POST /api/company/ — { name, businessid?, email? }.
export type CompanyCreatePayload = Schemas['CompanyCreateIn']

// Тело запроса POST /api/user/ — { un, name, role, email?, companyid? }.
// companyid обязателен только для master: остальные заводят людей у себя.
export type UserCreatePayload = Schemas['UserCreateIn']

// Ответ POST /api/user/ — { user, temp_password }.
// Временный пароль приходит ОДИН раз и больше нигде не хранится.
export type UserCreated = Schemas['UserCreateOut']

// Тело запроса PATCH /api/user/ — { un, name?, email?, new_un?, role? }.
// `un` говорит, КОГО меняем; остальные поля — только то, что меняется.
export type UserUpdatePayload = Schemas['UserUpdateIn']

// Тело запроса DELETE /api/user/ — { un }.
export type UserDeletePayload = Schemas['UserDeleteIn']

// Ответ POST /api/admin/password-reset/code/ — { un, code, expires_minutes }.
export type ResetCode = Schemas['ResetCodeOut']

// Тело запроса POST /api/user/password-reset/confirm/ — { un, code, new_pw }.
// Эндпоинт публичный: человек забыл пароль и сессии у него нет.
export type ResetConfirmPayload = Schemas['ResetConfirmIn']

// Тело запроса POST /api/user/change-password/ — { old_pw, new_pw }.
// Минимальную длину нового пароля схема не описывает: её проверяет бэкенд
// (backend/app/schemas/password.py, MIN_PASSWORD_LENGTH).
export type ChangePasswordPayload = Schemas['ChangePasswordIn']

// --- Согласия (GDPR) --------------------------------------------------------

// Ответ POST /api/accept_privacy_policy/ и /api/accept_terms_and_conditions/.
// Написан руками: у бэкенда это обычный dict, и codegen выводит его как
// `{ [key: string]: unknown }` — по такому типу ничего не прочитать.
// `document` — ключ документа из backend/app/services/consent_service.py
// (`privacy_policy` / `terms_and_conditions`), те же значения, что приходят
// в `pending_consents`.
export type ConsentAccepted = {
  status: string
  document: string
}

// --- Контент: категории и уроки ---------------------------------------------

export type CategoryOut = Schemas['CategoryOut']
export type CategoryTree = Schemas['CategoryTreeOut']

// Тело запроса POST /api/category/ — { name, parent_id? }.
// `order` не передаётся: новая категория встаёт в конец своего уровня.
export type CategoryCreatePayload = Schemas['CategoryCreateIn']

// Тело запроса PATCH /api/category/ — { id, name?, parent_id? }.
// У `parent_id` значение null осмысленно («поднять на верхний уровень»),
// поэтому «не трогать родителя» = НЕ класть это поле в тело совсем.
export type CategoryUpdatePayload = Schemas['CategoryUpdateIn']

// Тело запроса POST /api/category/move/ — { id, direction }.
export type CategoryMovePayload = Schemas['CategoryMoveIn']

// Направление сдвига ("up" | "down") — берём из схемы, чтобы не дублировать
// литералы руками. Одно на всё: у категорий и у уроков сдвиг одинаковый.
export type MoveDirection = CategoryMovePayload['direction']

export type LessonOut = Schemas['LessonOut']

// Карточка урока со статусом МОЕГО прогресса (`status`, `watch_percent`).
// Её отдают учебный каталог GET /api/lessons/, Dashboard и Reports.
export type LessonWithStatus = Schemas['LessonWithStatus']

// Строка таблицы управления уроками (GET /api/master/lessons/). От карточки
// каталога отличается тем, что показывает видимость, Vimeo ID и дату создания,
// но не содержит длинных текстов — их master берёт из GET /api/lesson/{id}.
export type MasterLesson = Schemas['MasterLessonOut']

// Тело запроса POST /api/lesson/move/ — { id, direction }.
export type LessonMovePayload = Schemas['LessonMoveIn']

// Тело запроса POST /api/lesson/ — создать урок.
// `order` не передаётся: урок встаёт в конец своей категории.
export type LessonCreatePayload = Schemas['LessonCreateIn']

// Тело запроса PATCH /api/lesson/ — { id } плюс поля, которые меняем.
// Отдельного псевдонима `Lesson` нет: полный урок — это уже `LessonOut` выше.
export type LessonUpdatePayload = Schemas['LessonUpdateIn']

// --- Прогресс и отчёты ------------------------------------------------------

export type ProgressOut = Schemas['ProgressOut']
export type ProgressSummary = Schemas['ProgressSummary']
export type Reports = Schemas['ReportsOut']
export type Dashboard = Schemas['DashboardOut']

// --- Master-дашборд ---------------------------------------------------------

// Ответ GET /api/master/dashboard/ — сводка «здоровья платформы» для master.
// Личного прогресса тут нет: он строго персональный (docs/06).
export type MasterDashboard = Schemas['MasterDashboardOut']

// Строки списков внутри дашборда — вынесены отдельно, чтобы компоненты
// (PopularLessons, RecentUsers, RecentCompanies) типизировали свои props.
export type MasterTopLesson = Schemas['TopLesson']
export type MasterRecentUser = Schemas['RecentUser']
export type MasterRecentCompany = Schemas['RecentCompany']

// --- Роли и права (privileges) ----------------------------------------------

// Ключи ролей платформы. Один пользователь — одна роль (см. docs/06).
export type RoleKey =
  | 'master'
  | 'admin'
  | 'manager'
  | 'site'
  | 'inspector'
  | 'user'
  | 'fitter'

// Объект privileges из ответа API: ключ активной роли = 1, остальные = 0;
// плюс служебный ключ `locked` = 1, если пользователь заблокирован (docs/06 §5).
export type Privileges = UserOut['privileges']

// Любой ключ, который может встретиться в объекте privileges (роли + locked).
export type PrivilegeKey = RoleKey | 'locked'

// Сохранено для обратной совместимости: форма объекта privileges.
export type PrivilegesMap = Privileges

// Порядок перебора: master имеет приоритет как самая старшая роль.
const ROLE_KEYS: RoleKey[] = [
  'master',
  'admin',
  'manager',
  'site',
  'inspector',
  'user',
  'fitter',
]

/**
 * Возвращает активную роль пользователя — ту, у которой значение в privileges
 * равно 1. Если активной роли нет (теоретически невозможно для валидного
 * пользователя), возвращает null.
 */
export function activeRole(privileges: Privileges): RoleKey | null {
  for (const key of ROLE_KEYS) {
    if (privileges[key] === 1) {
      return key
    }
  }
  return null
}

/**
 * Роли, которым доступен раздел People (docs/06 §2): master ведёт всю
 * платформу, admin / manager / site — людей своей компании.
 */
const PEOPLE_ROLES: RoleKey[] = ['master', 'admin', 'manager', 'site']

/**
 * Может ли роль управлять людьми. Рабочим ролям (inspector / user / fitter)
 * раздел People закрыт — и на бэкенде, и в маршрутах.
 */
export function canManagePeople(role: RoleKey | null): boolean {
  return role !== null && PEOPLE_ROLES.includes(role)
}

/**
 * Строка с бэкенда → ключ роли, если такая роль у нас известна.
 *
 * Нужна там, где роли приходят просто списком строк (например `roles` у урока):
 * приводить их к `RoleKey` кастом нельзя — незнакомый ключ тогда молча
 * притворился бы известным.
 */
export function toRoleKey(value: string): RoleKey | null {
  return ROLE_KEYS.includes(value as RoleKey) ? (value as RoleKey) : null
}

/**
 * Заблокирован ли пользователь. Блокировка живёт не отдельным полем, а
 * служебным ключом `locked` внутри privileges (docs/06 §5).
 */
export function isLocked(privileges: Privileges): boolean {
  return privileges.locked === 1
}
