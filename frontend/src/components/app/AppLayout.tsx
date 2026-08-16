import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppTabBar } from './AppTabBar'
import styles from './AppLayout.module.css'

/**
 * Каркас учебной области: верхняя шапка на десктопе, нижние табы на мобильном,
 * страница раздела — через <Outlet />. Какая из двух навигаций видна, решает
 * CSS, а не JS: так нет мигания при первой отрисовке и не нужен слушатель
 * resize.
 */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <AppHeader />

      <main className={styles.main}>
        <Outlet />
      </main>

      <AppTabBar />
    </div>
  )
}
