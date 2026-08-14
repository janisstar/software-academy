import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CategoryCreateRow,
  CategoryRow,
  type CategoryActions,
  type CategoryEditor,
} from './CategoryRow'
import type { CategoryOut, CategoryTree } from '../../types/api'
import { createRowKey, rowKey } from '../../utils/categories'
import styles from './CategoriesTree.module.css'

/** Ошибка последнего действия: к какой строке она относится и что показать. */
export interface RowError {
  key: string
  text: string
}

type CategoriesTreeProps = {
  /** Дерево ровно в том порядке, в каком его отдал бэкенд. */
  tree: CategoryTree[]
  editor: CategoryEditor | null
  /** Ключ строки, по которой идёт запрос (null — запросов нет). */
  busyKey: string | null
  error: RowError | null
  actions: CategoryActions
}

/**
 * Редактор, открытый именно на этой категории. Форма создания к строкам
 * категорий не относится — у неё своя строка.
 */
function editorFor(
  editor: CategoryEditor | null,
  categoryId: number,
): CategoryEditor | null {
  if (editor === null || editor.kind === 'create') {
    return null
  }
  return editor.id === categoryId ? editor : null
}

/**
 * Карточка-дерево категорий: два уровня, между детьми и следующим родителем —
 * строка «+ Add subcategory».
 *
 * Компонент чисто отрисовочный: он ничего не сортирует и не запрашивает,
 * а только показывает переданное дерево и зовёт обработчики из `actions`.
 */
export function CategoriesTree({
  tree,
  editor,
  busyKey,
  error,
  actions,
}: CategoriesTreeProps) {
  const { t } = useTranslation()

  // Возможные родители для переноса — только категории верхнего уровня.
  const topLevel: CategoryOut[] = tree

  const isBusy = (key: string) => busyKey === key
  const errorFor = (key: string) => (error?.key === key ? error.text : null)

  /** Открыта ли форма новой категории в этом ряду. */
  const isCreatingIn = (parentId: number | null) =>
    editor?.kind === 'create' && editor.parentId === parentId

  return (
    <div className={styles.card}>
      {tree.map((top, topIndex) => (
        <Fragment key={top.id}>
          <CategoryRow
            category={top}
            isSub={false}
            isFirst={topIndex === 0}
            isLast={topIndex === tree.length - 1}
            editor={editorFor(editor, top.id)}
            busy={isBusy(rowKey(top))}
            error={errorFor(rowKey(top))}
            topLevel={topLevel}
            actions={actions}
          />

          {top.subcategories.map((sub, subIndex) => (
            <CategoryRow
              key={sub.id}
              category={sub}
              isSub
              isFirst={subIndex === 0}
              isLast={subIndex === top.subcategories.length - 1}
              editor={editorFor(editor, sub.id)}
              busy={isBusy(rowKey(sub))}
              error={errorFor(rowKey(sub))}
              topLevel={topLevel}
              actions={actions}
            />
          ))}

          {/* Форма новой подкатегории встаёт на место ссылки «+ Add subcategory». */}
          {isCreatingIn(top.id) ? (
            <CategoryCreateRow
              parentId={top.id}
              busy={isBusy(createRowKey(top.id))}
              error={errorFor(createRowKey(top.id))}
              actions={actions}
            />
          ) : (
            <div className={styles.addRow}>
              <button
                type="button"
                className={styles.addLink}
                onClick={() => actions.onStartCreate(top.id)}
              >
                {t('content.categories.addSubcategory')}
              </button>
            </div>
          )}
        </Fragment>
      ))}

      {/* Новая категория верхнего уровня — последней строкой карточки. */}
      {isCreatingIn(null) ? (
        <CategoryCreateRow
          parentId={null}
          busy={isBusy(createRowKey(null))}
          error={errorFor(createRowKey(null))}
          actions={actions}
        />
      ) : null}
    </div>
  )
}
