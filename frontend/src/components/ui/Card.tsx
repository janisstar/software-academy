import styles from './Card.module.css'

type CardProps = React.HTMLAttributes<HTMLDivElement>

/** Общая карточка: белая поверхность с мягкой тенью и скруглением. */
export function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
