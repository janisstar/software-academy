import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

type LinkButtonProps = PropsWithChildren<{
  /** Куда ведёт ссылка — путь роутера. */
  to: string
  /** Внешний вид: те же варианты, что у `Button`. */
  variant?: 'solid' | 'ghost' | 'outline'
  className?: string
}>

/**
 * Ссылка, выглядящая как кнопка.
 *
 * Стили берутся из `Button.module.css`, а не пишутся заново: геометрия,
 * радиус и цвета главного действия должны быть одни на всё приложение.
 * Отдельный компонент нужен потому, что переход по адресу — это `<Link>`
 * (роутер), а не `<button>` с обработчиком: работают средняя кнопка мыши,
 * «открыть в новой вкладке» и подсказка адреса в браузере.
 */
export function LinkButton({
  to,
  variant = 'solid',
  className,
  children,
}: LinkButtonProps) {
  const classNames = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <Link className={classNames} to={to}>
      {children}
    </Link>
  )
}
