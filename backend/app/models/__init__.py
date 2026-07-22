# Здесь собираются все модели таблиц.
# Импорт в одном месте помогает Alembic "видеть" их и связям (relationship) — резолвиться.
from app.models.role import Role  # noqa: F401
from app.models.company import Company  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.session import UserSession  # noqa: F401
from app.models.password_reset_code import PasswordResetCode  # noqa: F401
from app.models.user_consent import UserConsent  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.lesson import Lesson, lesson_roles  # noqa: F401
from app.models.progress import LessonProgress  # noqa: F401
