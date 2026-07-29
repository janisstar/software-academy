import 'i18next'
import type common from '../i18n/en/common.json'

/**
 * Английский словарь = источник правды для типов ключей.
 * Благодаря этому `t('login.submit')` автодополняется, а опечатка
 * вроде `t('login.submitt')` падает на `npm run build`, а не в браузере.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
    }
  }
}
