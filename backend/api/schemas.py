"""
Общие схемы для API, включая формат ошибок RFC 7807.
"""
from ninja import Schema
from typing import Optional


class ProblemDetail(Schema):
    """
    Формат ошибок по RFC 7807 (Problem Details for HTTP APIs).
    
    Используется для стандартизации всех ошибок API.
    """
    type: str  # URI типа ошибки
    status: int  # HTTP статус код
    title: str  # Краткое описание ошибки
    detail: str  # Детальное описание ошибки
    instance: Optional[str] = None  # URI ресурса, на котором произошла ошибка
    code: str  # Внутренний код ошибки для фронтенда
