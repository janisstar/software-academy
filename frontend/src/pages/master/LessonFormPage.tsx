import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createLesson, deleteLesson, updateLesson } from '../../api/lessons'
import {
  LessonForm,
  type LessonFormValues,
} from '../../components/master/LessonForm'
import { LessonPreview } from '../../components/master/LessonPreview'
import { PageShell } from '../../components/master/PageShell'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { CONTENT_PATHS } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useCategoriesTree } from '../../hooks/useCategoriesTree'
import { useDirectories } from '../../hooks/useDirectories'
import { useLesson } from '../../hooks/useLesson'
import { activeRole, type LessonOut, type RoleOut } from '../../types/api'
import { apiErrorText } from '../../utils/apiError'
import {
  durationToSeconds,
  flattenCategoryTree,
  formatDuration,
  isDurationValid,
  isVimeoIdValid,
  splitDuration,
  type CategoryEntry,
} from '../../utils/lessons'
import styles from './LessonFormPage.module.css'

type LessonFormPageProps = {
  /** `new` — создание урока, `edit` — открытый из таблицы урок. */
  mode: 'new' | 'edit'
}

/** Пустая форма нового урока. */
const EMPTY_VALUES: LessonFormValues = {
  title: '',
  categoryId: '',
  description: '',
  minutes: '0',
  seconds: '00',
  vimeoId: '',
  transcript: '',
  isPublic: false,
  roles: [],
}

/** Урок с бэкенда → значения полей формы. */
function valuesFromLesson(lesson: LessonOut): LessonFormValues {
  const duration = splitDuration(lesson.duration_seconds)

  return {
    title: lesson.title,
    categoryId: String(lesson.category_id),
    // null у описания и транскрипта означает «пусто»; поле показывает пустоту
    // одинаково, а обратно всегда уходит строка.
    description: lesson.description ?? '',
    minutes: duration.minutes,
    seconds: duration.seconds,
    vimeoId: lesson.vimeo_id,
    transcript: lesson.transcript ?? '',
    isPublic: lesson.is_public,
    roles: lesson.roles,
  }
}

type LessonEditorProps = {
  /** Урок, если правим существующий; `null` — создаём новый. */
  lesson: LessonOut | null
  categories: CategoryEntry[]
  learnerRoles: RoleOut[]
}

/**
 * Заполненная форма: поля, предпросмотр, кнопки и удаление.
 *
 * Вынесена из страницы отдельным компонентом, потому что начальные значения
 * полей берутся из урока ОДИН раз, при появлении на экране. Страница рисует
 * её только после загрузки — и монтирует заново по `key`, если урок
 * перечитали. Так состояние формы не приходится чинить эффектом.
 */
function LessonEditor({ lesson, categories, learnerRoles }: LessonEditorProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [values, setValues] = useState<LessonFormValues>(() =>
    lesson === null ? EMPTY_VALUES : valuesFromLesson(lesson),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const duration = { minutes: values.minutes, seconds: values.seconds }
  const durationValid = isDurationValid(duration)
  const vimeoValid = isVimeoIdValid(values.vimeoId)

  const canSubmit =
    values.title.trim() !== '' &&
    values.categoryId !== '' &&
    vimeoValid &&
    durationValid

  const goToLessons = () => navigate(CONTENT_PATHS.lessons)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!canSubmit || busy) {
      return
    }

    const payload = {
      title: values.title.trim(),
      vimeo_id: values.vimeoId.trim(),
      category_id: Number(values.categoryId),
      // Пустая строка, а не null: бэкенд отличает «поля нет» от «поле пустое»,
      // и очистить описание можно только пустой строкой.
      description: values.description.trim(),
      duration_seconds: durationToSeconds(duration),
      transcript: values.transcript.trim(),
      is_public: values.isPublic,
      // Роли уходят как есть даже при включённом Public: их хранит бэкенд,
      // а видимость решает is_public. Молча обнулять настройки нельзя.
      roles: values.roles,
    }

    setBusy(true)
    setError(null)

    // Правка шлёт ПОЛНОЕ тело, включая неизменённые поля: у бэкенда
    // «поля нет» значит «не менять», иначе очищенное поле не очистилось бы.
    const request =
      lesson === null
        ? createLesson(payload)
        : updateLesson({ id: lesson.id, ...payload })

    void request
      .then(() => goToLessons())
      .catch((caught: unknown) =>
        setError(apiErrorText(caught, t('content.lessons.form.saveError'))),
      )
      .finally(() => setBusy(false))
  }

  const handleDelete = () => {
    if (lesson === null) {
      return
    }

    setDeleteBusy(true)
    setDeleteError(null)

    void deleteLesson(lesson.id)
      .then(() => navigate(CONTENT_PATHS.lessons, { replace: true }))
      .catch((caught: unknown) =>
        setDeleteError(
          apiErrorText(caught, t('content.lessons.form.deleteError')),
        ),
      )
      .finally(() => {
        setDeleteBusy(false)
        setConfirmDelete(false)
      })
  }

  return (
    <>
      <div className={styles.layout}>
        <div>
          <form onSubmit={handleSubmit}>
            <LessonForm
              values={values}
              onChange={(patch) =>
                setValues((current) => ({ ...current, ...patch }))
              }
              categories={categories}
              learnerRoles={learnerRoles}
              showCategoryHint={lesson !== null}
              durationInvalid={!durationValid}
              // Пустое поле ещё не ошибка: кнопка и так не нажимается.
              vimeoInvalid={values.vimeoId.trim() !== '' && !vimeoValid}
            />

            {error ? <p className={styles.error}>{error}</p> : null}

            <div className={styles.actions}>
              <Button type="submit" disabled={!canSubmit || busy}>
                {busy
                  ? t('common.saving')
                  : lesson === null
                    ? t('content.lessons.form.create')
                    : t('content.lessons.form.save')}
              </Button>
              <Button variant="outline" disabled={busy} onClick={goToLessons}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>

          {lesson !== null ? (
            <Card className={styles.danger}>
              <h2 className={styles.dangerTitle}>
                {t('content.lessons.form.dangerTitle')}
              </h2>
              <p className={styles.dangerText}>
                {t('content.lessons.form.dangerText')}
              </p>
              <Button
                variant="danger"
                disabled={deleteBusy}
                onClick={() => setConfirmDelete(true)}
              >
                {t('content.lessons.form.delete')}
              </Button>
              {deleteError ? (
                <p className={styles.error}>{deleteError}</p>
              ) : null}
            </Card>
          ) : null}
        </div>

        <LessonPreview vimeoId={values.vimeoId} />
      </div>

      {confirmDelete && lesson !== null ? (
        <Modal
          title={t('content.lessons.form.deleteConfirmTitle', {
            name: lesson.title,
          })}
          onClose={() => setConfirmDelete(false)}
          actions={
            <>
              <Button
                variant="ghost"
                disabled={deleteBusy}
                onClick={() => setConfirmDelete(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                disabled={deleteBusy}
                onClick={handleDelete}
              >
                {t('content.lessons.form.delete')}
              </Button>
            </>
          }
        >
          <p>{t('content.lessons.form.deleteConfirmText')}</p>
        </Modal>
      ) : null}
    </>
  )
}

export function LessonFormPage({ mode }: LessonFormPageProps) {
  const { t } = useTranslation()
  const { lessonId: lessonIdParam } = useParams()
  const { user } = useAuth()

  // Управление контентом — только у master. Проверяем роль ДО запросов, чтобы
  // остальным их вообще не отправлять и не ловить 403 постфактум.
  const isMaster = user ? activeRole(user.privileges) === 'master' : false

  // В адресе страницы урока стоит его id; у формы создания такого адреса нет.
  const parsedId = Number(lessonIdParam)
  const lessonId =
    mode === 'edit' && Number.isInteger(parsedId) && parsedId > 0
      ? parsedId
      : null

  const lessonState = useLesson(isMaster ? lessonId : null)
  // Категории нужны и селекту, и подписи в шапке.
  const categoriesState = useCategoriesTree(isMaster)
  // Названия ролей для галок видимости. Компании здесь не нужны.
  const { roles } = useDirectories(false, isMaster)

  const categories = useMemo(
    () => flattenCategoryTree(categoriesState.tree),
    [categoriesState.tree],
  )

  const lesson = lessonState.lesson

  /** Подпись категории: у подкатегории видно и родителя. */
  const categoryLabel = (category: CategoryEntry) =>
    category.parentName === null
      ? category.name
      : t('content.lessons.categoryPath', {
          parent: category.parentName,
          child: category.name,
        })

  const backLink = (
    <Link className={styles.backlink} to={CONTENT_PATHS.lessons}>
      {t('common.arrowBack')} {t('content.lessons.backToLessons')}
    </Link>
  )

  if (!isMaster) {
    return (
      <>
        {backLink}
        <PageShell
          eyebrow={t('master.pages.eyebrow')}
          title={t('master.pages.lessons')}
        >
          <Card>{t('common.inDevelopment')}</Card>
        </PageShell>
      </>
    )
  }

  // Заголовок нужен и до загрузки урока, поэтому пока показываем общий.
  const pageTitle =
    mode === 'new'
      ? t('content.lessons.newTitle')
      : (lesson?.title ?? t('content.lessons.editTitle'))

  /** Страница-сообщение: шапка на месте, вместо формы одна карточка. */
  const message = (body: React.ReactNode) => (
    <>
      {backLink}
      <PageShell eyebrow={t('content.lessons.eyebrow')} title={pageTitle}>
        {body}
      </PageShell>
    </>
  )

  if (mode === 'edit' && lessonId === null) {
    // Такой адрес роутер сюда пропустил, но id в нём не число.
    return message(<Card>{t('content.lessons.form.badAddress')}</Card>)
  }

  if (lessonState.loading || categoriesState.loading) {
    return message(<Card>{t('common.loading')}</Card>)
  }

  // Страница показывает данные двух запросов и падает как одно целое: форма
  // без списка категорий бесполезна. Пустой урок в режиме правки — тоже отказ.
  if (
    lessonState.failed ||
    categoriesState.failed ||
    (mode === 'edit' && lesson === null)
  ) {
    return message(
      <Card className={styles.loadError}>
        <p>{t('content.lessons.form.loadError')}</p>
        <Button
          onClick={() => {
            lessonState.reload()
            categoriesState.reload()
          }}
        >
          {t('content.lessons.retry')}
        </Button>
      </Card>,
    )
  }

  /** Подпись под заголовком: у нового урока — что будет, у открытого — что это. */
  const caption = () => {
    if (lesson === null) {
      return t('content.lessons.form.newCaption')
    }

    const category = categories.find((entry) => entry.id === lesson.category_id)

    return [
      category ? categoryLabel(category) : t('content.lessons.unknownCategory'),
      formatDuration(lesson.duration_seconds),
    ].join(` ${t('common.dot')} `)
  }

  // Видимость настраивается только для непривилегированных ролей: админам,
  // менеджерам и site-ролям видны все уроки всегда.
  const learnerRoles = roles.filter((role) => !role.is_privileged)

  return (
    <>
      {backLink}

      <PageShell eyebrow={t('content.lessons.eyebrow')} title={pageTitle}>
        <p className={styles.caption}>{caption()}</p>

        <LessonEditor
          // Перечитали урок — форма собирается заново с его значениями.
          key={lesson?.id ?? 'new'}
          lesson={lesson}
          categories={categories}
          learnerRoles={learnerRoles}
        />
      </PageShell>
    </>
  )
}
