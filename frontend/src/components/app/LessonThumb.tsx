import { PlayGlyph } from './AppIcons'
import styles from './LessonThumb.module.css'

/**
 * Размер превью:
 * `hero` — в карточке Continue, `card` — обложка карточки урока в сетке,
 * `small` — мини-превью в списке «Recently watched».
 */
type LessonThumbSize = 'hero' | 'card' | 'small'

interface LessonThumbProps {
  size?: LessonThumbSize
}

/**
 * Превью урока — бирюзовый градиент с кружком play.
 *
 * Настоящей картинки тут нет намеренно: по мокапу превью — заглушка, а
 * `thumbnail_url` у уроков пока не заполняется. Блок декоративный, поэтому
 * `aria-hidden`: рядом всегда стоит название урока.
 */
export function LessonThumb({ size = 'card' }: LessonThumbProps) {
  const isSmall = size === 'small'
  const playClass = [styles.play, isSmall ? styles.playSmall : '']
    .filter(Boolean)
    .join(' ')

  return (
    <span className={[styles.thumb, styles[size]].join(' ')} aria-hidden="true">
      <span className={playClass}>
        <PlayGlyph size={isSmall ? 12 : 18} />
      </span>
    </span>
  )
}
