"""
Сервисы для работы с объектами недвижимости.
"""
from .premise_service import (
    PremiseFilterParams,
    get_premise_list,
    get_premise_by_uuid,
    get_filtered_premise_queryset,
)

__all__ = [
    "PremiseFilterParams",
    "get_premise_list",
    "get_premise_by_uuid",
    "get_filtered_premise_queryset",
]
