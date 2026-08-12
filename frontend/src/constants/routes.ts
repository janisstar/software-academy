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

// Шаги первого входа. Ключи совпадают с FirstLoginStep (utils/firstLogin.ts),
// поэтому путь шага берётся как FIRST_LOGIN_PATHS[step] — без ветвлений.
export const FIRST_LOGIN_PATHS = {
  password: '/first-login/password',
  consents: '/first-login/consents',
} as const
