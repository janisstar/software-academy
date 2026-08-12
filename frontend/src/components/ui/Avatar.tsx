import styles from './Avatar.module.css'

type AvatarProps = {
  /** Имя человека: из него берутся инициалы. */
  name: string
  size?: 'md' | 'lg'
}

/** Первые буквы имени и фамилии: «Ivan Ivanov» → «II». */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

/** Кружок с инициалами вместо фотографии профиля. */
export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    // aria-hidden: инициалы ничего не добавляют к имени, которое стоит рядом.
    <span
      className={[styles.avatar, styles[size]].join(' ')}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
