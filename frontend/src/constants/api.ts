export const API_BASE_PATH = '/api'

export const API_ENDPOINTS = {
  login: `${API_BASE_PATH}/login/`,
  logout: `${API_BASE_PATH}/logout/`,
  me: `${API_BASE_PATH}/me/`,
  acceptPrivacy: `${API_BASE_PATH}/accept_privacy_policy/`,
  acceptTerms: `${API_BASE_PATH}/accept_terms_and_conditions/`,
  changePassword: `${API_BASE_PATH}/user/change-password/`,
  passwordResetConfirm: `${API_BASE_PATH}/user/password-reset/confirm/`,
  // Код сброса пароля, который привилегированная роль выдаёт человеку офлайн.
  adminResetCode: `${API_BASE_PATH}/admin/password-reset/code/`,
  generatePassword: `${API_BASE_PATH}/generate/password/`,
  companies: `${API_BASE_PATH}/companies/`,
  // Создание компании. Изменения и удаления у компаний в API пока нет.
  company: `${API_BASE_PATH}/company/`,
  userCompany: `${API_BASE_PATH}/user/company/`,
  // Список пользователей: master видит всех (можно фильтровать ?companyid=),
  // остальные привилегированные роли — только свою компанию.
  users: `${API_BASE_PATH}/users/`,
  // Один пользователь: POST — создать, PATCH — изменить, DELETE — удалить.
  // Кого именно меняем, всегда передаётся в теле (`un`), а не в адресе.
  user: `${API_BASE_PATH}/user/`,
  userLock: `${API_BASE_PATH}/user/lock/`,
  roles: `${API_BASE_PATH}/roles/`,
  dashboard: `${API_BASE_PATH}/dashboard/`,
  // Сводка платформы: доступна только master, остальным бэкенд отвечает 403.
  masterDashboard: `${API_BASE_PATH}/master/dashboard/`,
  reports: `${API_BASE_PATH}/reports/`,
} as const
