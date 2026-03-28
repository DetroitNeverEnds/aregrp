import time
from decimal import Decimal
from typing import Any

import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q

from apps.re_objects.models import Building

YANDEX_GEOCODE_URL = 'https://geocode-maps.yandex.ru/v1/'


def _quantize_coord(value: Decimal) -> Decimal:
    return value.quantize(Decimal('0.000001'))


class Command(BaseCommand):
    help = 'Заполняет latitude/longitude у зданий через Yandex Geocoder API (строка: город, адрес).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Геокодировать все здания, даже если координаты уже заданы',
        )

    def handle(self, *args: Any, **options):
        api_key = settings.YANDEX_GEOCODER_API_KEY
        if not api_key:
            raise CommandError('Задайте YANDEX_GEOCODER_API_KEY в окружении или .env')

        qs = Building.objects.select_related('city')
        if not options['all']:
            qs = qs.filter(Q(latitude__isnull=True) | Q(longitude__isnull=True))

        total = qs.count()
        self.stdout.write(f'Зданий к обработке: {total}')

        for i, building in enumerate(qs.iterator(), start=1):
            if not building.address or not building.address.strip():
                self.stderr.write(self.style.WARNING(f'[{i}/{total}] id={building.pk} пропуск: пустой address'))
                continue

            geocode_str = f'{building.city.name}, {building.address}'
            try:
                r = requests.get(
                    YANDEX_GEOCODE_URL,
                    params={
                        'apikey': api_key,
                        'geocode': geocode_str,
                        'lang': 'ru_RU',
                        'format': 'json',
                    },
                    timeout=15,
                )
            except requests.RequestException as e:
                self.stderr.write(self.style.ERROR(f'[{i}/{total}] id={building.pk} запрос: {e}'))
                time.sleep(0.25)
                continue

            try:
                data = r.json()
            except ValueError:
                self.stderr.write(
                    self.style.ERROR(f'[{i}/{total}] id={building.pk} не JSON, status={r.status_code}')
                )
                time.sleep(0.25)
                continue

            if r.status_code != 200:
                msg = data.get('message', r.text[:200])
                self.stderr.write(
                    self.style.ERROR(f'[{i}/{total}] id={building.pk} HTTP {r.status_code}: {msg}')
                )
                time.sleep(0.25)
                continue

            try:
                members = data['response']['GeoObjectCollection']['featureMember']
                if not members:
                    self.stderr.write(
                        self.style.WARNING(f'[{i}/{total}] id={building.pk} нет результатов: {geocode_str!r}')
                    )
                    time.sleep(0.25)
                    continue
                pos = members[0]['GeoObject']['Point']['pos']
                lon_s, lat_s = pos.split()
                building.longitude = _quantize_coord(Decimal(lon_s))
                building.latitude = _quantize_coord(Decimal(lat_s))
                building.save()
            except (KeyError, IndexError, ValueError) as e:
                self.stderr.write(
                    self.style.ERROR(f'[{i}/{total}] id={building.pk} разбор ответа: {e!r}')
                )
                time.sleep(0.25)
                continue

            self.stdout.write(
                self.style.SUCCESS(
                    f'[{i}/{total}] id={building.pk} ok: {building.latitude}, {building.longitude} ({geocode_str!r})'
                )
            )
            time.sleep(0.25)

        self.stdout.write(self.style.SUCCESS('Готово.'))
