# Generated manually: RenameField file→original + card/detail (autodetector не справился с rename).

import apps.re_objects.models
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('re_objects', '0024_remove_premise_status'),
    ]

    operations = [
        migrations.RenameField(
            model_name='premiseimage',
            old_name='file',
            new_name='original',
        ),
        migrations.RenameField(
            model_name='buildingimage',
            old_name='file',
            new_name='original',
        ),
        migrations.AddField(
            model_name='premiseimage',
            name='card',
            field=models.ImageField(
                blank=True,
                help_text='WebP 560×300, генерируется из оригинала',
                null=True,
                storage=None,
                upload_to=apps.re_objects.models.premise_image_upload_path,
                validators=[
                    django.core.validators.FileExtensionValidator(allowed_extensions=['webp'])
                ],
                verbose_name='Превью карточки',
            ),
        ),
        migrations.AddField(
            model_name='premiseimage',
            name='detail',
            field=models.ImageField(
                blank=True,
                help_text='WebP до Full HD, генерируется из оригинала',
                null=True,
                storage=None,
                upload_to=apps.re_objects.models.premise_image_upload_path,
                validators=[
                    django.core.validators.FileExtensionValidator(allowed_extensions=['webp'])
                ],
                verbose_name='Детальное изображение',
            ),
        ),
        migrations.AddField(
            model_name='buildingimage',
            name='card',
            field=models.ImageField(
                blank=True,
                help_text='WebP 560×300',
                null=True,
                storage=None,
                upload_to=apps.re_objects.models.building_image_upload_path,
                validators=[
                    django.core.validators.FileExtensionValidator(allowed_extensions=['webp'])
                ],
                verbose_name='Превью карточки',
            ),
        ),
        migrations.AddField(
            model_name='buildingimage',
            name='detail',
            field=models.ImageField(
                blank=True,
                help_text='WebP до Full HD',
                null=True,
                storage=None,
                upload_to=apps.re_objects.models.building_image_upload_path,
                validators=[
                    django.core.validators.FileExtensionValidator(allowed_extensions=['webp'])
                ],
                verbose_name='Детальное изображение',
            ),
        ),
        migrations.AddField(
            model_name='buildingvideo',
            name='card',
            field=models.ImageField(
                blank=True,
                help_text='WebP 560×300 с первого кадра (ffmpeg)',
                null=True,
                storage=None,
                upload_to=apps.re_objects.models.building_video_card_upload_path,
                validators=[
                    django.core.validators.FileExtensionValidator(allowed_extensions=['webp'])
                ],
                verbose_name='Превью карточки',
            ),
        ),
    ]
