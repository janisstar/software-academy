import styles from './Button.module.css'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Растянуть кнопку на всю ширину контейнера. */
  fullWidth?: boolean
  /**
   * Внешний вид:
   * `solid` — акцентная заливка (главное действие на экране);
   * `ghost` — без заливки и без рамки, вроде «Log out» в меню;
   * `outline` — белая с серой рамкой, второстепенное действие на карточке;
   * `danger` — красная без заливки, для разрушающих действий.
   */
  variant?: 'solid' | 'ghost' | 'outline' | 'danger'
}

/** Общая кнопка-пилюля. */
export function Button({
  fullWidth = false,
  variant = 'solid',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  // Классы модуля + класс, переданный снаружи (может и не быть).
  const classNames = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button className={classNames} type={type} {...rest} />
}
