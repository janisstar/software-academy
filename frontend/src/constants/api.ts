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
  // Дерево категорий каталога: два уровня, порядок задаёт бэкенд.
  categories: `${API_BASE_PATH}/categories/`,
  // Одна категория: POST — создать, PATCH — переименовать или перенести,
  // DELETE — удалить (только пустую). Что менять, передаётся в теле; id для
  // удаления — в строке запроса (`?id=`), как и у остальных DELETE.
  category: `${API_BASE_PATH}/category/`,
  // Сдвиг категории на одну позицию внутри своего уровня.
  categoryMove: `${API_BASE_PATH}/category/move/`,
  // Учебный каталог: уроки, видимые текущей роли, со статусом ЕГО прогресса.
  // Фильтр `?category_id=` берёт только саму категорию, без подкатегорий.
  lessons: `${API_BASE_PATH}/lessons/`,
  // Таблица всех уроков для управления: доступна только master. Учебный
  // список каталога (`/api/lessons/`) — другой эндпоинт и другие поля.
  masterLessons: `${API_BASE_PATH}/master/lessons/`,
  // Один урок: POST — создать, PATCH — изменить, DELETE — удалить (`?id=`).
  // Чтение одного урока — этот же путь плюс id: `${lesson}${id}`.
  lesson: `${API_BASE_PATH}/lesson/`,
  // Сдвиг урока на одну позицию внутри своей категории.
  lessonMove: `${API_BASE_PATH}/lesson/move/`,
  roles: `${API_BASE_PATH}/roles/`,
  dashboard: `${API_BASE_PATH}/dashboard/`,
  // Сводка платформы: доступна только master, остальным бэкенд отвечает 403.
  masterDashboard: `${API_BASE_PATH}/master/dashboard/`,
  reports: `${API_BASE_PATH}/reports/`,
} as const
