"""
Публичный API обратной связи.
"""
from asgiref.sync import sync_to_async
from django.core.exceptions import ValidationError
from ninja import Router

from api.schemas import ProblemDetail

from .errors import FeedbackErrorCodes, create_feedback_error
from .models import Feedback
from .schemas import FeedbackCreateIn, FeedbackOut

feedback_router = Router(tags=['Feedback'])


def _validation_error_detail(exc: ValidationError) -> str:
    if getattr(exc, 'message_dict', None):
        parts = []
        for field, msgs in exc.message_dict.items():
            if isinstance(msgs, list):
                parts.append(f'{field}: {"; ".join(str(m) for m in msgs)}')
            else:
                parts.append(f'{field}: {msgs}')
        return '; '.join(parts)
    return '; '.join(str(m) for m in exc.messages)


@feedback_router.post(
    '/',
    response={201: FeedbackOut, 400: ProblemDetail, 500: ProblemDetail},
    summary='Отправить обратную связь',
    description=(
        'Публичная отправка формы: имя, email, телефон (необязательно), тема, сообщение. '
        'В БД создаётся запись со статусом «Новое».'
    ),
)
async def create_feedback(request, data: FeedbackCreateIn):
    def _save():
        obj = Feedback(
            name=data.name.strip(),
            email=data.email.strip(),
            phone=(data.phone or '').strip()[:20],
            subject=data.subject.strip(),
            message=data.message.strip(),
        )
        obj.full_clean()
        obj.save()
        return obj

    try:
        obj = await sync_to_async(_save)()
    except ValidationError as e:
        return 400, create_feedback_error(
            status=400,
            code=FeedbackErrorCodes.VALIDATION_ERROR,
            title='Validation error',
            detail=_validation_error_detail(e),
            instance='/api/v1/feedback/',
        )
    except Exception as e:
        return 500, create_feedback_error(
            status=500,
            code=FeedbackErrorCodes.FEEDBACK_CREATION_ERROR,
            title='Could not save feedback',
            detail=str(e),
            instance='/api/v1/feedback/',
        )

    return 201, FeedbackOut(
        id=obj.id,
        name=obj.name,
        email=obj.email,
        phone=obj.phone or '',
        subject=obj.subject,
        message=obj.message,
        status=obj.status,
        created_at=obj.created_at,
    )
