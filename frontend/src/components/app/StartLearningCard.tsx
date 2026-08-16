import { useTranslation } from 'react-i18next'
import { LinkButton } from '../ui/LinkButton'
import { PlayGlyph } from './AppIcons'
import styles from './StartLearningCard.module.css'

interface StartLearningCardProps {
  /** Куда ведёт кнопка «Browse lessons →» — каталог уроков. */
  to: string
}

/**
 * Приглашение начать учиться — вместо Continue, сводки и Recently у того, кто
 * ещё не открывал ни одного урока (`is_new_user`).
 *
 * Нулевую сводку в этом состоянии не показываем намеренно: «0 %, 0 уроков»
 * ничего не сообщает и выглядит как неудача, ещё до первого шага.
 */
export function StartLearningCard({ to }: StartLearningCardProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.card}>
      <span className={styles.mark}>
        <PlayGlyph size={20} />
      </span>

      <h2 className={styles.title}>{t('app.dashboard.empty.title')}</h2>
      <p className={styles.text}>{t('app.dashboard.empty.text')}</p>

      {/* Ведёт в каталог: страницы урока в приложении ещё нет —
          см. TODO на странице дашборда. */}
      <LinkButton to={to} className={styles.cta}>
        {t('app.dashboard.empty.action')}
        <span aria-hidden="true">{t('common.arrow')}</span>
      </LinkButton>
    </section>
  )
}
