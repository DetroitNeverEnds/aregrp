"""
Публичный API обратной связи.
"""
from ninja import Router

from api.schemas import ProblemDetail

from .schemas import FeedbackCreateIn, FeedbackOut
from .services import create_feedback

feedback_router = Router(tags=['Feedback'])


@feedback_router.post(
    '/',
    response={201: FeedbackOut, 400: ProblemDetail, 500: ProblemDetail},
    summary='Отправить обращение',
    description='Создаёт заявку обратной связи (без аутентификации).',
)
def post_feedback(request, data: FeedbackCreateIn):
    out, err = create_feedback(data)
    if err:
        status, body = err
        return status, body
    return 201, out
