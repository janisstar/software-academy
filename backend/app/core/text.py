"""
Небольшой помощник: превратить название в slug (кусок URL).

'Getting Started' -> 'getting-started'. Для нелатинских названий
(например кириллицы) вернём короткий случайный slug — чтобы URL всегда был валидным.
"""

import re
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or f"item-{secrets.token_hex(3)}"


def unique_slug(db: Session, model, base_value: str) -> str:
    """Сделать slug уникальным для таблицы model: base, base-2, base-3, ..."""
    base = slugify(base_value)
    candidate = base
    n = 2
    while db.execute(select(model).where(model.slug == candidate)).scalar_one_or_none():
        candidate = f"{base}-{n}"
        n += 1
    return candidate
