import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../ui/Card'
import { isVimeoIdValid } from '../../utils/lessons'
import styles from './LessonPreview.module.css'

/**
 * Сколько ждать после последнего нажатия клавиши, прежде чем перезагрузить
 * плеер. Без паузы iframe пересоздавался бы на каждую введённую цифру.
 */
const SETTLE_DELAY_MS = 600

type LessonPreviewProps = {
  /** Значение поля «Vimeo ID» как есть — с пробелами и незаконченным вводом. */
  vimeoId: string
}

/** Ссылка на плеер Vimeo по id видео. */
function playerUrl(id: string): string {
  return `https://player.vimeo.com/video/${id.trim()}`
}

/**
 * Правая карточка с плеером: master сразу видит, то ли это видео.
 *
 * Пауза перед обновлением нужна только предпросмотру — в запрос значение
 * поля уходит как есть, без всякой задержки.
 */
export function LessonPreview({ vimeoId }: LessonPreviewProps) {
  const { t } = useTranslation()
  // Значение, на котором ввод «остановился»: именно оно попадает в плеер.
  const [settledId, setSettledId] = useState(vimeoId)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setSettledId(vimeoId),
      SETTLE_DELAY_MS,
    )

    // Новое нажатие отменяет прошлый отсчёт — пауза считается заново.
    return () => window.clearTimeout(timer)
  }, [vimeoId])

  const ready = isVimeoIdValid(settledId)

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>{t('content.lessons.form.preview')}</h2>

      <div className={styles.frame}>
        {ready ? (
          <iframe
            className={styles.player}
            src={playerUrl(settledId)}
            title={t('content.lessons.form.previewPlayerTitle')}
            allow="fullscreen"
          />
        ) : (
          <p className={styles.placeholder}>
            {t('content.lessons.form.previewEmpty')}
          </p>
        )}
      </div>

      <p className={styles.note}>{t('content.lessons.form.previewNote')}</p>
    </Card>
  )
}
