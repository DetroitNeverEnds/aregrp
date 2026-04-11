"""
Сервис для отправки email (только текст, без HTML-шаблонов).
"""
import logging

from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@sync_to_async
def send_password_reset_email(user, token):
    """
    Отправляет email с токеном для сброса пароля

    Args:
        user: Объект пользователя CustomUser
        token: JWT токен для сброса пароля

    Returns:
        bool: True если email отправлен успешно, False в случае ошибки
    """
    try:
        reset_url = f"{settings.FRONTEND_URL}/password-reset/confirm?token={token}"

        subject = 'Password Reset Request'
        message = f"""
Hello {user.username},

You requested a password reset for your account.

Please open the following link to reset your password:
{reset_url}

This link will expire in {settings.PASSWORD_RESET_TOKEN_LIFETIME_HOURS} hours.

If you did not request this password reset, please ignore this email.

Best regards,
Your App Team
"""

        send_mail(
            subject=subject,
            message=message.strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return True

    except Exception:
        logger.exception(
            'password_reset_email: send_mail failed',
            extra={'user_id': getattr(user, 'pk', None)},
        )
        return False
