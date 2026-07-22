"""
Схемы для уроков.

Видимость задаётся при создании/редактировании (пункт 3 обсуждения):
roles — список ключей ролей; is_public=true — «виден всем» (roles можно не указывать).
"""

from pydantic import BaseModel, ConfigDict


class LessonCreateIn(BaseModel):
    """POST /api/lesson/ — создать урок (master)."""
    title: str
    vimeo_id: str
    category_id: int
    description: str | None = None
    duration_seconds: int = 0
    thumbnail_url: str | None = None
    transcript: str | None = None
    order: int = 0
    # видимость (финальный шаг публикации)
    is_public: bool = False
    roles: list[str] = []          # ключи ролей: ["user", "fitter", ...]


class LessonUpdateIn(BaseModel):
    """PATCH /api/lesson/ — обновить урок (master). Меняется только переданное.
    roles=None — не трогать видимость; roles=[] — очистить список ролей."""
    id: int
    title: str | None = None
    vimeo_id: str | None = None
    category_id: int | None = None
    description: str | None = None
    duration_seconds: int | None = None
    thumbnail_url: str | None = None
    transcript: str | None = None
    order: int | None = None
    is_public: bool | None = None
    roles: list[str] | None = None


class LessonCardOut(BaseModel):
    """Краткая карточка урока для каталога (без транскрипта)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    description: str | None
    duration_seconds: int
    thumbnail_url: str | None
    category_id: int
    order: int


class LessonOut(BaseModel):
    """Полный урок (для плеера и для master): с транскриптом и видимостью."""
    id: int
    title: str
    slug: str
    description: str | None
    duration_seconds: int
    vimeo_id: str
    thumbnail_url: str | None
    transcript: str | None
    category_id: int
    is_public: bool
    order: int
    roles: list[str]               # ключи ролей, которым виден урок


def build_lesson_out(lesson) -> LessonOut:
    """Собрать LessonOut из модели (roles — как список ключей)."""
    return LessonOut(
        id=lesson.id,
        title=lesson.title,
        slug=lesson.slug,
        description=lesson.description,
        duration_seconds=lesson.duration_seconds,
        vimeo_id=lesson.vimeo_id,
        thumbnail_url=lesson.thumbnail_url,
        transcript=lesson.transcript,
        category_id=lesson.category_id,
        is_public=lesson.is_public,
        order=lesson.order,
        roles=[r.key for r in lesson.roles],
    )
