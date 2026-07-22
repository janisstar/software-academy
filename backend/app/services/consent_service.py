"""
Бизнес-логика согласий (Privacy Policy / Terms & Conditions).

Актуальные версии берём из конфига. Пользователь считается «согласившимся»,
только если принял ТЕКУЩУЮ версию каждого обязательного документа.
"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user_consent import UserConsent

PRIVACY_POLICY = "privacy_policy"
TERMS = "terms_and_conditions"

# какой документ какой версии сейчас обязателен
REQUIRED_VERSIONS = {
    PRIVACY_POLICY: settings.PRIVACY_POLICY_VERSION,
    TERMS: settings.TERMS_VERSION,
}


def accept(db: Session, user_id: int, document: str) -> None:
    """Зафиксировать согласие с текущей версией документа (create-or-update)."""
    version = REQUIRED_VERSIONS[document]
    existing = db.execute(
        select(UserConsent)
        .where(UserConsent.user_id == user_id)
        .where(UserConsent.document == document)
    ).scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if existing is None:
        db.add(UserConsent(user_id=user_id, document=document, version=version, accepted_at=now))
    else:
        existing.version = version
        existing.accepted_at = now
    db.commit()


def pending_documents(db: Session, user_id: int) -> list[str]:
    """
    Какие обязательные документы пользователь ещё НЕ принял
    (или принял устаревшую версию). Пустой список = всё принято.
    """
    accepted = {
        row.document: row.version
        for row in db.execute(
            select(UserConsent).where(UserConsent.user_id == user_id)
        ).scalars().all()
    }
    pending = []
    for document, required_version in REQUIRED_VERSIONS.items():
        if accepted.get(document) != required_version:
            pending.append(document)
    return pending
