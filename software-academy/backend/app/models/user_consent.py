"""
Таблица согласий пользователя (user_consents).

Фиксирует факт принятия юридических документов: КТО, КАКОЙ документ,
КАКУЮ версию и КОГДА принял. Это GDPR-требование — согласие должно быть
доказуемым и привязанным к версии документа.

Тексты самих документов здесь не хранятся (они статические на фронте) —
только факт согласия. Версии заданы в конфиге.
"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UserConsent(Base):
    __tablename__ = "user_consents"
    # одно согласие на пару (пользователь, документ) — при новой версии обновляем
    __table_args__ = (UniqueConstraint("user_id", "document", name="uq_user_document"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    # какой документ: "privacy_policy" | "terms_and_conditions"
    document: Mapped[str] = mapped_column(String(50))
    # версия документа, которую принял пользователь
    version: Mapped[str] = mapped_column(String(20))
    accepted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
