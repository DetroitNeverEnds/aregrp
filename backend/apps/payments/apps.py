from django.apps import AppConfig
from django.conf import settings

from yookassa import Configuration
from yookassa.domain.common.user_agent import Version



class PaymentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.payments"

    def ready(self) -> None:
        Configuration.configure(
            settings.PAYMENTS_ACCOUNT_ID,
            settings.PAYMENTS_SECRET_KEY,
        )

        Configuration.configure_user_agent(
            framework=Version("Django", "5.2.1"),
        )