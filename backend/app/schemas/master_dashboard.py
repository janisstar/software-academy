"""
Схемы для master-дашборда (GET /api/master/dashboard/).

Это сводка «здоровья платформы» для вендора: сколько компаний, пользователей,
контента и какая активность. Личного прогресса тут нет и быть не может —
прогресс строго личный (docs/06-api-conventions.md).
"""

from datetime import datetime

from pydantic import BaseModel


class CompaniesBlock(BaseModel):
    """Блок «Компании»."""
    total: int
    locked: int                 # is_locked = true


class UsersBlock(BaseModel):
    """Блок «Пользователи»."""
    total: int
    locked: int                 # is_locked = true
    pending_first_login: int    # must_change_password = true (ещё не входили)


class ContentBlock(BaseModel):
    """Блок «Контент» — каталог общий для всех компаний."""
    categories: int
    lessons: int
    public_lessons: int         # is_public = true


class TopLesson(BaseModel):
    """Урок в топе по числу завершений."""
    id: int
    title: str
    completions: int


class ActivityBlock(BaseModel):
    """Блок «Активность» — только анонимные агрегаты по всей платформе."""
    online_now: int             # уникальные пользователи с недавней сессией
    completions_total: int      # всего завершённых уроков (всеми людьми)
    top_lessons: list[TopLesson]


class RecentCompany(BaseModel):
    """Недавно созданная компания."""
    id: int
    name: str
    created_at: datetime


class RecentUser(BaseModel):
    """Недавно созданный пользователь."""
    id: int
    un: str                     # username (в ответах API зовём его "un")
    name: str
    company_name: str
    role_key: str
    created_at: datetime


class RecentBlock(BaseModel):
    """Блок «Недавнее» — последние созданные компании и пользователи."""
    companies: list[RecentCompany]
    users: list[RecentUser]


class MasterDashboardOut(BaseModel):
    """GET /api/master/dashboard/ — сводка платформы для master."""
    companies: CompaniesBlock
    users: UsersBlock
    content: ContentBlock
    activity: ActivityBlock
    recent: RecentBlock
