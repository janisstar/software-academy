import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard } from '../../components/app/LessonCard'
import { AppNavGlyph } from '../../components/app/AppIcons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { appLessonPath } from '../../constants/routes'
import { useCategoriesTree } from '../../hooks/useCategoriesTree'
import { useLessons } from '../../hooks/useLessons'
import type { LessonWithStatus } from '../../types/api'
import { apiErrorText } from '../../utils/apiError'
import {
  flattenCategoryTree,
  groupLessonsByCategory,
  type CategoryEntry,
  type LessonGroup,
} from '../../utils/lessons'
import styles from './AppLessonsPage.module.css'

/** Значение «все категории» в селекте: у <option> значение всегда строка. */
const ALL_CATEGORIES = ''

/**
 * Каталог уроков ученика: карточки, разложенные по категориям.
 *
 * Раскладка — та же, что в таблице уроков master: порядок групп задаёт обход
 * дерева категорий, уроки внутри группы идут как их отдал бэкенд. Общий код
 * лежит в `utils/lessons`, поэтому две области не могут разъехаться.
 *
 * Своей проверки роли тут нет намеренно: в учебную область не пускает master
 * шлюз `AreaGate area="app"`, а всем остальным ролям каталог открыт — просто
 * состав уроков бэкенд считает по роли сам.
 */
export function AppLessonsPage() {
  const { t } = useTranslation()

  // Фильтр клиентский, как в master-таблице: список уроков грузится один раз
  // целиком, поэтому переключение категории не ходит на сервер.
  const lessonsState = useLessons()
  const categoriesState = useCategoriesTree(true)

  const [categoryId, setCategoryId] = useState<number | null>(null)

  // Плоский список категорий в порядке обхода дерева — и для групп, и для фильтра.
  const categories = useMemo(
    () => flattenCategoryTree(categoriesState.tree),
    [categoriesState.tree],
  )

  const visibleLessons = useMemo(
    () =>
      categoryId === null
        ? lessonsState.lessons
        : // Выбор родителя показывает только его собственные уроки: уроки
          // подкатегорий лежат в своих категориях и ищутся по ним. Поведение
          // совпадает с master-таблицей намеренно.
          lessonsState.lessons.filter(
            (lesson) => lesson.category_id === categoryId,
          ),
    [lessonsState.lessons, categoryId],
  )

  const groups = useMemo(
    () => groupLessonsByCategory(visibleLessons, categories),
    [visibleLessons, categories],
  )

  /** Подпись категории в фильтре: у подкатегории видно и родителя. */
  const categoryLabel = (category: CategoryEntry) =>
    category.parentName === null
      ? category.name
      : t('app.lessons.categoryPath', {
          parent: category.parentName,
          child: category.name,
        })

  /**
   * Заголовок группы. У подкатегории родитель уходит в капсовый надзаголовок
   * над названием, а не в одну строку с ним: так название группы читается
   * так же коротко, как у категории верхнего уровня.
   */
  const groupHead = (group: LessonGroup<LessonWithStatus>) => {
    if (group.category === null) {
      // Категории урока не нашлось в дереве — не теряем его молча.
      return { eyebrow: null, title: t('app.lessons.otherGroup') }
    }
    return { eyebrow: group.category.parentName, title: group.category.name }
  }

  // Страница показывает данные двух запросов, поэтому и грузится, и падает
  // как одно целое: карточки без имён категорий бесполезны.
  const loading = lessonsState.loading || categoriesState.loading
  const failed = lessonsState.error !== null || categoriesState.failed
  const ready = !loading && !failed
  const hasLessons = lessonsState.lessons.length > 0

  const retry = () => {
    lessonsState.reload()
    categoriesState.reload()
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1>{t('app.lessons.title')}</h1>
          <p className={styles.caption}>{t('app.lessons.caption')}</p>
        </div>

        {/* Фильтр не нужен, пока показывать нечего. Ширину задаёт обёртка,
            а не класс поверх Select: два класса из разных CSS-модулей имеют
            одинаковую специфичность (см. ui/Button про --button-radius). */}
        {ready && hasLessons ? (
          <div className={styles.filterSlot}>
            <Select
              fullWidth
              aria-label={t('app.lessons.categoryFilter')}
              value={categoryId === null ? ALL_CATEGORIES : String(categoryId)}
              onChange={(event) =>
                setCategoryId(
                  event.target.value === ALL_CATEGORIES
                    ? null
                    : Number(event.target.value),
                )
              }
            >
              <option value={ALL_CATEGORIES}>
                {t('app.lessons.allCategories')}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {categoryLabel(category)}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>

      {/* Три состояния взаимоисключающие: грузим → ошибка → данные. */}
      {loading ? <Card>{t('common.loading')}</Card> : null}

      {failed ? (
        <Card className={styles.error}>
          {/* Текст ошибки — с бэкенда; свой только на случай обрыва сети. */}
          <p>{apiErrorText(lessonsState.error, t('app.lessons.error'))}</p>
          <Button onClick={retry}>{t('app.lessons.retry')}</Button>
        </Card>
      ) : null}

      {ready && hasLessons
        ? groups.map((group) => {
            const { eyebrow, title } = groupHead(group)

            return (
              <section
                className={styles.group}
                key={group.category?.id ?? 'other'}
              >
                {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
                <h2 className={styles.groupTitle}>{title}</h2>

                <div className={styles.grid}>
                  {group.lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      to={appLessonPath(lesson.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })
        : null}

      {/* Отфильтровали в ноль — это не «пусто вообще», а тупик на один клик. */}
      {ready && hasLessons && groups.length === 0 ? (
        <Card className={styles.filterEmpty}>
          <p>{t('app.lessons.filterEmpty')}</p>
          <Button variant="outline" onClick={() => setCategoryId(null)}>
            {t('app.lessons.showAll')}
          </Button>
        </Card>
      ) : null}

      {ready && !hasLessons ? (
        <div className={styles.empty}>
          <span className={styles.emptyMark}>
            <AppNavGlyph name="lessons" size={28} />
          </span>
          <h2>{t('app.lessons.emptyTitle')}</h2>
          <p className={styles.emptyText}>{t('app.lessons.emptyText')}</p>
          <p className={styles.emptyText}>{t('app.lessons.emptyHint')}</p>
        </div>
      ) : null}
    </>
  )
}
