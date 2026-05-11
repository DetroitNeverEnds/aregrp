from ninja import Schema


class PaymentCreateIn(Schema):
    premise_id: int


class PaymentAmountOut(Schema):
    value: str
    currency: str


class PaymentConfirmationOut(Schema):
    type: str
    confirmation_url: str | None = None


class PaymentCreateOut(Schema):
    id: str
    status: str
    paid: bool
    amount: PaymentAmountOut
    description: str
    premise_id: int
    confirmation: PaymentConfirmationOut
    created_at: str | None = None
