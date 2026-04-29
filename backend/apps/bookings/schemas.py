from datetime import datetime
from uuid import UUID

from ninja import Schema


class BookingCreateIn(Schema):
    premise_uuid: UUID
    deal_type: str


class BookingOut(Schema):
    """Бронь: premise_name — название помещения (title), не номер для схемы этажа."""

    id: int
    premise_uuid: str
    premise_name: str
    building_uuid: str
    building_name: str
    building_address: str
    deal_type: str
    expires_at: datetime
    created_at: datetime
