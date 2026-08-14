import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../ui/Card'
import { Checkbox } from '../ui/Checkbox'
import { Select } from '../ui/Select'
import { TextArea } from '../ui/TextArea'
import { TextField } from '../ui/TextField'
import type { RoleOut } from '../../types/api'
import type { CategoryEntry } from '../../utils/lessons'
import styles from './LessonForm.module.css'

/**
 * Поля формы урока.
 *
 * Всё строками — так их отдают инпуты. В числа и в тело запроса это
 * превращает страница при отправке, а не форма при каждом нажатии клавиши:
 * иначе «5» и «05» вели бы себя по-разному прямо во время ввода.
 */
export interface LessonFormValues {
  title: string
  /** id категории строкой: у <option> значение всегда строка. '' — не выбрана. */
  categoryId: string
  description: string
  minutes: string
  seconds: string
  vimeoId: string
  transcript: string
  isPublic: boolean
  /** Ключи отмеченных ролей. */
  roles: string[]
}

type LessonFormProps = {
  values: LessonFormValues
  /** Меняем по одному полю: страница хранит весь объект целиком. */
  onChange: (patch: Partial<LessonFormValues>) => void
  /** Категории в порядке дерева — тот же список, что в фильтре таблицы. */
  categories: CategoryEntry[]
  /**
   * Роли, видимость для которых вообще настраивается: непривилегированные.
   * Админам, менеджерам и site-ролям видны все уроки всегда.
   */
  learnerRoles: RoleOut[]
  /** В режиме редактирования под категорией стоит предупреждение о переносе. */
  showCategoryHint: boolean
  /** Длительность заполнена неверно — под полем появляется пояснение. */
  durationInvalid: boolean
  /** Vimeo ID заполнен неверно — под полем появляется пояснение. */
  vimeoInvalid: boolean
}

/**
 * Две карточки формы урока: сами поля и видимость.
 *
 * Компонент управляемый и без собственного состояния: и значения, и проверки
 * живут на странице, потому что отправлять их всё равно ей.
 */
export function LessonForm({
  values,
  onChange,
  categories,
  learnerRoles,
  showCategoryHint,
  durationInvalid,
  vimeoInvalid,
}: LessonFormProps) {
  const { t } = useTranslation()
  // Пара «мин / сек» — одна группа полей с общим ярлыком.
  const durationLabelId = useId()

  /** Подпись категории: у подкатегории видно и родителя. */
  const categoryLabel = (category: CategoryEntry) =>
    category.parentName === null
      ? category.name
      : t('content.lessons.categoryPath', {
          parent: category.parentName,
          child: category.name,
        })

  const toggleRole = (key: string, checked: boolean) =>
    onChange({
      roles: checked
        ? [...values.roles, key]
        : values.roles.filter((role) => role !== key),
    })

  return (
    <>
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>{t('content.lessons.form.lesson')}</h2>

        <div className={styles.fields}>
          <TextField
            tone="surface"
            label={t('content.lessons.form.title')}
            placeholder={t('content.lessons.form.titlePlaceholder')}
            value={values.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />

          <Select
            fullWidth
            label={t('content.lessons.form.category')}
            hint={
              showCategoryHint
                ? t('content.lessons.form.categoryHint')
                : undefined
            }
            value={values.categoryId}
            onChange={(event) => onChange({ categoryId: event.target.value })}
          >
            <option value="">{t('content.lessons.form.categoryChoose')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {categoryLabel(category)}
              </option>
            ))}
          </Select>

          <TextArea
            label={t('content.lessons.form.description')}
            placeholder={t('content.lessons.form.descriptionPlaceholder')}
            value={values.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />

          <div>
            <span className={styles.groupLabel} id={durationLabelId}>
              {t('content.lessons.form.duration')}
            </span>
            {/* Два поля читаются только вместе, поэтому это группа с общим
                ярлыком; у каждого поля есть ещё и своё имя для скринридера. */}
            <div
              className={styles.duration}
              role="group"
              aria-labelledby={durationLabelId}
            >
              <input
                className={styles.durationInput}
                type="text"
                inputMode="numeric"
                aria-label={t('content.lessons.form.minutes')}
                value={values.minutes}
                onChange={(event) => onChange({ minutes: event.target.value })}
              />
              <span className={styles.durationUnit}>
                {t('content.lessons.form.minutesShort')}
              </span>
              <input
                className={styles.durationInput}
                type="text"
                inputMode="numeric"
                aria-label={t('content.lessons.form.seconds')}
                value={values.seconds}
                onChange={(event) => onChange({ seconds: event.target.value })}
              />
              <span className={styles.durationUnit}>
                {t('content.lessons.form.secondsShort')}
              </span>
            </div>
            {durationInvalid ? (
              <p className={styles.error}>
                {t('content.lessons.form.durationError')}
              </p>
            ) : null}
          </div>

          <div>
            <TextField
              tone="surface"
              label={t('content.lessons.form.vimeo')}
              hint={t('content.lessons.form.vimeoHint')}
              inputMode="numeric"
              value={values.vimeoId}
              onChange={(event) => onChange({ vimeoId: event.target.value })}
            />
            {vimeoInvalid ? (
              <p className={styles.error}>
                {t('content.lessons.form.vimeoError')}
              </p>
            ) : null}
          </div>

          <TextArea
            label={t('content.lessons.form.transcript')}
            placeholder={t('content.lessons.form.transcriptPlaceholder')}
            value={values.transcript}
            onChange={(event) => onChange({ transcript: event.target.value })}
          />
        </div>
      </Card>

      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>
          {t('content.lessons.form.visibility')}
        </h2>

        <div className={styles.visibilityBox}>
          <Checkbox
            checked={values.isPublic}
            onChange={(event) => onChange({ isPublic: event.target.checked })}
            label={
              <>
                <b>{t('content.lessons.form.public')}</b>{' '}
                {t('content.lessons.form.publicNote')}
              </>
            }
          />
        </div>

        {/* Галки ролей при включённом Public НЕ сбрасываем: выключат Public —
            всё вернётся как было. */}
        <div className={`${styles.visibilityBox} ${styles.roleBox}`}>
          {learnerRoles.map((role) => (
            <Checkbox
              key={role.key}
              label={role.name}
              checked={values.roles.includes(role.key)}
              disabled={values.isPublic}
              dimmed={values.isPublic}
              onChange={(event) => toggleRole(role.key, event.target.checked)}
            />
          ))}
        </div>

        <p className={styles.visibilityNote}>
          {values.isPublic
            ? t('content.lessons.form.visibilityPublicNote')
            : t('content.lessons.form.visibilityNote')}
        </p>
      </Card>
    </>
  )
}
