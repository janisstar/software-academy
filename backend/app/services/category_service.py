"""
Бизнес-логика категорий.

Два уровня: у подкатегории parent должен быть верхнего уровня (его parent_id = NULL).
"""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.text import unique_slug
from app.models.category import Category
from app.models.lesson import Lesson
from app.services import ordering


class CategoryError(Exception):
    """Ошибка бизнес-правил категорий (роут превратит в HTTP 4xx)."""


class CategoryTreeError(CategoryError):
    """
    Нарушено правило формы дерева (глубина, петля, перенос категории с детьми).
    Отдельный класс нужен, чтобы роут отдал на это 400, а на «объект не найден»
    остался 422. Наследуется от CategoryError, поэтому старые except продолжают
    ловить оба случая.
    """


def get(db: Session, category_id: int) -> Category | None:
    return db.execute(
        select(Category).where(Category.id == category_id)
    ).scalar_one_or_none()


def _row_filter(parent_id: int | None):
    """Ряд соседей категории: записи того же уровня (у верхнего parent_id IS NULL)."""
    return Category.parent_id == parent_id


def _check_parent(db: Session, parent_id: int) -> None:
    """
    Родитель должен существовать и сам быть верхнего уровня (глубже двух не идём).
    Общая проверка для создания и для переноса — тексты и коды у них одинаковые.
    """
    parent = get(db, parent_id)
    if parent is None:
        raise CategoryError("Category not found")
    if parent.parent_id is not None:
        raise CategoryTreeError("Max category depth is 2")


def _set_parent(db: Session, category: Category, parent_id: int | None) -> None:
    """
    Перенести категорию на другой уровень: parent_id=None → наверх,
    иначе внутрь указанной категории верхнего уровня.
    В новом ряду категория встаёт в конец.
    """
    if parent_id is not None:
        # петлю ловим первой: сюда категория приходит уже найденной, поэтому
        # проверка «существует ли родитель» на этом случае всё равно бы прошла
        if parent_id == category.id:
            raise CategoryTreeError("Category cannot be its own parent")
        _check_parent(db, parent_id)
        # иначе получилось бы три уровня: родитель → эта категория → её дети
        if category.children:
            raise CategoryTreeError(
                "Category with subcategories cannot become a subcategory"
            )
    category.parent_id = parent_id
    category.order = ordering.next_order(db, Category, _row_filter(parent_id))


def create(db: Session, name: str, parent_id: int | None) -> Category:
    if parent_id is not None:
        _check_parent(db, parent_id)
    category = Category(
        name=name,
        slug=unique_slug(db, Category, name),
        parent_id=parent_id,
        # новая категория встаёт в конец своего уровня
        order=ordering.next_order(db, Category, _row_filter(parent_id)),
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update(
    db: Session,
    category: Category,
    name: str | None,
    parent_id: int | None = None,
    change_parent: bool = False,
) -> Category:
    """
    Обновить категорию. change_parent=False → parent_id вообще не трогаем
    (поле не прислали); True → переносим, в том числе на верхний уровень
    при parent_id=None.
    """
    # перенос делаем первым: он единственный может упасть с CategoryError,
    # и тогда имя не должно оказаться изменённым
    if change_parent and parent_id != category.parent_id:
        _set_parent(db, category, parent_id)
    if name is not None:
        category.name = name
    db.commit()
    db.refresh(category)
    return category


def move(db: Session, category: Category, direction: str) -> str:
    """Сдвинуть категорию на одну позицию в своём уровне. → "moved" | "noop"."""
    return ordering.move_in_row(
        db, Category, category, direction, _row_filter(category.parent_id)
    )


def delete(db: Session, category: Category) -> None:
    # запрещаем удалять непустую категорию, чтобы не осиротить уроки/подкатегории
    if category.children:
        raise CategoryError("Category has subcategories")
    has_lessons = db.execute(
        select(Lesson.id).where(Lesson.category_id == category.id).limit(1)
    ).first()
    if has_lessons:
        raise CategoryError("Category has lessons")
    db.delete(category)
    db.commit()


def list_all(db: Session) -> list[Category]:
    return list(db.execute(select(Category).order_by(Category.order, Category.id)).scalars().all())


def count_lessons(db: Session, category_id: int) -> int:
    """Сколько уроков в одной категории (COUNT в БД, строки в память не грузим)."""
    return db.execute(
        select(func.count(Lesson.id)).where(Lesson.category_id == category_id)
    ).scalar_one()


def count_subcategories(db: Session, category_id: int) -> int:
    """Сколько прямых подкатегорий у одной категории."""
    return db.execute(
        select(func.count(Category.id)).where(Category.parent_id == category_id)
    ).scalar_one()


def lessons_count_by_category(db: Session) -> dict[int, int]:
    """
    {id категории: сколько в ней уроков} — ОДНИМ запросом (COUNT + GROUP BY).

    Категории без уроков в результат не попадают, поэтому читать словарь надо
    через .get(id, 0): отсутствие ключа и есть настоящий ноль.
    """
    rows = db.execute(
        select(Lesson.category_id, func.count(Lesson.id)).group_by(Lesson.category_id)
    ).all()
    return {row[0]: row[1] for row in rows}


def subcategories_count_by_parent(db: Session) -> dict[int, int]:
    """{id родителя: сколько у него прямых подкатегорий} — тоже одним запросом."""
    rows = db.execute(
        select(Category.parent_id, func.count(Category.id))
        .where(Category.parent_id.is_not(None))
        .group_by(Category.parent_id)
    ).all()
    return {row[0]: row[1] for row in rows}
