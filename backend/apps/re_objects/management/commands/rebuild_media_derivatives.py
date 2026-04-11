"""
Полностью пересобрать производные медиа: удалить старые card/detail и сгенерировать заново из original.

  uv run manage.py rebuild_media_derivatives
  uv run manage.py rebuild_media_derivatives --dry-run

Для видео нужен ffmpeg в PATH (как при загрузке).
"""
from django.core.management.base import BaseCommand

from apps.re_objects.models import BuildingImage, BuildingVideo, PremiseImage


class Command(BaseCommand):
    help = 'Удаляет старые WebP-превью и пересоздаёт их из original (фото) / file (видео).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Только список записей, без изменений в БД и хранилище.',
        )

    def handle(self, *args, **options):
        dry_run: bool = options['dry_run']
        n_img_ok = 0
        n_vid_ok = 0
        errors: list[str] = []

        for model in (PremiseImage, BuildingImage):
            label = model.__name__
            for obj in model.objects.iterator():
                if not obj.original:
                    continue
                if dry_run:
                    self.stdout.write(f'{label} pk={obj.pk} (dry-run)')
                    n_img_ok += 1
                    continue
                try:
                    if obj.card:
                        obj.card.delete(save=False)
                    obj.card = None
                    if obj.detail:
                        obj.detail.delete(save=False)
                    obj.detail = None
                    obj.save()
                    n_img_ok += 1
                    self.stdout.write(f'{label} pk={obj.pk} OK')
                except Exception as exc:
                    errors.append(f'{label} pk={obj.pk}: {exc}')
                    self.stderr.write(self.style.ERROR(f'{label} pk={obj.pk}: {exc}'))

        for vid in BuildingVideo.objects.iterator():
            if not vid.file:
                continue
            if dry_run:
                self.stdout.write(f'BuildingVideo pk={vid.pk} (dry-run)')
                n_vid_ok += 1
                continue
            try:
                if vid.card:
                    vid.card.delete(save=False)
                vid.card = None
                vid.save()
                n_vid_ok += 1
                self.stdout.write(f'BuildingVideo pk={vid.pk} OK')
            except Exception as exc:
                errors.append(f'BuildingVideo pk={vid.pk}: {exc}')
                self.stderr.write(self.style.ERROR(f'BuildingVideo pk={vid.pk}: {exc}'))

        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Сухой прогон: изображений {n_img_ok}, видео {n_vid_ok}. Запустите без --dry-run для пересборки.'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Готово: изображений пересобрано {n_img_ok}, видео {n_vid_ok}.')
            )
        if errors:
            self.stderr.write(self.style.WARNING(f'Ошибок: {len(errors)}.'))
            raise SystemExit(1)
