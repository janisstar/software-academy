import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
// TODO(assets): по макету сцена лежит в `assets/landing/hero-scene.png`.
// Сейчас файл в `assets/` — при переносе поправить путь.
import heroScene from '../../assets/hero-scene.png'
import styles from './LandingHero.module.css'

/**
 * Главный блок: одна мятная карточка.
 *
 * Порядок в разметке — сначала текст, потом картинка. Так на мобильном
 * сцена сама встаёт ПОД текстом без лишних правил, а на десктопе мы её
 * вырываем из потока (position: absolute) и прижимаем вправо.
 */
export function LandingHero() {
  const { t } = useTranslation()

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.label}>
          <span aria-hidden="true">●</span> {t('landing.hero.label')}
        </p>
        <h1 className={styles.title}>
          {t('landing.hero.title')}{' '}
          <span className={styles.titleAccent}>
            {t('landing.hero.titleAccent')}
          </span>
        </h1>
        <Link className={styles.cta} to="/login">
          {t('landing.hero.cta')}{' '}
          <span aria-hidden="true">{t('common.arrow')}</span>
        </Link>
        <p className={styles.note}>{t('landing.hero.note')}</p>
      </div>
      <img
        className={styles.scene}
        src={heroScene}
        alt={t('landing.hero.sceneAlt')}
      />
    </section>
  )
}
