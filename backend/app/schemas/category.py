"""
Схемы для категорий.
"""

from pydantic import BaseModel, ConfigDict


class CategoryCreateIn(BaseModel):
    """POST /api/category/ — создать (master). parent_id=None → верхний уровень."""
    name: str
    parent_id: int | None = None
    order: int = 0


class CategoryUpdateIn(BaseModel):
    """PATCH /api/category/ — обновить (master). Меняется только переданное."""
    id: int
    name: str | None = None
    order: int | None = None


class CategoryOut(BaseModel):
    """Категория без вложенности (используется как узел дерева)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    parent_id: int | None
    order: int


class CategoryTreeOut(CategoryOut):
    """Категория верхнего уровня со списком подкатегорий."""
    subcategories: list[CategoryOut] = []
