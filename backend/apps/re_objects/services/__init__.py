"""
Сервисы для работы с объектами недвижимости.
"""
from .premise_service import (
    PremiseFilterParams,
    get_premise_list,
    get_premise_by_uuid,
    get_filtered_premise_queryset,
    get_buildings_for_filter,
    get_buildings_catalogue,
    get_building_by_uuid,
    parse_building_uuids,
)

__all__ = [
    "PremiseFilterParams",
    "get_premise_list",
    "get_premise_by_uuid",
    "get_filtered_premise_queryset",
    "get_buildings_for_filter",
    "get_buildings_catalogue",
    "get_building_by_uuid",
    "parse_building_uuids",
]
