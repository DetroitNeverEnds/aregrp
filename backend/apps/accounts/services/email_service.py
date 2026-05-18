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
        reset_url = f"{settings.FRONTEND_AUTH_BASE_URL}/password-reset/confirm?token={token}"

        subject = "Восстановление пароля — Aregrp.ru"
        message = f"""
Здравствуйте, {user.username}!

Вы запросили восстановление пароля для аккаунта на сайте Aregrp.ru.

Чтобы задать новый пароль, перейдите по ссылке:
{reset_url}

Если вы не отправляли этот запрос, проигнорируйте письмо — пароль не изменится.

С уважением,
Команда Aregrp.ru
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
