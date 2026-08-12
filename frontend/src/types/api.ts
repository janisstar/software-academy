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

export type LessonCard = Schemas['LessonCardOut']
export type LessonOut = Schemas['LessonOut']
export type LessonWithStatus = Schemas['LessonWithStatus']

// --- Прогресс и отчёты ------------------------------------------------------

export type ProgressOut = Schemas['ProgressOut']
export type ProgressSummary = Schemas['ProgressSummary']
export type Reports = Schemas['ReportsOut']
export type Dashboard = Schemas['DashboardOut']

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
