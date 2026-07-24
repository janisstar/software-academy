import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../components/HomePage'
import { LoginPage } from '../components/LoginPage'
import { ProtectedRoute } from '../components/ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
