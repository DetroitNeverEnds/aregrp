# Generated manually for bookings MVP

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("re_objects", "0015_alter_premise_human_price"),
    ]

    operations = [
        migrations.CreateModel(
            name="Booking",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "deal_type",
                    models.CharField(
                        choices=[("rent", "Аренда"), ("sale", "Продажа")],
                        max_length=10,
                        verbose_name="Тип сделки",
                    ),
                ),
                ("expires_at", models.DateTimeField(verbose_name="Истекает")),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Создано")),
                (
                    "premise",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bookings",
                        to="re_objects.premise",
                        verbose_name="Помещение",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bookings",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Пользователь",
                    ),
                ),
            ],
            options={
                "verbose_name": "Бронь",
                "verbose_name_plural": "Брони",
                "db_table": "bookings_booking",
                "ordering": ["-created_at"],
            },
        ),
    ]
