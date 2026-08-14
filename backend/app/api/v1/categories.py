"""
Эндпоинты категорий.

Управление (master):
- POST   /api/category/       создать (parent_id=None → верхний уровень)
- PATCH  /api/category/       обновить (имя, перенос по parent_id)
- DELETE /api/category/       удалить (только пустую)
- POST   /api/category/move/  сдвинуть на позицию вверх/вниз

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
    CategoryMoveIn,
    CategoryOut,
    CategoryTreeOut,
    CategoryUpdateIn,
    build_category_out,
    build_category_tree_out,
)
from app.services import category_service, lesson_service

router = APIRouter()


def _category_out(db: Session, category) -> CategoryOut:
    """Ответ по одной категории: модель + два точечных COUNT-а для счётчиков."""
    return build_category_out(
        category,
        category_service.count_lessons(db, category.id),
        category_service.count_subcategories(db, category.id),
    )


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
        category = category_service.create(db, body.name, body.parent_id)
    # те же коды и тексты, что и при переносе в PATCH: правило дерева — 400,
    # «родителя нет» — 422 (наследник ловится первым)
    except category_service.CategoryTreeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except category_service.CategoryError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    return _category_out(db, category)


@router.patch("/category/", response_model=CategoryOut, tags=["categories"])
def update_category(
    body: CategoryUpdateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> CategoryOut:
    """
    Обновить категорию: имя и/или уровень (parent_id). Access: master.
    parent_id=null переносит категорию наверх, поэтому «не трогать родителя»
    означает не присылать поле совсем — это и проверяет model_fields_set.
    При переносе категория встаёт в конец нового уровня.
    """
    category = category_service.get(db, body.id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    try:
        category = category_service.update(
            db,
            category,
            body.name,
            body.parent_id,
            change_parent="parent_id" in body.model_fields_set,
        )
    # сначала правила дерева (400), потом «не найдено» (422) — порядок важен,
    # CategoryTreeError наследуется от CategoryError
    except category_service.CategoryTreeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except category_service.CategoryError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    return _category_out(db, category)


@router.post("/category/move/", tags=["categories"])
def move_category(
    body: CategoryMoveIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_master),
) -> dict:
    """
    Сдвинуть категорию на одну позицию вверх/вниз внутри своего уровня.
    Если она уже крайняя — статус "noop" (не ошибка). Access: master.
    """
    category = category_service.get(db, body.id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    result = category_service.move(db, category, body.direction)
    return {"status": result, "id": body.id}


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

    Счётчики в узлах показывают ПОЛНОЕ число уроков/подкатегорий в категории,
    без поправки на видимость: это характеристика самой категории.
    """
    all_categories = category_service.list_all(db)
    # два агрегирующих запроса на всё дерево вместо запроса на каждый узел
    lessons_counts = category_service.lessons_count_by_category(db)
    subs_counts = category_service.subcategories_count_by_parent(db)

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

    def counts(category) -> tuple[int, int]:
        """Счётчики узла: нет ключа в словаре = в категории пусто."""
        return lessons_counts.get(category.id, 0), subs_counts.get(category.id, 0)

    tops = [c for c in all_categories if c.parent_id is None and c.id in allowed_ids]
    result: list[CategoryTreeOut] = []
    for top in tops:
        subs = [
            build_category_out(c, *counts(c))
            for c in all_categories
            if c.parent_id == top.id and c.id in allowed_ids
        ]
        result.append(build_category_tree_out(top, *counts(top), subs))
    return result
