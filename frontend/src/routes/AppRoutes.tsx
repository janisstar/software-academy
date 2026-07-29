import { Navigate, Route, Routes } from 'react-router-dom'
import { MasterLayout } from '../components/master/MasterLayout'
import { LandingPage } from '../pages/landing/LandingPage'
import { LoginPage } from '../pages/login/LoginPage'
import { CategoriesPage } from '../pages/master/CategoriesPage'
import { CompaniesPage } from '../pages/master/CompaniesPage'
import { DashboardPage } from '../pages/master/DashboardPage'
import { LessonsPage } from '../pages/master/LessonsPage'
import { ReportsPage } from '../pages/master/ReportsPage'
import { SettingsPage } from '../pages/master/SettingsPage'
import { UsersPage } from '../pages/master/UsersPage'
import { LandingRoute } from './LandingRoute'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingRoute>
            <LandingPage />
          </LandingRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />

      {/* Роут без своего пути: даёт всем страницам master общий каркас
          (боковое меню / нижние табы) за одной проверкой авторизации.
          Сами страницы подставляются в <Outlet /> внутри MasterLayout. */}
      <Route
        element={
          <ProtectedRoute>
            <MasterLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<DashboardPage />} />
        <Route path="/content/categories" element={<CategoriesPage />} />
        <Route path="/content/lessons" element={<LessonsPage />} />
        <Route path="/people/users" element={<UsersPage />} />
        <Route path="/people/companies" element={<CompaniesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
