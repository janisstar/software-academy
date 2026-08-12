import styles from './SegmentedTabs.module.css'

export type SegmentedTabItem<Value extends string> = {
  value: Value
  /** Подпись пилюли — УЖЕ переведённая, вместе со счётчиком («All · 6»). */
  label: string
}

type SegmentedTabsProps<Value extends string> = {
  items: SegmentedTabItem<Value>[]
  value: Value
  onChange: (next: Value) => void
  /** Название всей группы для скринридера, например «Filter users by status». */
  label: string
}

/**
 * Пилюльный переключатель фильтра.
 *
 * Это группа кнопок с `aria-pressed`, а не `role="tablist"`: настоящие табы
 * переключают панели, а здесь один и тот же список только фильтруется.
 */
export function SegmentedTabs<Value extends string>({
  items,
  value,
  onChange,
  label,
}: SegmentedTabsProps<Value>) {
  return (
    <div className={styles.tabs} role="group" aria-label={label}>
      {items.map((item) => {
        const isActive = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isActive}
            className={[styles.tab, isActive ? styles.active : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
