"""
Обработка загруженных изображений и видео: производные WebP для карточки и детального просмотра.

Фото: из оригинала — card (вписать в 560×300 без обрезки) и detail (до 1920×1080, contain).
Видео: кадр через ffmpeg → тот же принцип для card WebP.
"""
from __future__ import annotations

import contextlib
import io
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

# Максимальный прямоугольник для превью карточки (contain — целиком вписать, без crop).
CARD_SIZE = (560, 300)
DETAIL_MAX = (1920, 1080)
WEBP_QUALITY = 85


class FFmpegNotFoundError(RuntimeError):
    """Бинарник ffmpeg недоступен в PATH."""


def _to_rgb(image: Image.Image) -> Image.Image:
    if image.mode == 'RGB':
        return image
    if image.mode == 'RGBA':
        bg = Image.new('RGB', image.size, (255, 255, 255))
        bg.paste(image, mask=image.split()[3])
        return bg
    if image.mode == 'P':
        return image.convert('RGBA').convert('RGB')
    return image.convert('RGB')


def _first_frame_raster(im: Image.Image) -> Image.Image:
    """Первый кадр (GIF/WebP-анимация и т.п.)."""
    im.seek(0)
    frame = im.copy()
    return _to_rgb(frame)


def _bytes_to_rgb_image(data: bytes) -> Image.Image:
    im = Image.open(io.BytesIO(data))
    if getattr(im, 'n_frames', 1) > 1:
        return _first_frame_raster(im)
    return _to_rgb(im)


def _image_to_webp_bytes(image: Image.Image) -> bytes:
    buf = io.BytesIO()
    image.save(buf, format='WEBP', quality=WEBP_QUALITY, method=6)
    return buf.getvalue()


def process_raster_bytes(data: bytes) -> tuple[ContentFile, ContentFile]:
    """
    Из байтов растрового изображения — card и detail WebP.

    Returns:
        (card ContentFile, detail ContentFile)
    """
    rgb = _bytes_to_rgb_image(data)
    detail_img = ImageOps.contain(rgb, DETAIL_MAX, method=Image.Resampling.LANCZOS)
    card_img = ImageOps.contain(rgb, CARD_SIZE, method=Image.Resampling.LANCZOS)
    card_cf = ContentFile(_image_to_webp_bytes(card_img), name='card.webp')
    detail_cf = ContentFile(_image_to_webp_bytes(detail_img), name='detail.webp')
    return card_cf, detail_cf


def _video_input_path(field_file) -> tuple[str, bool]:
    """
    Путь к файлу для ffmpeg и флаг «временный — удалить после использования».
    """
    storage = field_file.storage
    name = field_file.name
    if not name:
        raise ValueError('Пустое имя видеофайла')
    try:
        local_path = storage.path(name)
        if os.path.isfile(local_path):
            return local_path, False
    except NotImplementedError:
        pass
    suffix = Path(name).suffix or '.mp4'
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_path = tmp.name
    try:
        with field_file.open('rb') as src, open(tmp_path, 'wb') as dst:
            shutil.copyfileobj(src, dst)
    except Exception:
        with contextlib.suppress(OSError):
            os.unlink(tmp_path)
        raise
    return tmp_path, True


def video_file_to_card_webp(field_file) -> ContentFile:
    """
    Первый кадр видео → card.webp (вписать в 560×300 без обрезки).

    Args:
        field_file: django FieldFile сохранённого видео.
    """
    if not shutil.which('ffmpeg'):
        raise FFmpegNotFoundError(
            'ffmpeg не найден в PATH; установите ffmpeg для превью видео.'
        )
    video_path, is_temp = _video_input_path(field_file)
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_png:
        png_path = tmp_png.name
    try:
        result = subprocess.run(
            [
                'ffmpeg',
                '-nostdin',
                '-y',
                '-i',
                video_path,
                '-vframes',
                '1',
                '-q:v',
                '2',
                png_path,
            ],
            check=False,
            capture_output=True,
            timeout=120,
        )
        if result.returncode != 0:
            err = (result.stderr or b'').decode('utf-8', errors='replace')[-500:]
            raise RuntimeError(f'ffmpeg завершился с кодом {result.returncode}: {err}')
        with open(png_path, 'rb') as f:
            frame_data = f.read()
        rgb = _bytes_to_rgb_image(frame_data)
        card_img = ImageOps.contain(rgb, CARD_SIZE, method=Image.Resampling.LANCZOS)
        return ContentFile(_image_to_webp_bytes(card_img), name='card.webp')
    finally:
        if is_temp:
            with contextlib.suppress(OSError):
                os.unlink(video_path)
        with contextlib.suppress(OSError):
            os.unlink(png_path)
