"""
Сервис для отправки email
"""
from asgiref.sync import sync_to_async
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


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
        # Формируем ссылку для сброса пароля
        reset_url = f"{settings.FRONTEND_URL}/password-reset/confirm?token={token}"
        
        # Текст письма
        subject = "Password Reset Request"
        
        # Простой текстовый вариант письма
        message = f"""
Hello {user.username},

You requested a password reset for your account.

Please click the following link to reset your password:
{reset_url}

This link will expire in {settings.PASSWORD_RESET_TOKEN_LIFETIME_HOURS} hours.

If you did not request this password reset, please ignore this email.

Best regards,
Your App Team
"""
        
        # Пытаемся использовать HTML шаблон, если он существует
        try:
            html_message = render_to_string(
                'accounts/password_reset_email.html',
                {
                    'user': user,
                    'reset_url': reset_url,
                    'token_lifetime_hours': settings.PASSWORD_RESET_TOKEN_LIFETIME_HOURS,
                }
            )
            plain_message = strip_tags(html_message)
        except Exception:
            # Если шаблон не найден, используем простой текст
            html_message = None
            plain_message = message
        
        # Отправляем email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        # Логируем ошибку, но не прерываем выполнение
        # В production лучше использовать proper logging
        return False

