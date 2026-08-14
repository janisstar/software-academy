import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import type { CategoryOut, MoveDirection } from '../../types/api'
import styles from './CategoriesTree.module.css'

/**
 * Какой редактор сейчас открыт. Он ровно один на всё дерево: открытие любого
 * закрывает предыдущий, поэтому это одно значение, а не флаг у каждой строки.
 */
export type CategoryEditor =
  | { kind: 'rename'; id: number }
  | { kind: 'move'; id: number }
  /** Форма новой категории: `parentId = null` — в конце верхнего уровня. */
  | { kind: 'create'; parentId: number | null }

/**
 * Действия дерева. Собраны в один объект, чтобы не тащить через `CategoriesTree`
 * десяток отдельных props: сами обработчики живут на странице.
 */
export interface CategoryActions {
  onOrderMove: (category: CategoryOut, direction: MoveDirection) => void
  onStartRename: (category: CategoryOut) => void
  onStartMove: (category: CategoryOut) => void
  onStartCreate: (parentId: number | null) => void
  onCancel: () => void
  onRename: (category: CategoryOut, name: string) => void
  onReparent: (category: CategoryOut, parentId: number | null) => void
  onCreate: (parentId: number | null, name: string) => void
  onDelete: (category: CategoryOut) => void
}

/** Значение «верхний уровень» в селекте: у <option> значение всегда строка. */
const TOP_LEVEL_VALUE = ''

type OrderButtonsProps = {
  upDisabled: boolean
  downDisabled: boolean
  /** Не задан — стрелки только нарисованы (строка ещё не сохранена). */
  onMove?: (direction: MoveDirection) => void
}

/** Пара стрелок ▲▼ слева от названия. */
function OrderButtons({ upDisabled, downDisabled, onMove }: OrderButtonsProps) {
  const { t } = useTranslation()

  return (
    <span className={styles.orderButtons}>
      <button
        type="button"
        className={styles.orderButton}
        disabled={upDisabled}
        aria-label={t('content.categories.moveUp')}
        onClick={() => onMove?.('up')}
      >
        {t('common.arrowUp')}
      </button>
      <button
        type="button"
        className={styles.orderButton}
        disabled={downDisabled}
        aria-label={t('content.categories.moveDown')}
        onClick={() => onMove?.('down')}
      >
        {t('common.arrowDown')}
      </button>
    </span>
  )
}

type NameEditorProps = {
  /** Что показать в поле сразу: имя категории или пустая строка. */
  initial: string
  /** Имя поля для скринридера — видимого ярлыка в строке нет. */
  label: string
  placeholder?: string
  submitLabel: string
  busy: boolean
  onSubmit: (name: string) => void
  onCancel: () => void
}

/**
 * Поле имени с кнопками: один и тот же редактор для переименования
 * и для создания — отличаются только подписи.
 */
function NameEditor({
  initial,
  label,
  placeholder,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: NameEditorProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)

  // Пустое имя сохранять нечего; пока летит запрос — кнопка тоже погашена,
  // иначе двойной клик отправил бы два запроса.
  const canSubmit = value.trim().length > 0 && !busy

  useEffect(() => {
    // Фокус в поле, текущее имя выделено — можно сразу печатать новое.
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const submit = () => {
    if (canSubmit) {
      onSubmit(value.trim())
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        value={value}
        aria-label={label}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            submit()
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            onCancel()
          }
        }}
      />
      <span className={`${styles.actions} ${styles.actionsVisible}`}>
        <Button disabled={!canSubmit} onClick={submit}>
          {submitLabel}
        </Button>
        <Button variant="outline" disabled={busy} onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </span>
    </>
  )
}

type MoveEditorProps = {
  category: CategoryOut
  /** Возможные родители: категории верхнего уровня. */
  topLevel: CategoryOut[]
  busy: boolean
  onSubmit: (parentId: number | null) => void
  onCancel: () => void
}

/** Селект «Move to:» с кнопкой подтверждения. */
function MoveEditor({
  category,
  topLevel,
  busy,
  onSubmit,
  onCancel,
}: MoveEditorProps) {
  const { t } = useTranslation()

  const currentValue =
    category.parent_id === null ? TOP_LEVEL_VALUE : String(category.parent_id)
  const [value, setValue] = useState(currentValue)

  // Переносить туда, где категория уже лежит, незачем.
  const canSubmit = value !== currentValue && !busy

  /** Текущий родитель помечен «(current)» — видно, откуда переносим. */
  const optionLabel = (name: string, isCurrent: boolean) =>
    isCurrent ? t('content.categories.currentOption', { name }) : name

  return (
    <>
      <span className={styles.meta}>{t('content.categories.moveTo')}</span>
      <Select
        aria-label={t('content.categories.moveTo')}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        <option value={TOP_LEVEL_VALUE}>
          {optionLabel(
            t('content.categories.topLevel'),
            category.parent_id === null,
          )}
        </option>
        {/* Саму себя в родители не предлагаем. */}
        {topLevel
          .filter((option) => option.id !== category.id)
          .map((option) => (
            <option key={option.id} value={option.id}>
              {optionLabel(option.name, option.id === category.parent_id)}
            </option>
          ))}
      </Select>
      <span className={`${styles.actions} ${styles.actionsVisible}`}>
        <Button
          disabled={!canSubmit}
          onClick={() =>
            onSubmit(value === TOP_LEVEL_VALUE ? null : Number(value))
          }
        >
          {t('content.categories.moveHere')}
        </Button>
        <Button variant="outline" disabled={busy} onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </span>
    </>
  )
}

type CategoryRowProps = {
  category: CategoryOut
  /** Подкатегория рисуется с отступом и рельсой. */
  isSub: boolean
  /** Первая/последняя в своём ряду — у неё гаснет соответствующая стрелка. */
  isFirst: boolean
  isLast: boolean
  /** Редактор, открытый именно на этой строке (иначе null). */
  editor: CategoryEditor | null
  /** По этой строке сейчас идёт запрос. */
  busy: boolean
  /** Текст ошибки последнего действия по этой строке. */
  error: string | null
  topLevel: CategoryOut[]
  actions: CategoryActions
}

/** Строка дерева со всеми inline-состояниями: обычная, rename, move. */
export function CategoryRow({
  category,
  isSub,
  isFirst,
  isLast,
  editor,
  busy,
  error,
  topLevel,
  actions,
}: CategoryRowProps) {
  const { t } = useTranslation()

  const isEditing = editor !== null
  const hasSubcategories = category.subcategories_count > 0
  const canDelete = category.lessons_count === 0 && !hasSubcategories

  // «4 lessons · 2 subcategories»; нулевые части опускаем, оба нуля → «No lessons».
  const parts: string[] = []
  if (category.lessons_count > 0) {
    parts.push(
      category.lessons_count === 1
        ? t('content.categories.lessonsOne')
        : t('content.categories.lessonsMany', { n: category.lessons_count }),
    )
  }
  if (hasSubcategories) {
    parts.push(
      category.subcategories_count === 1
        ? t('content.categories.subcategoriesOne')
        : t('content.categories.subcategoriesMany', {
            n: category.subcategories_count,
          }),
    )
  }
  const meta =
    parts.length > 0
      ? parts.join(` ${t('common.dot')} `)
      : t('content.categories.noLessons')

  const className = [
    styles.row,
    isSub ? styles.sub : '',
    isEditing ? styles.editing : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <div className={styles.rowMain}>
        <OrderButtons
          // Пока строку редактируют или по ней идёт запрос, порядок не трогаем.
          upDisabled={isFirst || isEditing || busy}
          downDisabled={isLast || isEditing || busy}
          onMove={(direction) => actions.onOrderMove(category, direction)}
        />

        {editor?.kind === 'rename' ? (
          <NameEditor
            initial={category.name}
            label={t('content.categories.nameLabel')}
            submitLabel={t('common.save')}
            busy={busy}
            onSubmit={(name) => actions.onRename(category, name)}
            onCancel={actions.onCancel}
          />
        ) : (
          <>
            <span className={styles.name}>{category.name}</span>

            {editor?.kind === 'move' ? (
              <MoveEditor
                category={category}
                topLevel={topLevel}
                busy={busy}
                onSubmit={(parentId) => actions.onReparent(category, parentId)}
                onCancel={actions.onCancel}
              />
            ) : (
              <>
                <span className={styles.meta}>{meta}</span>
                <span className={styles.actions}>
                  <button
                    type="button"
                    className={styles.linkButton}
                    disabled={busy}
                    onClick={() => actions.onStartRename(category)}
                  >
                    {t('content.categories.rename')}
                  </button>
                  <button
                    type="button"
                    className={styles.linkButton}
                    // Бэкенд не даёт категории с подкатегориями стать
                    // подкатегорией, а «сверху вниз» переносить некуда.
                    disabled={hasSubcategories || busy}
                    title={
                      hasSubcategories
                        ? t('content.categories.moveDisabled')
                        : undefined
                    }
                    onClick={() => actions.onStartMove(category)}
                  >
                    {t('content.categories.move')}
                  </button>
                  <button
                    type="button"
                    className={`${styles.linkButton} ${styles.danger}`}
                    disabled={!canDelete || busy}
                    title={
                      canDelete
                        ? undefined
                        : t('content.categories.deleteDisabled')
                    }
                    onClick={() => actions.onDelete(category)}
                  >
                    {t('content.categories.delete')}
                  </button>
                </span>
              </>
            )}
          </>
        )}
      </div>

      {error ? (
        <p className={styles.rowError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type CategoryCreateRowProps = {
  /** Куда создаём: `null` — верхний уровень, число — внутрь этой категории. */
  parentId: number | null
  busy: boolean
  error: string | null
  actions: CategoryActions
}

/** Строка-форма новой категории: встаёт в конец соответствующего ряда. */
export function CategoryCreateRow({
  parentId,
  busy,
  error,
  actions,
}: CategoryCreateRowProps) {
  const { t } = useTranslation()

  const className = [
    styles.row,
    parentId === null ? '' : styles.sub,
    styles.editing,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <div className={styles.rowMain}>
        {/* Стрелки нарисованы погашенными: у несозданной категории порядка
            ещё нет, но строка должна выглядеть как остальные. */}
        <OrderButtons upDisabled downDisabled />
        <NameEditor
          initial=""
          label={t('content.categories.newNameLabel')}
          placeholder={t('content.categories.newNameLabel')}
          submitLabel={t('content.categories.create')}
          busy={busy}
          onSubmit={(name) => actions.onCreate(parentId, name)}
          onCancel={actions.onCancel}
        />
      </div>

      {error ? (
        <p className={styles.rowError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
