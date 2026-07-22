"""
Бизнес-логика категорий.

Два уровня: у подкатегории parent должен быть верхнего уровня (его parent_id = NULL).
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.text import unique_slug
from app.models.category import Category
from app.models.lesson import Lesson


class CategoryError(Exception):
    """Ошибка бизнес-правил категорий (роут превратит в HTTP 4xx)."""


def get(db: Session, category_id: int) -> Category | None:
    return db.execute(
        select(Category).where(Category.id == category_id)
    ).scalar_one_or_none()


def create(db: Session, name: str, parent_id: int | None, order: int) -> Category:
    if parent_id is not None:
        parent = get(db, parent_id)
        if parent is None:
            raise CategoryError("Parent category not found")
        if parent.parent_id is not None:
            raise CategoryError("Only two levels are allowed (parent must be top-level)")
    category = Category(
        name=name,
        slug=unique_slug(db, Category, name),
        parent_id=parent_id,
        order=order,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update(
    db: Session, category: Category, name: str | None, order: int | None
) -> Category:
    if name is not None:
        category.name = name
    if order is not None:
        category.order = order
    db.commit()
    db.refresh(category)
    return category


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
