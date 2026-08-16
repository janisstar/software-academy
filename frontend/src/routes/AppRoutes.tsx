import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/app/AppLayout'
import { FirstLoginLayout } from '../components/login/FirstLoginLayout'
import { MasterLayout } from '../components/master/MasterLayout'
import {
  APP_PATHS,
  AUTH_PATHS,
  CONTENT_PATHS,
  FIRST_LOGIN_PATHS,
  LEGAL_PATHS,
  MASTER_HOME,
  PEOPLE_PATHS,
} from '../constants/routes'
import { AppDashboardPage } from '../pages/app/AppDashboardPage'
import { AppLessonsPage } from '../pages/app/AppLessonsPage'
import { AppReportsPage } from '../pages/app/AppReportsPage'
import { AppSettingsPage } from '../pages/app/AppSettingsPage'
import { LandingPage } from '../pages/landing/LandingPage'
import { PrivacyPage } from '../pages/legal/PrivacyPage'
import { TermsPage } from '../pages/legal/TermsPage'
import { FirstLoginConsentsPage } from '../pages/login/FirstLoginConsentsPage'
import { FirstLoginPasswordPage } from '../pages/login/FirstLoginPasswordPage'
import { ForgotPasswordPage } from '../pages/login/ForgotPasswordPage'
import { LoginPage } from '../pages/login/LoginPage'
import { CategoriesPage } from '../pages/master/CategoriesPage'
import { CompaniesPage } from '../pages/master/CompaniesPage'
import { DashboardPage } from '../pages/master/DashboardPage'
import { LessonFormPage } from '../pages/master/LessonFormPage'
import { LessonsPage } from '../pages/master/LessonsPage'
import { NewCompanyPage } from '../pages/master/NewCompanyPage'
import { NewUserPage } from '../pages/master/NewUserPage'
import { ReportsPage } from '../pages/master/ReportsPage'
import { SettingsPage } from '../pages/master/SettingsPage'
import { UserDetailPage } from '../pages/master/UserDetailPage'
import { UsersPage } from '../pages/master/UsersPage'
import { AreaGate } from './AreaGate'
import { ByRole } from './ByRole'
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

      {/* Восстановление доступа по коду — публичный экран: сессии у человека
          нет, поэтому ни ProtectedRoute, ни FirstLoginGate здесь не нужны. */}
      <Route
        path={AUTH_PATHS.forgotPassword}
        element={<ForgotPasswordPage />}
      />

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

      {/* Роут без своего пути: даёт страницам master общий каркас (боковое
          меню / нижние табы) за одной проверкой авторизации. Сами страницы
          подставляются в <Outlet /> внутри MasterLayout.
          AreaGate закрывает область от остальных ролей: им сюда нельзя,
          уводим на их собственный /dashboard. */}
      <Route
        element={
          <ProtectedRoute>
            {/* Незакрытый первый вход в портал не пускает: сначала пароль,
                потом согласия (docs/07-api-reference.md). */}
            <FirstLoginGate>
              <AreaGate area="master">
                <MasterLayout />
              </AreaGate>
            </FirstLoginGate>
          </ProtectedRoute>
        }
      >
        <Route path={MASTER_HOME} element={<DashboardPage />} />
        <Route path={CONTENT_PATHS.categories} element={<CategoriesPage />} />
        <Route path={CONTENT_PATHS.lessons} element={<LessonsPage />} />
        {/* Форма создания объявлена раньше страницы урока, чтобы «new»
            не был принят за id. */}
        <Route
          path={CONTENT_PATHS.newLesson}
          element={<LessonFormPage mode="new" />}
        />
        <Route
          path={CONTENT_PATHS.lessonPattern}
          element={<LessonFormPage mode="edit" />}
        />
      </Route>

      {/* Раздел People — общий для двух интерфейсов, поэтому оболочку выбирает
          роль: master открывает те же страницы в своей боковой панели, а
          admin / manager / site — внутри учебной шапки, не теряя навигацию по
          урокам. Сами страницы People при этом одни и те же.
          Рабочие роли сюда не допущены — AreaGate уводит их на /dashboard. */}
      <Route
        element={
          <ProtectedRoute>
            <FirstLoginGate>
              <AreaGate area="people">
                <ByRole master={<MasterLayout />} app={<AppLayout />} />
              </AreaGate>
            </FirstLoginGate>
          </ProtectedRoute>
        }
      >
        <Route path={PEOPLE_PATHS.users} element={<UsersPage />} />
        {/* Форма создания объявлена раньше страницы пользователя, чтобы
            «new» не был принят за логин. */}
        <Route path={PEOPLE_PATHS.newUser} element={<NewUserPage />} />
        <Route path={PEOPLE_PATHS.userPattern} element={<UserDetailPage />} />
      </Route>

      {/* Companies — только master: компании ведёт вендор (docs/06 §3).
          В учебной оболочке этих адресов нет вовсе, поэтому остальных уводим
          в соседний раздел People, а не на дашборд: список пользователей им
          доступен, и это ближайшее осмысленное место. */}
      <Route
        element={
          <ProtectedRoute>
            <FirstLoginGate>
              <AreaGate area="master" redirectTo={PEOPLE_PATHS.users}>
                <MasterLayout />
              </AreaGate>
            </FirstLoginGate>
          </ProtectedRoute>
        }
      >
        <Route path={PEOPLE_PATHS.companies} element={<CompaniesPage />} />
        <Route path={PEOPLE_PATHS.newCompany} element={<NewCompanyPage />} />
      </Route>

      {/* Учебная область: все роли, КРОМЕ master (master уроки не смотрит —
          AreaGate уводит его в свой интерфейс). */}
      <Route
        element={
          <ProtectedRoute>
            <FirstLoginGate>
              <AreaGate area="app">
                <AppLayout />
              </AreaGate>
            </FirstLoginGate>
          </ProtectedRoute>
        }
      >
        <Route path={APP_PATHS.dashboard} element={<AppDashboardPage />} />
        <Route path={APP_PATHS.lessons} element={<AppLessonsPage />} />
      </Route>

      {/* Reports и Settings — ОДИН адрес на два интерфейса: у master свой
          раздел, у остальных ролей — свой. Дважды объявить путь нельзя,
          поэтому и каркас, и страницу выбирает роль. */}
      <Route
        element={
          <ProtectedRoute>
            <FirstLoginGate>
              <ByRole master={<MasterLayout />} app={<AppLayout />} />
            </FirstLoginGate>
          </ProtectedRoute>
        }
      >
        <Route
          path={APP_PATHS.reports}
          element={<ByRole master={<ReportsPage />} app={<AppReportsPage />} />}
        />
        <Route
          path={APP_PATHS.settings}
          element={
            <ByRole master={<SettingsPage />} app={<AppSettingsPage />} />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
