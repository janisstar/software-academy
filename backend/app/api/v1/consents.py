"""
Эндпоинты согласий (GDPR). Пути — как в Welding Log.

- POST /api/accept_privacy_policy/       — принять политику конфиденциальности
- POST /api/accept_terms_and_conditions/ — принять условия использования

Тексты документов — на фронте; здесь фиксируется только факт+версия.
Что ещё не принято, видно в GET /api/me/ (поле pending_consents).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user
from app.services import consent_service

router = APIRouter()


@router.post("/accept_privacy_policy/", tags=["consents"])
def accept_privacy_policy(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Зафиксировать согласие с текущей версией Privacy Policy."""
    consent_service.accept(db, current_user.id, consent_service.PRIVACY_POLICY)
    return {"status": "accepted", "document": consent_service.PRIVACY_POLICY}


@router.post("/accept_terms_and_conditions/", tags=["consents"])
def accept_terms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Зафиксировать согласие с текущей версией Terms & Conditions."""
    consent_service.accept(db, current_user.id, consent_service.TERMS)
    return {"status": "accepted", "document": consent_service.TERMS}
