# Generated manually: human_price denormalized field + backfill

from decimal import Decimal

from django.db import migrations, models


def _compute_human_price(p) -> Decimal:
    if p.available_for_sale:
        if p.price_per_month is not None and p.price_per_month > 0:
            return p.price_per_month
        if p.price_per_sqm is not None and p.area is not None:
            return (p.area * p.price_per_sqm).quantize(Decimal("0.01"))
        return p.price_per_month if p.price_per_month is not None else Decimal("0")
    if p.available_for_rent:
        return p.price_per_month if p.price_per_month is not None else Decimal("0")
    return Decimal("0")


def forwards_fill_human_price(apps, schema_editor):
    Premise = apps.get_model("re_objects", "Premise")
    for p in Premise.objects.all().iterator():
        hp = _compute_human_price(p)
        Premise.objects.filter(pk=p.pk).update(human_price=hp)


def backwards_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("re_objects", "0013_floor_schema_svg"),
    ]

    operations = [
        migrations.AddField(
            model_name="premise",
            name="human_price",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0"),
                help_text="Денормализованное значение для API и агрегации по зданиям: при продаже — итоговая стоимость объекта; при аренде — цена за месяц. Пересчитывается при сохранении.",
                max_digits=12,
                verbose_name="Цена для выдачи, ₽",
            ),
        ),
        migrations.RunPython(forwards_fill_human_price, backwards_noop),
    ]
