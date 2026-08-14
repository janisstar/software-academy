import type { CategoryTree, MasterLesson } from '../types/api'

/**
 * Категория, вытащенная из дерева в плоский список.
 *
 * Имя родителя лежит рядом, а не собрано в готовую подпись, потому что
 * подпись «Родитель / Подкатегория» — текст интерфейса: собирать её должен
 * компонент через словарь i18n, а не эта утилита.
 */
export interface CategoryEntry {
  id: number
  name: string
  /** Имя родителя — есть только у подкатегории. */
  parentName: string | null
}

/**
 * Дерево категорий → плоский список В ПОРЯДКЕ ОБХОДА: верхний уровень как
 * пришёл, сразу после каждого родителя — его подкатегории как пришли.
 *
 * Этот порядок и есть порядок групп в таблице уроков и пунктов в фильтре:
 * своей сортировки на клиенте нет.
 */
export function flattenCategoryTree(tree: CategoryTree[]): CategoryEntry[] {
  const entries: CategoryEntry[] = []

  for (const top of tree) {
    entries.push({ id: top.id, name: top.name, parentName: null })

    for (const sub of top.subcategories) {
      entries.push({ id: sub.id, name: sub.name, parentName: top.name })
    }
  }

  return entries
}

/** Группа таблицы: заголовок-категория и её уроки. */
export interface LessonGroup {
  /**
   * Категория группы. `null` — уроки, чьей категории в дереве не нашлось:
   * так они хотя бы видны, а не пропадают молча.
   */
  category: CategoryEntry | null
  lessons: MasterLesson[]
}

/**
 * Разложить уроки по категориям.
 *
 * Порядок групп берётся из `categories` (то есть из дерева), порядок уроков
 * внутри группы — тот, в котором их отдал бэкенд. Ничего не сортируем:
 * оба порядка уже посчитаны на сервере.
 *
 * Категории без уроков в таблицу не попадают — пустой заголовок ничего
 * не сообщает.
 */
export function groupLessonsByCategory(
  lessons: MasterLesson[],
  categories: CategoryEntry[],
): LessonGroup[] {
  const byCategory = new Map<number, MasterLesson[]>()

  for (const lesson of lessons) {
    const bucket = byCategory.get(lesson.category_id)
    if (bucket) {
      bucket.push(lesson)
    } else {
      byCategory.set(lesson.category_id, [lesson])
    }
  }

  const groups: LessonGroup[] = []

  for (const category of categories) {
    const bucket = byCategory.get(category.id)
    if (bucket) {
      groups.push({ category, lessons: bucket })
      // Убираем разобранное: что останется — уроки неизвестных категорий.
      byCategory.delete(category.id)
    }
  }

  // Теоретически невозможный случай, поэтому одной группой в конце.
  const orphans = [...byCategory.values()].flat()
  if (orphans.length > 0) {
    groups.push({ category: null, lessons: orphans })
  }

  return groups
}

/** Секунды с бэкенда → «4:20». Секунды всегда двумя цифрами. */
export function formatDuration(totalSeconds: number): string {
  // Отрицательного бэкенд не пришлёт, но подпись «-1:-5» выглядела бы поломкой.
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * Длительность урока в форме — два отдельных поля.
 *
 * Бэкенд хранит одно число (секунды), а вводить его целиком неудобно, поэтому
 * форма разбирает его на минуты и секунды и собирает обратно. Это перевод
 * представления, а не бизнес-логика: никаких правил тут нет.
 */
export interface DurationParts {
  minutes: string
  seconds: string
}

/** Только цифры. Пустая строка тоже подходит — считаем её нулём. */
const DIGITS_ONLY = /^\d*$/

/** Секунды с бэкенда → пара полей формы: «5» и «00». */
export function splitDuration(totalSeconds: number): DurationParts {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))

  return {
    minutes: String(Math.floor(safeSeconds / 60)),
    seconds: String(safeSeconds % 60).padStart(2, '0'),
  }
}

/** Пара полей формы → секунды для бэкенда. Пустое поле = 0. */
export function durationToSeconds(parts: DurationParts): number {
  const minutes = Number(parts.minutes.trim() || 0)
  const seconds = Number(parts.seconds.trim() || 0)

  return minutes * 60 + seconds
}

/** Целые числа ≥ 0, секунд не больше 59 — иначе это опечатка. */
export function isDurationValid(parts: DurationParts): boolean {
  const minutes = parts.minutes.trim()
  const seconds = parts.seconds.trim()

  if (!DIGITS_ONLY.test(minutes) || !DIGITS_ONLY.test(seconds)) {
    return false
  }

  return Number(seconds || 0) <= 59
}

/**
 * Похоже ли значение на Vimeo ID: непустая строка из цифр.
 *
 * Тем же признаком проверяется поле формы и решается, показывать ли плеер:
 * с мусором вместо id iframe просто отдал бы ошибку.
 */
export function isVimeoIdValid(value: string): boolean {
  return /^\d+$/.test(value.trim())
}
