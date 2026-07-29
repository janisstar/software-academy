import { Outlet } from 'react-router-dom'
import { SideNav } from './SideNav'
import { TabBar } from './TabBar'
import styles from './MasterLayout.module.css'

/**
 * Каркас master-интерфейса: боковое меню на десктопе, нижние табы на мобильном,
 * страница раздела — через <Outlet />. Какое из двух меню видно, решает CSS,
 * а не JS: так нет мигания при первой отрисовке и не нужен слушатель resize.
 */
export function MasterLayout() {
  return (
    <div className={styles.shell}>
      <SideNav />

      <main className={styles.main}>
        <div className={styles.inner}>
          <Outlet />
        </div>
      </main>

      <TabBar />
    </div>
  )
}
