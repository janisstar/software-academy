"""
Бизнес-логика уроков + правило видимости по роли.

Видимость: урок виден пользователю, если
  is_public ИЛИ роль привилегированная ИЛИ роль в списке ролей урока.
Управление контентом (create/update/delete) — только master (проверяется в роуте).
"""

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.text import unique_slug
from app.models.lesson import Lesson
from app.models.progress import NOT_STARTED, LessonProgress
from app.models.role import Role
from app.models.user import User
from app.schemas.lesson import LessonWithStatus
from app.services import ordering, progress_service


class LessonError(Exception):
    """Ошибка бизнес-правил уроков (роут превратит в HTTP 4xx)."""


def _resolve_roles(db: Session, role_keys: list[str]) -> list[Role]:
    """Ключи ролей → объекты Role. Неизвестный ключ — ошибка."""
    roles: list[Role] = []
    for key in role_keys:
        role = db.execute(select(Role).where(Role.key == key)).scalar_one_or_none()
        if role is None:
            raise LessonError(f"Unknown role: {key}")
        roles.append(role)
    return roles


def get(db: Session, lesson_id: int) -> Lesson | None:
    return db.execute(
        select(Lesson)
        .options(joinedload(Lesson.roles))
        .where(Lesson.id == lesson_id)
    ).unique().scalar_one_or_none()


def _row_filter(category_id: int):
    """Ряд соседей урока: уроки той же категории."""
    return Lesson.category_id == category_id


def create(db: Session, data, ) -> Lesson:
    from app.models.category import Category

    if db.get(Category, data.category_id) is None:
        raise LessonError("Category not found")
    lesson = Lesson(
        title=data.title,
        slug=unique_slug(db, Lesson, data.title),
        description=data.description,
        duration_seconds=data.duration_seconds,
        vimeo_id=data.vimeo_id,
        thumbnail_url=data.thumbnail_url,
        transcript=data.transcript,
        category_id=data.category_id,
        is_public=data.is_public,
        # новый урок встаёт в конец своей категории
        order=ordering.next_order(db, Lesson, _row_filter(data.category_id)),
    )
    lesson.roles = _resolve_roles(db, data.roles)
    db.add(lesson)
    db.commit()
    return get(db, lesson.id)


def update(db: Session, lesson: Lesson, data) -> Lesson:
    from app.models.category import Category

    if data.category_id is not None and data.category_id != lesson.category_id:
        if db.get(Category, data.category_id) is None:
            raise LessonError("Category not found")
        lesson.category_id = data.category_id
        # при переносе урок встаёт в конец новой категории
        lesson.order = ordering.next_order(db, Lesson, _row_filter(data.category_id))
    for field in ("title", "vimeo_id", "description", "duration_seconds",
                  "thumbnail_url", "transcript", "is_public"):
        value = getattr(data, field)
        if value is not None:
            setattr(lesson, field, value)
    # roles=None → не трогаем; roles=[] → очистить; иначе — заменить набор
    if data.roles is not None:
        lesson.roles = _resolve_roles(db, data.roles)
    db.commit()
    return get(db, lesson.id)


def move(db: Session, lesson: Lesson, direction: str) -> str:
    """Сдвинуть урок на одну позицию в своей категории. → "moved" | "noop"."""
    return ordering.move_in_row(
        db, Lesson, lesson, direction, _row_filter(lesson.category_id)
    )


def delete(db: Session, lesson: Lesson) -> None:
    db.delete(lesson)  # строки lesson_roles уберутся каскадом
    db.commit()


def is_visible(user: User, lesson: Lesson) -> bool:
    if lesson.is_public:
        return True
    if user.role.is_privileged:
        return True
    return any(r.id == user.role_id for r in lesson.roles)


def list_visible(
    db: Session, user: User, category_id: int | None = None
) -> list[Lesson]:
    """Уроки, видимые пользователю (опционально в одной категории), по порядку."""
    stmt = select(Lesson).options(joinedload(Lesson.roles)).order_by(Lesson.order, Lesson.id)
    if category_id is not None:
        stmt = stmt.where(Lesson.category_id == category_id)
    lessons = db.execute(stmt).unique().scalars().all()
    return [l for l in lessons if is_visible(user, l)]


def _with_status(lesson: Lesson, progress: LessonProgress | None) -> LessonWithStatus:
    """
    Урок + мой статус по нему.

    ЕДИНСТВЕННОЕ место, где записано правило «записи прогресса нет — значит
    урок ещё не начат». Им пользуются и каталог, и Dashboard, и Reports.
    """
    return LessonWithStatus(
        id=lesson.id,
        title=lesson.title,
        slug=lesson.slug,
        description=lesson.description,
        duration_seconds=lesson.duration_seconds,
        thumbnail_url=lesson.thumbnail_url,
        category_id=lesson.category_id,
        order=lesson.order,
        status=progress.status if progress else NOT_STARTED,
        watch_percent=progress.watch_percent if progress else 0,
    )


def list_visible_with_status(
    db: Session, user: User, category_id: int | None = None
) -> tuple[list[LessonWithStatus], dict[int, LessonProgress]]:
    """
    Видимые пользователю уроки со статусом его прогресса — то же, что
    list_visible, плюс склейка с прогрессом. Порядок и правило видимости
    не меняются.

    Вторым значением возвращается прогресс по id урока: Dashboard строит по
    нему ряд «недавно смотренные» и признак новичка, и запрашивать его второй
    раз незачем. Каталогу он не нужен — там его игнорируют.
    """
    lessons = list_visible(db, user, category_id=category_id)
    progress = {p.lesson_id: p for p in progress_service.list_for_user(db, user.id)}
    items = [_with_status(lesson, progress.get(lesson.id)) for lesson in lessons]
    return items, progress


def list_all_for_master(db: Session) -> list[Lesson]:
    """
    ВСЕ уроки для таблицы управления master: без фильтра видимости.

    Порядок: сгруппированно по категориям (в порядке самих категорий),
    внутри категории — по порядку урока.
    selectinload вместо joinedload: роли догружаются одним отдельным запросом,
    поэтому join с категорией не размножает строки уроков (нет N+1 и нет .unique()).
    """
    from app.models.category import Category

    stmt = (
        select(Lesson)
        .options(selectinload(Lesson.roles))
        .join(Category, Lesson.category_id == Category.id)
        .order_by(Category.order, Category.id, Lesson.order, Lesson.id)
    )
    return list(db.execute(stmt).scalars().all())
