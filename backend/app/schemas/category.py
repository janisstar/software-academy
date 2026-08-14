"""
Схемы для категорий.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict


class CategoryCreateIn(BaseModel):
    """POST /api/category/ — создать (master). parent_id=None → верхний уровень.
    order не передаётся: категория встаёт в конец своего уровня."""
    name: str
    parent_id: int | None = None


class CategoryUpdateIn(BaseModel):
    """PATCH /api/category/ — обновить (master). Меняется только переданное.
    Порядок здесь не меняется — только через POST /api/category/move/.

    parent_id особенный: у него None — это осмысленное значение («поднять на
    верхний уровень»), а не «не трогать». Поэтому «не трогать» = не присылать
    поле вообще; роут отличает одно от другого через model_fields_set."""
    id: int
    name: str | None = None
    parent_id: int | None = None


class CategoryMoveIn(BaseModel):
    """POST /api/category/move/ — сдвинуть на одну позицию внутри своего уровня."""
    id: int
    direction: Literal["up", "down"]


class CategoryOut(BaseModel):
    """Категория без вложенности (используется как узел дерева)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    parent_id: int | None
    order: int
    # счётчики — НЕ колонки таблицы, их считают в БД и передают снаружи
    # (как users_count у компаний). Дефолта нарочно нет: забытый счётчик
    # должен упасть на разработке, а не молча показать ноль.
    lessons_count: int         # уроки самой категории, без уроков подкатегорий
    subcategories_count: int   # прямые подкатегории


class CategoryTreeOut(CategoryOut):
    """Категория верхнего уровня со списком подкатегорий."""
    subcategories: list[CategoryOut] = []


def build_category_out(
    category, lessons_count: int, subcategories_count: int
) -> CategoryOut:
    """Собрать узел дерева из модели + посчитанные счётчики."""
    return CategoryOut(
        id=category.id,
        name=category.name,
        slug=category.slug,
        parent_id=category.parent_id,
        order=category.order,
        lessons_count=lessons_count,
        subcategories_count=subcategories_count,
    )


def build_category_tree_out(
    category,
    lessons_count: int,
    subcategories_count: int,
    subcategories: list[CategoryOut],
) -> CategoryTreeOut:
    """То же самое для верхнего уровня — плюс уже собранные подкатегории."""
    node = build_category_out(category, lessons_count, subcategories_count)
    return CategoryTreeOut(**node.model_dump(), subcategories=subcategories)
