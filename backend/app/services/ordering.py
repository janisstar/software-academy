"""
Общие правила порядка (order) для контента: категорий и уроков.

Порядок всегда считается внутри «ряда соседей»:
  - для категории ряд — записи с тем же parent_id (верхний уровень — parent_id IS NULL);
  - для урока ряд — уроки той же category_id.

Клиент значения order не присылает: при создании сервис ставит запись в конец
ряда, а переставляют её только move-эндпоинты (обмен местами с соседом).
"""

from sqlalchemy import func, select
from sqlalchemy.orm import Session


def next_order(db: Session, model, row_filter) -> int:
    """Следующий свободный order в ряду: max + 1 (пустой ряд → 1)."""
    current_max = db.execute(
        select(func.max(model.order)).where(row_filter)
    ).scalar()
    return (current_max or 0) + 1


def move_in_row(db: Session, model, entity, direction: str, row_filter) -> str:
    """
    Сдвинуть запись на одну позицию вверх/вниз внутри ряда.

    Возвращает "moved" или "noop" (запись уже первая/последняя).
    Один commit на всю операцию: нормализация дублей и обмен — одной транзакцией.
    """
    row = list(
        db.execute(
            select(model).where(row_filter).order_by(model.order, model.id)
        ).scalars().all()
    )

    # страховка на случай старых данных, где у всех order=0: если в ряду есть
    # повторы, перенумеровываем весь ряд подряд (1, 2, 3, ...) — иначе обмен
    # одинаковых значений ничего не изменит
    orders = [e.order for e in row]
    if len(set(orders)) != len(orders):
        for position, item in enumerate(row, start=1):
            item.order = position

    index = next(i for i, e in enumerate(row) if e.id == entity.id)
    neighbor_index = index - 1 if direction == "up" else index + 1

    status = "noop"
    if 0 <= neighbor_index < len(row):
        neighbor = row[neighbor_index]
        entity.order, neighbor.order = neighbor.order, entity.order
        status = "moved"

    db.commit()
    return status
