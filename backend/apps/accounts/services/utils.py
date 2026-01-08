"""
Утилиты для работы с пользователями
"""


def get_user_data(user):
    """Получить данные пользователя для ответа"""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }

