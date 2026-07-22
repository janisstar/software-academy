"""
Безопасность: хеширование паролей и генерация токенов.

Пароли НИКОГДА не храним в открытом виде — только хеш Argon2id
(текущая рекомендация OWASP). Хеш нельзя "расшифровать" обратно:
при входе мы хешируем введённый пароль и сравниваем с сохранённым хешем.
"""

import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Параметры по умолчанию у argon2-cffi — разумные и современные.
_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Захешировать пароль (Argon2id). Результат кладём в users.password_hash."""
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Проверить пароль против сохранённого хеша. True — совпал."""
    try:
        return _hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def generate_session_token() -> str:
    """
    Случайный идентификатор сессии (~43 символа, криптостойкий).
    Он же — первичный ключ в таблице sessions и значение cookie.
    """
    return secrets.token_urlsafe(32)


def generate_temp_password(length: int = 12) -> str:
    """
    Временный пароль для нового пользователя (выдаётся админом офлайн).
    Без неоднозначных символов (l/1, O/0), чтобы легко продиктовать.
    """
    alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(alphabet) for _ in range(length))
