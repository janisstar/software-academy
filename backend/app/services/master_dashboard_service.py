"""
Бизнес-логика master-дашборда: сводка «здоровья платформы».

Все числа считаем прямо в БД через func.count() — строки в память не грузим,
поэтому запрос остаётся быстрым даже когда пользователей и прогресса много.
Никакой разбивки прогресса по людям или компаниям: только анонимные агрегаты.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.company import Company
from app.models.lesson import Lesson
from app.models.progress import COMPLETED, LessonProgress
from app.models.role import Role
from app.models.session import UserSession
from app.models.user import User
from app.schemas.master_dashboard import (
    ActivityBlock,
    CompaniesBlock,
    ContentBlock,
    MasterDashboardOut,
    RecentBlock,
    RecentCompany,
    RecentUser,
    TopLesson,
    UsersBlock,
)

# Окно «онлайн сейчас»: пользователь считается онлайн, если его сессию видели
# за последние 10 минут. last_seen_at обновляется на каждом авторизованном
# запросе (auth_service.get_user_by_session).
ONLINE_WINDOW_MINUTES = 10

# Сколько элементов показываем в топе уроков и в блоке «недавнее»
TOP_LESSONS_LIMIT = 5
RECENT_LIMIT = 5


def _count(db: Session, model, condition=None) -> int:
    """SELECT COUNT(*) по таблице модели, опционально с условием WHERE."""
    stmt = select(func.count()).select_from(model)
    if condition is not None:
        stmt = stmt.where(condition)
    return db.execute(stmt).scalar_one()


def _companies_block(db: Session) -> CompaniesBlock:
    return CompaniesBlock(
        total=_count(db, Company),
        locked=_count(db, Company, Company.is_locked.is_(True)),
    )


def _users_block(db: Session) -> UsersBlock:
    return UsersBlock(
        total=_count(db, User),
        locked=_count(db, User, User.is_locked.is_(True)),
        pending_first_login=_count(db, User, User.must_change_password.is_(True)),
    )


def _content_block(db: Session) -> ContentBlock:
    return ContentBlock(
        categories=_count(db, Category),
        lessons=_count(db, Lesson),
        public_lessons=_count(db, Lesson, Lesson.is_public.is_(True)),
    )


def _top_lessons(db: Session) -> list[TopLesson]:
    """
    Топ-5 уроков по числу завершений (по убыванию).
    INNER JOIN + фильтр по статусу → уроки без завершений в топ не попадают.
    """
    completions = func.count(LessonProgress.id)
    rows = db.execute(
        select(Lesson.id, Lesson.title, completions.label("completions"))
        .join(LessonProgress, LessonProgress.lesson_id == Lesson.id)
        .where(LessonProgress.status == COMPLETED)
        .group_by(Lesson.id, Lesson.title)
        .order_by(completions.desc())
        .limit(TOP_LESSONS_LIMIT)
    ).all()
    return [
        TopLesson(id=row.id, title=row.title, completions=row.completions)
        for row in rows
    ]


def _activity_block(db: Session) -> ActivityBlock:
    since = datetime.now(timezone.utc) - timedelta(minutes=ONLINE_WINDOW_MINUTES)
    # DISTINCT: у одного человека может быть несколько сессий (телефон + ноутбук)
    online_now = db.execute(
        select(func.count(func.distinct(UserSession.user_id)))
        .where(UserSession.last_seen_at >= since)
    ).scalar_one()

    return ActivityBlock(
        online_now=online_now,
        completions_total=_count(db, LessonProgress, LessonProgress.status == COMPLETED),
        top_lessons=_top_lessons(db),
    )


def _recent_block(db: Session) -> RecentBlock:
    companies = db.execute(
        select(Company.id, Company.name, Company.created_at)
        .order_by(Company.created_at.desc())
        .limit(RECENT_LIMIT)
    ).all()

    # join к companies и roles — чтобы сразу отдать название компании и ключ роли
    users = db.execute(
        select(
            User.id,
            User.username,
            User.name,
            Company.name.label("company_name"),
            Role.key.label("role_key"),
            User.created_at,
        )
        .join(Company, Company.id == User.company_id)
        .join(Role, Role.id == User.role_id)
        .order_by(User.created_at.desc())
        .limit(RECENT_LIMIT)
    ).all()

    return RecentBlock(
        companies=[
            RecentCompany(id=c.id, name=c.name, created_at=c.created_at)
            for c in companies
        ],
        users=[
            RecentUser(
                id=u.id,
                un=u.username,
                name=u.name,
                company_name=u.company_name,
                role_key=u.role_key,
                created_at=u.created_at,
            )
            for u in users
        ],
    )


def get_master_dashboard(db: Session) -> MasterDashboardOut:
    """Собрать всю сводку платформы для master-интерфейса."""
    return MasterDashboardOut(
        companies=_companies_block(db),
        users=_users_block(db),
        content=_content_block(db),
        activity=_activity_block(db),
        recent=_recent_block(db),
    )
