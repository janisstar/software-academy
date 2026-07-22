"""
Схемы для смены и сброса пароля.
"""

from pydantic import BaseModel, Field

# Минимальная длина пароля (простое правило для MVP)
MIN_PASSWORD_LENGTH = 8


class ChangePasswordIn(BaseModel):
    """POST /api/user/change-password/ — смена своего пароля."""
    old_pw: str
    new_pw: str = Field(min_length=MIN_PASSWORD_LENGTH)


class ResetCodeRequestIn(BaseModel):
    """POST /api/admin/password-reset/code/ — админ просит код для пользователя."""
    un: str


class ResetCodeOut(BaseModel):
    """Ответ: код показываем ОДИН раз (дальше храним только хеш)."""
    un: str
    code: str
    expires_minutes: int


class ResetConfirmIn(BaseModel):
    """POST /api/user/password-reset/confirm/ — пользователь вводит код и новый пароль."""
    un: str
    code: str
    new_pw: str = Field(min_length=MIN_PASSWORD_LENGTH)
