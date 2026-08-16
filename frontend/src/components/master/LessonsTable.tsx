import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { RoleChip } from './RoleChip'
import { Chip } from '../ui/Chip'
import { lessonPath } from '../../constants/routes'
import {
  toRoleKey,
  type MasterLesson,
  type MoveDirection,
} from '../../types/api'
import { formatShortDate } from '../../utils/date'
import { formatDuration, type LessonGroup } from '../../utils/lessons'
import styles from './LessonsTable.module.css'

/** Сколько колонок в таблице: заголовок группы растягивается на все. */
const COLUMN_COUNT = 6

type LessonsTableProps = {
  /** Группы уже в нужном порядке: таблица ничего не сортирует. */
  groups: LessonGroup<MasterLesson>[]
  /** Ключ роли → её название с бэкенда. Нет названия — покажем сам ключ. */
  roleNames: Record<string, string>
  /** id урока, по которому прямо сейчас идёт запрос сдвига. */
  busyId: number | null
  onMove: (lesson: MasterLesson, direction: MoveDirection) => void
  /** Что показать, если после фильтра не осталось ни одного урока. */
  emptyText: string
}

type OrderButtonsProps = {
  lesson: MasterLesson
  /** Первый/последний в своей категории — соответствующая стрелка гаснет. */
  isFirst: boolean
  isLast: boolean
  busy: boolean
  onMove: (lesson: MasterLesson, direction: MoveDirection) => void
}

/** Пара стрелок ▲▼ в первой колонке строки. */
function OrderButtons({
  lesson,
  isFirst,
  isLast,
  busy,
  onMove,
}: OrderButtonsProps) {
  const { t } = useTranslation()

  // Строка целиком ведёт на урок, поэтому клик по стрелке до неё не доводим.
  const handleMove = (
    event: React.MouseEvent<HTMLButtonElement>,
    direction: MoveDirection,
  ) => {
    event.stopPropagation()
    onMove(lesson, direction)
  }

  return (
    <span className={styles.orderButtons}>
      <button
        type="button"
        className={styles.orderButton}
        disabled={isFirst || busy}
        aria-label={t('content.lessons.moveUp')}
        onClick={(event) => handleMove(event, 'up')}
      >
        {t('common.arrowUp')}
      </button>
      <button
        type="button"
        className={styles.orderButton}
        disabled={isLast || busy}
        aria-label={t('content.lessons.moveDown')}
        onClick={(event) => handleMove(event, 'down')}
      >
        {t('common.arrowDown')}
      </button>
    </span>
  )
}

type VisibilityProps = {
  lesson: MasterLesson
  roleNames: Record<string, string>
}

/**
 * Кому урок виден: публичный — один чип Public, иначе чипы ролей,
 * а если ролей нет вовсе — Hidden (учащиеся его пока не видят).
 */
function Visibility({ lesson, roleNames }: VisibilityProps) {
  const { t } = useTranslation()

  if (lesson.is_public) {
    return <Chip>{t('content.lessons.public')}</Chip>
  }

  if (lesson.roles.length === 0) {
    return (
      <Chip className={styles.hiddenChip}>{t('content.lessons.hidden')}</Chip>
    )
  }

  return (
    <span className={styles.chips}>
      {lesson.roles.map((role) => (
        <RoleChip
          key={role}
          role={toRoleKey(role)}
          name={roleNames[role] ?? role}
        />
      ))}
    </span>
  )
}

/**
 * Таблица уроков, сгруппированных по категориям.
 *
 * Своя вёрстка, а не общий `ui/DataTable`: тот рисует ровный список строк
 * одинаковой формы, а здесь между строками стоят заголовки групп (одна ячейка
 * на всю ширину) — под них у DataTable нет места, и добавлять его туда ради
 * одной таблицы значило бы усложнить компонент, которым пользуются все.
 *
 * Компонент чисто отрисовочный: ничего не сортирует и не запрашивает.
 */
export function LessonsTable({
  groups,
  roleNames,
  busyId,
  onMove,
  emptyText,
}: LessonsTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const groupTitle = (group: LessonGroup<MasterLesson>) => {
    if (group.category === null) {
      return t('content.lessons.unknownCategory')
    }
    // У подкатегории в заголовке виден и родитель: «Welding / Daily reports».
    return group.category.parentName === null
      ? group.category.name
      : t('content.lessons.categoryPath', {
          parent: group.category.parentName,
          child: group.category.name,
        })
  }

  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              scope="col"
              className={`${styles.th} ${styles.orderColumn}`}
              /* Заголовка у колонки со стрелками нет — имя ей даёт только
                 скринридер, чтобы столбец не читался безымянным. */
              aria-label={t('content.lessons.colOrder')}
            />
            <th scope="col" className={styles.th}>
              {t('content.lessons.colLesson')}
            </th>
            <th scope="col" className={styles.th}>
              {t('content.lessons.colDuration')}
            </th>
            <th scope="col" className={styles.th}>
              {t('content.lessons.colVisibility')}
            </th>
            <th scope="col" className={styles.th}>
              {t('content.lessons.colVimeo')}
            </th>
            <th scope="col" className={styles.th}>
              {t('content.lessons.colCreated')}
            </th>
          </tr>
        </thead>

        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={COLUMN_COUNT}>
                {emptyText}
              </td>
            </tr>
          ) : null}

          {groups.map((group) => (
            <Fragment key={group.category?.id ?? 'unknown'}>
              <tr>
                <th
                  scope="colgroup"
                  className={styles.groupCell}
                  colSpan={COLUMN_COUNT}
                >
                  {groupTitle(group)}
                </th>
              </tr>

              {group.lessons.map((lesson, index) => (
                <tr
                  key={lesson.id}
                  className={styles.row}
                  onClick={() => navigate(lessonPath(lesson.id))}
                >
                  <td className={styles.td}>
                    <OrderButtons
                      lesson={lesson}
                      // Соседи — уроки той же категории, то есть этой группы.
                      isFirst={index === 0}
                      isLast={index === group.lessons.length - 1}
                      busy={busyId === lesson.id}
                      onMove={onMove}
                    />
                  </td>
                  <td className={styles.td}>
                    {/* Ссылка нужна не ради перехода (его делает строка),
                        а ради клавиатуры: по табу до урока иначе не дойти. */}
                    <Link
                      className={styles.title}
                      to={lessonPath(lesson.id)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {lesson.title}
                    </Link>
                  </td>
                  <td className={styles.td}>
                    {formatDuration(lesson.duration_seconds)}
                  </td>
                  <td className={styles.td}>
                    <Visibility lesson={lesson} roleNames={roleNames} />
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>
                    {lesson.vimeo_id}
                  </td>
                  <td className={`${styles.td} ${styles.dim}`}>
                    {formatShortDate(lesson.created_at)}
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
