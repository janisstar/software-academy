import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from '../pages/landing/LandingPage'
import { LoginPage } from '../pages/login/LoginPage'
import { MasterHomePage } from '../pages/master/MasterHomePage'
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
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <MasterHomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
