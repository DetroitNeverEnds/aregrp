"""
Создание обращений обратной связи.
"""

from django.core.exceptions import ValidationError
from django.db import DatabaseError

from .errors import FeedbackErrorCodes, create_feedback_error
from .models import Feedback
from .schemas import FeedbackCreateIn, FeedbackOut


def _to_out(f: Feedback) -> FeedbackOut:
    return FeedbackOut(
        id=f.id,
        name=f.name,
        email=f.email,
        phone=f.phone or '',
        subject=f.subject or '',
        message=f.message or '',
        status=f.status,
        created_at=f.created_at,
    )


def create_feedback(data: FeedbackCreateIn) -> tuple[FeedbackOut | None, tuple[int, dict] | None]:
    """
    Создаёт запись обратной связи. Возвращает (FeedbackOut, None) или (None, (status, problem)).
    """
    fb = Feedback(
        name=data.name.strip(),
        email='',
        phone=data.phone.strip(),
        subject=data.subject.strip(),
        message=data.message or '',
    )
    try:
        fb.full_clean()
        fb.save()
    except ValidationError as e:
        return None, (
            400,
            create_feedback_error(
                status=400,
                code=FeedbackErrorCodes.VALIDATION_ERROR,
                title='Validation error',
                detail=str(e),
                instance='/api/v1/feedback',
            ),
        )
    except DatabaseError as e:
        return None, (
            500,
            create_feedback_error(
                status=500,
                code=FeedbackErrorCodes.FEEDBACK_CREATION_ERROR,
                title='Feedback creation failed',
                detail=str(e),
                instance='/api/v1/feedback',
            ),
        )
    return _to_out(fb), None
