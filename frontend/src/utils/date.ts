/**
 * Даты в интерфейсе показываем коротко и по-английски: «Aug 10, 2026».
 *
 * Форматтер создаётся один раз на модуль: Intl.DateTimeFormat — дорогой
 * объект, пересоздавать его на каждую строку таблицы не нужно.
 */
const shortDateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** ISO-строка даты с бэкенда → «Aug 10, 2026». */
export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(isoDate))
}
