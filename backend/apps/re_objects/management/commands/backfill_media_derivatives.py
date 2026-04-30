"""
Пересобрать card/detail для фото и card для видео из сохранённых оригиналов.

После миграции file → original или если производные отсутствуют:

  uv run manage.py backfill_media_derivatives
"""
from django.core.management.base import BaseCommand

from apps.re_objects.models import BuildingImage, BuildingVideo, PremiseImage


class Command(BaseCommand):
    help = 'Генерирует WebP card/detail из original (фото) и card из видео (ffmpeg).'

    def handle(self, *args, **options):
        n_img = 0
        n_vid = 0
        for model in (PremiseImage, BuildingImage):
            for obj in model.objects.iterator():
                if not obj.original:
                    continue
                if obj.card and obj.detail:
                    continue
                obj.save()
                n_img += 1
                self.stdout.write(f'{model.__name__} pk={obj.pk} OK')
        for vid in BuildingVideo.objects.iterator():
            if not vid.file:
                continue
            if vid.card:
                continue
            vid.save()
            n_vid += 1
            self.stdout.write(f'BuildingVideo pk={vid.pk} OK')
        self.stdout.write(
            self.style.SUCCESS(f'Готово: изображений обновлено {n_img}, видео {n_vid}.')
        )
