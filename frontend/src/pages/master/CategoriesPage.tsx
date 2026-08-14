import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createCategory,
  deleteCategory,
  moveCategory,
  renameCategory,
  reparentCategory,
} from '../../api/categories'
import {
  CategoriesTree,
  type RowError,
} from '../../components/master/CategoriesTree'
import type {
  CategoryActions,
  CategoryEditor,
} from '../../components/master/CategoryRow'
import { PageShell } from '../../components/master/PageShell'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../hooks/useAuth'
import { useCategoriesTree } from '../../hooks/useCategoriesTree'
import { activeRole, type CategoryOut } from '../../types/api'
import { apiErrorText } from '../../utils/apiError'
import { createRowKey, rowKey } from '../../utils/categories'
import styles from './CategoriesPage.module.css'

export function CategoriesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  // Управление каталогом — только у master. Проверяем роль ДО запроса, чтобы
  // остальным вообще не отправлять его и не ловить 403 постфактум.
  const isMaster = user ? activeRole(user.privileges) === 'master' : false

  const { tree, loading, failed, reload } = useCategoriesTree(isMaster)

  // Открытый редактор ровно один на всё дерево.
  const [editor, setEditor] = useState<CategoryEditor | null>(null)
  // Строка, по которой сейчас идёт запрос: её кнопки гаснут.
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<RowError | null>(null)
  // Категория, для которой открыто окно подтверждения удаления.
  const [confirmDelete, setConfirmDelete] = useState<CategoryOut | null>(null)

  /** Открыть редактор: предыдущий закрывается без сохранения. */
  const startEditor = (next: CategoryEditor) => {
    setEditor(next)
    setError(null)
  }

  /**
   * Общий запуск изменения: гасит кнопки строки, а после ответа либо
   * перечитывает дерево целиком, либо показывает текст ошибки прямо в строке.
   * Дерево не правим на клиенте: порядок и счётчики считает бэкенд.
   */
  const runAction = (
    key: string,
    fallback: string,
    action: () => Promise<unknown>,
  ) => {
    setBusyKey(key)
    setError(null)

    void (async () => {
      try {
        await action()
        setEditor(null)
        reload()
      } catch (caught) {
        // Редактор оставляем открытым — набранное значение не теряется.
        setError({ key, text: apiErrorText(caught, fallback) })
      } finally {
        setBusyKey(null)
      }
    })()
  }

  const actions: CategoryActions = {
    onOrderMove: (category, direction) =>
      runAction(rowKey(category), t('content.categories.orderError'), () =>
        moveCategory(category.id, direction),
      ),
    onStartRename: (category) =>
      startEditor({ kind: 'rename', id: category.id }),
    onStartMove: (category) => startEditor({ kind: 'move', id: category.id }),
    onStartCreate: (parentId) => startEditor({ kind: 'create', parentId }),
    onCancel: () => {
      setEditor(null)
      setError(null)
    },
    onRename: (category, name) =>
      runAction(rowKey(category), t('content.categories.renameError'), () =>
        renameCategory(category.id, name),
      ),
    onReparent: (category, parentId) =>
      runAction(rowKey(category), t('content.categories.moveError'), () =>
        reparentCategory(category.id, parentId),
      ),
    onCreate: (parentId, name) =>
      runAction(
        createRowKey(parentId),
        t('content.categories.createError'),
        () => createCategory(name, parentId),
      ),
    onDelete: (category) => setConfirmDelete(category),
  }

  const handleDelete = () => {
    if (confirmDelete === null) {
      return
    }

    const target = confirmDelete
    // Окно закрываем сразу: если удалить не выйдет, ошибку покажем в строке.
    setConfirmDelete(null)
    runAction(rowKey(target), t('content.categories.deleteError'), () =>
      deleteCategory(target.id),
    )
  }

  if (!isMaster) {
    return (
      <PageShell
        eyebrow={t('master.pages.eyebrow')}
        title={t('master.pages.categories')}
      >
        <Card>{t('common.inDevelopment')}</Card>
      </PageShell>
    )
  }

  // Пока открыта форма первой категории, показываем карточку-дерево с одной
  // этой строкой, а не пустое состояние.
  const isCreatingTop = editor?.kind === 'create' && editor.parentId === null
  const ready = !loading && !failed
  const showTree = ready && (tree.length > 0 || isCreatingTop)
  const showEmpty = ready && tree.length === 0 && !isCreatingTop

  return (
    <PageShell
      eyebrow={t('content.categories.eyebrow')}
      title={t('content.categories.title')}
      actions={
        // На пустом дереве кнопка живёт внутри пустого состояния.
        tree.length > 0 ? (
          <Button onClick={() => actions.onStartCreate(null)}>
            {t('content.categories.addCategory')}
          </Button>
        ) : undefined
      }
    >
      <p className={styles.caption}>{t('content.categories.caption')}</p>

      {/* Три состояния взаимоисключающие: грузим → ошибка → данные. */}
      {loading ? <Card>{t('common.loading')}</Card> : null}

      {failed ? (
        <Card className={styles.error}>
          <p>{t('content.categories.error')}</p>
          <Button onClick={reload}>{t('content.categories.retry')}</Button>
        </Card>
      ) : null}

      {showTree ? (
        <>
          <CategoriesTree
            tree={tree}
            editor={editor}
            busyKey={busyKey}
            error={error}
            actions={actions}
          />
          <p className={styles.footNote}>{t('content.categories.footNote')}</p>
        </>
      ) : null}

      {showEmpty ? (
        <Card className={styles.empty}>
          <h2>{t('content.categories.emptyTitle')}</h2>
          <p>{t('content.categories.emptyText')}</p>
          <Button onClick={() => actions.onStartCreate(null)}>
            {t('content.categories.addCategory')}
          </Button>
        </Card>
      ) : null}

      {confirmDelete ? (
        <Modal
          title={t('content.categories.deleteConfirmTitle', {
            name: confirmDelete.name,
          })}
          onClose={() => setConfirmDelete(null)}
          actions={
            <>
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                {t('content.categories.deleteConfirm')}
              </Button>
            </>
          }
        >
          <p className={styles.confirmText}>
            {t('content.categories.deleteConfirmText')}
          </p>
        </Modal>
      ) : null}
    </PageShell>
  )
}
