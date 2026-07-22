# Здесь собираются все модели таблиц.
# Импорт в одном месте помогает Alembic "видеть" их и связям (relationship) — резолвиться.
from app.models.role import Role  # noqa: F401
from app.models.company import Company  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.session import UserSession  # noqa: F401
