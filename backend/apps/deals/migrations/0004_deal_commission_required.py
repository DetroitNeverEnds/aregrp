from django.db import migrations, models


def fill_null_commission(apps, schema_editor):
    Deal = apps.get_model('deals', 'Deal')
    Deal.objects.filter(commission_amount__isnull=True).update(commission_amount=0)


class Migration(migrations.Migration):

    dependencies = [
        ('deals', '0003_rename_contract_expires_to_signed_on'),
    ]

    operations = [
        migrations.RunPython(fill_null_commission, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='deal',
            name='commission_amount',
            field=models.PositiveBigIntegerField(
                help_text='Обязательно. В ЛК отображается только для агентов.',
                verbose_name='Комиссия, ₽',
            ),
        ),
    ]
