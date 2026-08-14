/**
 * Пути роутов, на которые ссылаются сразу несколько слоёв приложения.
 *
 * Обычные пути остаются строками прямо в `AppRoutes` — здесь только те, что
 * нужны одновременно роутеру и коду вне него (ссылки в интерфейсе, редиректы).
 * Один источник правды избавляет от опечаток вида `/legal/privacy-policy`.
 */

// Тексты Privacy Policy и Terms: публичные страницы. Ссылки на них даёт и
// футер лендинга, и экран согласий при первом входе.
export const LEGAL_PATHS = {
  privacy: '/legal/privacy',
  terms: '/legal/terms',
} as const

// Восстановление доступа по коду от администратора. Страница публичная: на
// неё ведёт ссылка «Forgot password?» со страницы входа, сессии там ещё нет.
export const AUTH_PATHS = {
  forgotPassword: '/forgot-password',
} as const

// Шаги первого входа. Ключи совпадают с FirstLoginStep (utils/firstLogin.ts),
// поэтому путь шага берётся как FIRST_LOGIN_PATHS[step] — без ветвлений.
export const FIRST_LOGIN_PATHS = {
  password: '/first-login/password',
  consents: '/first-login/consents',
} as const

// Раздел Content. Форма урока и ссылки на неё из таблицы нужны одновременно
// роутеру и коду страниц, поэтому пути живут здесь.
export const CONTENT_PATHS = {
  categories: '/content/categories',
  lessons: '/content/lessons',
  newLesson: '/content/lessons/new',
  // Шаблон с параметром — только для роутера; ссылку строит lessonPath().
  lessonPattern: '/content/lessons/:lessonId',
} as const

/** Ссылка на страницу конкретного урока. */
export function lessonPath(id: number): string {
  return `${CONTENT_PATHS.lessons}/${id}`
}

// Раздел People. Страница пользователя и форма создания нужны одновременно
// роутеру и ссылкам в списке пользователей, поэтому пути живут здесь.
export const PEOPLE_PATHS = {
  users: '/people/users',
  newUser: '/people/users/new',
  // Шаблон с параметром — только для роутера; ссылку строит userPath().
  userPattern: '/people/users/:username',
  companies: '/people/companies',
  newCompany: '/people/companies/new',
} as const

/** Ссылка на страницу конкретного пользователя. */
export function userPath(un: string): string {
  return `${PEOPLE_PATHS.users}/${encodeURIComponent(un)}`
}
