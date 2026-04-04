from datetime import datetime

from ninja import Schema


class PremiseBriefOut(Schema):
    uuid: str
    name: str


class BuildingBriefOut(Schema):
    uuid: str
    name: str


class ProfilePremiseRowOut(Schema):
    """Строка таблицы «Объекты» в ЛК; поля зависят от query=rent|sale и типа пользователя."""

    premise: PremiseBriefOut
    building: BuildingBriefOut
    commission: int | None = None
    rent_expires_at: datetime | None = None
    contract_type: str | None = None
    contract_expires_at: datetime | None = None


class ProfilePremisesListResponse(Schema):
    """Как у списков re_objects: items, total, page, page_size, total_pages."""

    items: list[ProfilePremiseRowOut]
    total: int
    page: int
    page_size: int
    total_pages: int
