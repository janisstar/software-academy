import type { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
// Фон тёмный, поэтому здесь «тёмный» вариант знака — он светло-мятный.
import logoMark from '../../assets/logo-mark-dark.png'
import styles from './AuthShell.module.css'

/**
 * Тёмная оболочка экранов первого входа: шапка со знаком и карточка шага
 * по центру (макет docs/mockups/auth-flow-mockup.html, `.auth-shell`).
 *
 * Знак здесь НЕ ссылка, в отличие от страницы входа: первый вход нельзя
 * пропустить, и уход на лендинг всё равно вернул бы человека на этот же шаг.
 */
export function AuthShell({ children }: PropsWithChildren) {
  const { t } = useTranslation()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        {/* alt="" — знак декоративный, название написано текстом рядом. */}
        <img className={styles.logo} src={logoMark} alt="" aria-hidden="true" />
        <span className={styles.brandName}>{t('brand.name')}</span>
      </header>

      <div className={styles.center}>{children}</div>
    </div>
  )
}
