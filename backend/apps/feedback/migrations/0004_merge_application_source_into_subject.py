# Generated manually: subject заменяет application_source

from django.db import migrations, models


def merge_application_source_into_subject(apps, schema_editor):
    Feedback = apps.get_model('feedback', 'Feedback')
    for row in Feedback.objects.all():
        src = (getattr(row, 'application_source', None) or '').strip()
        sub = (row.subject or '').strip()
        row.subject = (src or sub)[:255]
        row.save(update_fields=['subject'])


class Migration(migrations.Migration):

    dependencies = [
        ('feedback', '0003_alter_feedback_email_alter_feedback_message_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feedback',
            name='subject',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Источник заявки: страница, кампания, UTM и т.п.',
                max_length=255,
                verbose_name='Тема',
            ),
        ),
        migrations.RunPython(merge_application_source_into_subject, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='feedback',
            name='application_source',
        ),
    ]
