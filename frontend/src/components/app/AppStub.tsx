import { useTranslation } from 'react-i18next'
import { Card } from '../ui/Card'
import styles from './AppStub.module.css'

interface AppStubProps {
  /** Заголовок раздела — уже переведённая строка. */
  title: string
}

/**
 * Экран-заглушка учебной области: заголовок раздела и «In development».
 *
 * Один компонент на все четыре раздела, чтобы каркас не разъехался, пока
 * страницы делаются по очереди. Каждая настоящая страница заменит его своим
 * содержимым.
 */
export function AppStub({ title }: AppStubProps) {
  const { t } = useTranslation()

  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      <Card>{t('common.inDevelopment')}</Card>
    </>
  )
}
