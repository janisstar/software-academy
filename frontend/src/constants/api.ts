export const API_BASE_PATH = '/api'

export const API_ENDPOINTS = {
  login: `${API_BASE_PATH}/login/`,
  logout: `${API_BASE_PATH}/logout/`,
  me: `${API_BASE_PATH}/me/`,
  acceptPrivacy: `${API_BASE_PATH}/accept_privacy_policy/`,
  acceptTerms: `${API_BASE_PATH}/accept_terms_and_conditions/`,
  changePassword: `${API_BASE_PATH}/user/change-password/`,
  passwordResetConfirm: `${API_BASE_PATH}/user/password-reset/confirm/`,
  generatePassword: `${API_BASE_PATH}/generate/password/`,
  companies: `${API_BASE_PATH}/companies/`,
  userCompany: `${API_BASE_PATH}/user/company/`,
  roles: `${API_BASE_PATH}/roles/`,
  dashboard: `${API_BASE_PATH}/dashboard/`,
  // Сводка платформы: доступна только master, остальным бэкенд отвечает 403.
  masterDashboard: `${API_BASE_PATH}/master/dashboard/`,
  reports: `${API_BASE_PATH}/reports/`,
} as const
