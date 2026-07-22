"""
Эндпоинты категорий.

Управление (master):
- POST   /api/category/   создать (parent_id=None → верхний уровень)
- PATCH  /api/category/   обновить
- DELETE /api/category/   удалить (только пустую)

Каталог (любой залогиненный):
- GET /api/categories/    дерево категорий; для рабочих — только те, где есть
  видимые им уроки; для привилегированных/master — все.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user, require_master
from app.schemas.category import (
    CategoryCreateIn,
    CategoryOut,
    CategoryTreeOut,
    CategoryUpdateIn,
)
from app.services import category_service, lesson_service

router = APIRouter()


@router.post(
    "/category/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED, tags=["categories"]
)
def create_category(
    body: CategoryCreateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> CategoryOut:
    """Создать категорию/подкатегорию. Access: master."""
    try:
        category = category_service.create(db, body.name, body.parent_id, body.order)
    except category_service.CategoryError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    return CategoryOut.model_validate(category)


@router.patch("/category/", response_model=CategoryOut, tags=["categories"])
def update_category(
    body: CategoryUpdateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> CategoryOut:
    """Обновить категорию (имя/порядок). Access: master."""
    category = category_service.get(db, body.id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    category = category_service.update(db, category, body.name, body.order)
    return CategoryOut.model_validate(category)


@router.delete("/category/", tags=["categories"])
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> dict:
    """Удалить пустую категорию (без подкатегорий и уроков). Access: master."""
    category = category_service.get(db, id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    try:
        category_service.delete(db, category)
    except category_service.CategoryError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    return {"status": "deleted", "id": id}


@router.get("/categories/", response_model=list[CategoryTreeOut], tags=["categories"])
def list_categories(
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
) -> list[CategoryTreeOut]:
    """
    Дерево категорий (два уровня). Access: любой залогиненный.
    Рабочие видят только категории, где есть доступные им уроки;
    привилегированные/master — все категории.
    """
    all_categories = category_service.list_all(db)

    # какие категории оставить
    if actor.role.is_privileged:
        allowed_ids = {c.id for c in all_categories}
    else:
        # категории, где есть хотя бы один видимый пользователю урок
        visible = lesson_service.list_visible(db, actor)
        cats_with_lessons = {l.category_id for l in visible}
        # показываем такие категории + их родителей (чтобы дерево не разорвалось)
        allowed_ids = set(cats_with_lessons)
        by_id = {c.id: c for c in all_categories}
        for cid in list(cats_with_lessons):
            cat = by_id.get(cid)
            if cat and cat.parent_id:
                allowed_ids.add(cat.parent_id)

    tops = [c for c in all_categories if c.parent_id is None and c.id in allowed_ids]
    result: list[CategoryTreeOut] = []
    for top in tops:
        subs = [
            CategoryOut.model_validate(c)
            for c in all_categories
            if c.parent_id == top.id and c.id in allowed_ids
        ]
        node = CategoryTreeOut.model_validate(top)
        node.subcategories = subs
        result.append(node)
    return result
