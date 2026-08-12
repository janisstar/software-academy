import type { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
// Фон здесь светлый — тот же вариант знака, что в шапке лендинга и логина.
import logoMark from '../../assets/logo-mark-light.png'
import styles from './LegalLayout.module.css'

interface LegalLayoutProps extends PropsWithChildren {
  /** Название документа: показывается и в топбаре, и заголовком страницы. */
  title: string
  /** Версия, дата вступления в силу и правообладатель — одной строкой. */
  meta: string
}

/**
 * Обвязка страницы юридического текста (макет docs/mockups/auth-flow-mockup.html,
 * экран «5 · Текст условий»): светлый фон, топбар с брендом, узкая колонка.
 *
 * Разделы документа страницы передают через children — заголовки и абзацы
 * стилизует этот модуль, поэтому своего CSS-модуля у страниц нет.
 */
export function LegalLayout({ title, meta, children }: LegalLayoutProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  // key === 'default' означает первую запись в истории вкладки: документ
  // открыли ссылкой с target="_blank" (с экрана согласий), возвращаться некуда.
  const canGoBack = location.key !== 'default'

  function handleBack() {
    if (canGoBack) {
      navigate(-1)
      return
    }

    // Новая вкладка: истории нет, поэтому уводим на лендинг.
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          {/* Кнопка, а не ссылка: цель зависит от истории вкладки, у <a> её
              в href не выразить. Текста нет — смысл кнопки несёт aria-label,
              иначе для скринридера она осталась бы просто «←». */}
          <button
            className={styles.back}
            type="button"
            onClick={handleBack}
            aria-label={t('common.back')}
          >
            <span aria-hidden="true">{t('common.arrowBack')}</span>
          </button>

          <span className={styles.identity}>
            {/* Знак — ссылка на лендинг. */}
            <Link className={styles.brand} to="/">
              {/* alt="" — знак декоративный, название написано текстом рядом. */}
              <img
                className={styles.logo}
                src={logoMark}
                alt=""
                aria-hidden="true"
              />
              <span className={styles.brandName}>{t('brand.name')}</span>
            </Link>
            <span className={styles.docName}>
              <span aria-hidden="true">·</span> {title}
            </span>
          </span>
        </div>
      </div>

      <article className={styles.body}>
        <h1 className={styles.title}>{title}</h1>
        <small className={styles.meta}>{meta}</small>
        {children}
      </article>
    </div>
  )
}
