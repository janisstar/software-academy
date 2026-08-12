import { Navigate, Route, Routes } from 'react-router-dom'
import { FirstLoginLayout } from '../components/login/FirstLoginLayout'
import { MasterLayout } from '../components/master/MasterLayout'
import { FIRST_LOGIN_PATHS, LEGAL_PATHS } from '../constants/routes'
import { LandingPage } from '../pages/landing/LandingPage'
import { PrivacyPage } from '../pages/legal/PrivacyPage'
import { TermsPage } from '../pages/legal/TermsPage'
import { FirstLoginConsentsPage } from '../pages/login/FirstLoginConsentsPage'
import { FirstLoginPasswordPage } from '../pages/login/FirstLoginPasswordPage'
import { LoginPage } from '../pages/login/LoginPage'
import { CategoriesPage } from '../pages/master/CategoriesPage'
import { CompaniesPage } from '../pages/master/CompaniesPage'
import { DashboardPage } from '../pages/master/DashboardPage'
import { LessonsPage } from '../pages/master/LessonsPage'
import { ReportsPage } from '../pages/master/ReportsPage'
import { SettingsPage } from '../pages/master/SettingsPage'
import { UsersPage } from '../pages/master/UsersPage'
import { FirstLoginGate } from './FirstLoginGate'
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

      {/* Юридические тексты — публичные: их открывают и из футера лендинга,
          и с экрана согласий (в новой вкладке, ещё до входа в портал). */}
      <Route path={LEGAL_PATHS.privacy} element={<PrivacyPage />} />
      <Route path={LEGAL_PATHS.terms} element={<TermsPage />} />

      {/* Первый вход. Здесь только проверка сессии — шлюза FirstLoginGate нет
          намеренно, иначе он отправлял бы страницы шагов на самих себя.
          Порядок шагов и выход из сценария решает FirstLoginLayout. */}
      <Route
        element={
          <ProtectedRoute>
            <FirstLoginLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={FIRST_LOGIN_PATHS.password}
          element={<FirstLoginPasswordPage />}
        />
        <Route
          path={FIRST_LOGIN_PATHS.consents}
          element={<FirstLoginConsentsPage />}
        />
      </Route>

      {/* Роут без своего пути: даёт всем страницам master общий каркас
          (боковое меню / нижние табы) за одной проверкой авторизации.
          Сами страницы подставляются в <Outlet /> внутри MasterLayout. */}
      <Route
        element={
          <ProtectedRoute>
            {/* Незакрытый первый вход в портал не пускает: сначала пароль,
                потом согласия (docs/07-api-reference.md). */}
            <FirstLoginGate>
              <MasterLayout />
            </FirstLoginGate>
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
