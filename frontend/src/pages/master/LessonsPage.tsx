import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { moveLesson } from '../../api/lessons'
import { LessonsTable } from '../../components/master/LessonsTable'
import { PageShell } from '../../components/master/PageShell'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { CONTENT_PATHS } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useCategoriesTree } from '../../hooks/useCategoriesTree'
import { useDirectories } from '../../hooks/useDirectories'
import { useMasterLessons } from '../../hooks/useMasterLessons'
import {
  activeRole,
  type MasterLesson,
  type MoveDirection,
} from '../../types/api'
import {
  flattenCategoryTree,
  groupLessonsByCategory,
  type CategoryEntry,
} from '../../utils/lessons'
import styles from './LessonsPage.module.css'

/** Значение «все категории» в селекте: у <option> значение всегда строка. */
const ALL_CATEGORIES = ''

export function LessonsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Управление контентом — только у master. Проверяем роль ДО запросов, чтобы
  // остальным их вообще не отправлять и не ловить 403 постфактум.
  const isMaster = user ? activeRole(user.privileges) === 'master' : false

  const lessonsState = useMasterLessons(isMaster)
  // Дерево категорий переиспользуем как есть: оно задаёт и порядок групп,
  // и содержимое фильтра.
  const categoriesState = useCategoriesTree(isMaster)
  // Названия ролей для чипов видимости. Компании здесь не нужны.
  const { roles } = useDirectories(false)

  const [categoryId, setCategoryId] = useState<number | null>(null)
  // id урока, по которому идёт сдвиг: его стрелки замирают.
  const [busyId, setBusyId] = useState<number | null>(null)
  const [orderFailed, setOrderFailed] = useState(false)

  const roleNames = useMemo(
    () => Object.fromEntries(roles.map((role) => [role.key, role.name])),
    [roles],
  )

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
          // подкатегорий лежат в своих категориях и ищутся по ним.
          lessonsState.lessons.filter(
            (lesson) => lesson.category_id === categoryId,
          ),
    [lessonsState.lessons, categoryId],
  )

  const groups = useMemo(
    () => groupLessonsByCategory(visibleLessons, categories),
    [visibleLessons, categories],
  )

  /** Подпись категории: у подкатегории видно и родителя. */
  const categoryLabel = (category: CategoryEntry) =>
    category.parentName === null
      ? category.name
      : t('content.lessons.categoryPath', {
          parent: category.parentName,
          child: category.name,
        })

  const handleMove = (lesson: MasterLesson, direction: MoveDirection) => {
    setBusyId(lesson.id)
    setOrderFailed(false)

    void (async () => {
      try {
        await moveLesson(lesson.id, direction)
        // Перечитываем список целиком: порядок считает бэкенд.
        lessonsState.reload()
      } catch {
        // Строки не трогаем — они и так нарисованы по данным с бэкенда,
        // а те не изменились.
        setOrderFailed(true)
      } finally {
        setBusyId(null)
      }
    })()
  }

  const goToNewLesson = () => navigate(CONTENT_PATHS.newLesson)

  if (!isMaster) {
    return (
      <PageShell
        eyebrow={t('master.pages.eyebrow')}
        title={t('master.pages.lessons')}
      >
        <Card>{t('common.inDevelopment')}</Card>
      </PageShell>
    )
  }

  // Страница показывает данные двух запросов, поэтому и грузится, и падает
  // как одно целое: половина таблицы без категорий бесполезна.
  const loading = lessonsState.loading || categoriesState.loading
  const failed = lessonsState.failed || categoriesState.failed
  const ready = !loading && !failed
  const hasLessons = lessonsState.lessons.length > 0

  const retry = () => {
    lessonsState.reload()
    categoriesState.reload()
  }

  return (
    <PageShell
      eyebrow={t('content.lessons.eyebrow')}
      title={t('content.lessons.title')}
      actions={
        // На пустом списке кнопка живёт внутри пустого состояния.
        ready && hasLessons ? (
          <Button onClick={goToNewLesson}>
            {t('content.lessons.addLesson')}
          </Button>
        ) : undefined
      }
    >
      <p className={styles.caption}>{t('content.lessons.caption')}</p>

      {ready && hasLessons ? (
        <div className={styles.toolbar}>
          <span className={styles.filterLabel} id="lessons-category-filter">
            {t('content.lessons.categoryFilter')}
          </span>
          <Select
            aria-labelledby="lessons-category-filter"
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
              {t('content.lessons.allCategories')}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {categoryLabel(category)}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {orderFailed ? (
        <p className={styles.orderError} role="alert">
          {t('content.lessons.orderError')}
        </p>
      ) : null}

      {/* Три состояния взаимоисключающие: грузим → ошибка → данные. */}
      {loading ? <Card>{t('common.loading')}</Card> : null}

      {failed ? (
        <Card className={styles.error}>
          <p>{t('content.lessons.error')}</p>
          <Button onClick={retry}>{t('content.lessons.retry')}</Button>
        </Card>
      ) : null}

      {ready && hasLessons ? (
        <>
          <LessonsTable
            groups={groups}
            roleNames={roleNames}
            busyId={busyId}
            onMove={handleMove}
            emptyText={t('content.lessons.filterEmpty')}
          />
          <p className={styles.footNote}>{t('content.lessons.footNote')}</p>
        </>
      ) : null}

      {ready && !hasLessons ? (
        <Card className={styles.empty}>
          <h2>{t('content.lessons.emptyTitle')}</h2>
          <p>{t('content.lessons.emptyText')}</p>
          <Button onClick={goToNewLesson}>
            {t('content.lessons.addLesson')}
          </Button>
        </Card>
      ) : null}
    </PageShell>
  )
}
