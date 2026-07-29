import styles from './Button.module.css'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Растянуть кнопку на всю ширину контейнера. */
  fullWidth?: boolean
}

/** Общая кнопка-пилюля с акцентной заливкой. */
export function Button({
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  // Классы модуля + класс, переданный снаружи (может и не быть).
  const classNames = [
    styles.button,
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button className={classNames} type={type} {...rest} />
}
