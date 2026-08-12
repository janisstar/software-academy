import type { ReactNode } from 'react'
import styles from './DataTable.module.css'

export type DataTableColumn<Row> = {
  /** Стабильный ключ колонки — уходит в React key заголовка и ячеек. */
  key: string
  /** Заголовок колонки: строка УЖЕ переведённая вызывающим компонентом. */
  header: string
  /** Как нарисовать ячейку этой колонки для конкретной строки. */
  cell: (row: Row) => ReactNode
  /** Прижать содержимое к правому краю — для колонки-действия. */
  align?: 'right'
  /** Скрыть колонку на узком экране (< 900px), когда места на всё не хватает. */
  hideOnNarrow?: boolean
}

type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[]
  rows: Row[]
  /** Ключ строки для React — обычно `row.id`. */
  rowKey: (row: Row) => string | number
  /** Что показать вместо таблицы, когда строк нет. */
  emptyText: string
}

/**
 * Простая таблица: заголовки, строки и пустое состояние.
 *
 * Сортировки и постраничности намеренно нет — списки, которые мы ей рисуем,
 * короткие (последние 5 записей). Понадобится больше — добавим отдельно.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  emptyText,
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>
  }

  // Модификаторы колонки одинаковы для заголовка и для ячеек — считаем их
  // один раз, чтобы правила не разъехались между thead и tbody.
  const modifiers = (column: DataTableColumn<Row>) =>
    [
      column.align === 'right' ? styles.right : '',
      column.hideOnNarrow ? styles.hideOnNarrow : '',
    ].filter(Boolean)

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={[styles.th, ...modifiers(column)].join(' ')}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((column) => (
              <td
                key={column.key}
                className={[styles.td, ...modifiers(column)].join(' ')}
              >
                {column.cell(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
