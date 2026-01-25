"""
Утилиты для работы с пользователями
"""


def get_user_data(user):
    """Получить данные пользователя для ответа"""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "user_type": user.user_type,
        "full_name": user.full_name,
        "phone": user.phone,
        "organization_name": user.organization_name if user.user_type == 'agent' else None,
        "inn": user.inn if user.user_type == 'agent' else None,
    }

