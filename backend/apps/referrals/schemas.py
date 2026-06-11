from datetime import datetime
from uuid import UUID

from ninja import Schema


class ReferralLinkCreateIn(Schema):
    premise_uuid: UUID
    phone: str


class ReferralLinkOut(Schema):
    code: str
    url: str
    premise_uuid: str
    created_at: datetime

