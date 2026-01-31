# Хранение медиафайлов (модели с миксинами)

Система использует отдельные модели для каждого типа медиафайлов с переиспользованием кода через миксин `MediaFilesMixin`.

## Структура моделей

- `PremiseImage` - изображения помещений
- `BuildingImage` - изображения зданий
- `BuildingVideo` - видео зданий

Все модели наследуются от `MediaFilesMixin`, который содержит общие поля:
- `title` - название файла
- `order` - порядок отображения
- `created_at`, `updated_at` - временные метки
- `file_url` - property для получения URL файла

## Варианты хранения

Система поддерживает два варианта хранения медиафайлов:
1. **Локальное хранение** (по умолчанию) - файлы сохраняются на диске сервера
2. **MinIO** - файлы сохраняются в S3-совместимом объектном хранилище

## Локальное хранение (по умолчанию)

Файлы сохраняются в директорию, указанную в `MEDIA_ROOT` (по умолчанию `/var/lib/aregrp-data/media/`).

Структура хранения:
```
media/
  premises/
    {premise_id}/
      images/
        image1.jpg
        image2.png
  buildings/
    {building_id}/
      images/
        facade.jpg
        interior.jpg
      videos/
        tour.mp4
```

## Настройка MinIO

### 1. Установка MinIO

#### Docker Compose (рекомендуется)

Добавьте в `docker-compose.yml`:

```yaml
services:
  minio:
    image: minio/minio:latest
    container_name: aregrp-minio
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - /var/lib/aregrp-data/minio:/data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    networks:
      - django-network
```

#### Или установка на сервере

```bash
# Скачать MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Запустить MinIO
minio server /var/lib/aregrp-data/minio --console-address ":9001"
```

### 2. Создание bucket в MinIO

1. Откройте MinIO Console: http://localhost:9001
2. Войдите с учетными данными (по умолчанию: minioadmin/minioadmin)
3. Создайте bucket с именем `aregrp-media`
4. Настройте политику доступа: `public read-only` для bucket

### 3. Настройка Django

Добавьте в `.env` файл:

```env
# Включить использование MinIO
USE_MINIO=True

# Настройки MinIO
AWS_S3_ENDPOINT_URL=http://minio:9000
AWS_STORAGE_BUCKET_NAME=aregrp-media
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_REGION_NAME=us-east-1
AWS_S3_USE_SSL=False
AWS_S3_VERIFY=False
```

### 4. Переключение между хранилищами

Для переключения между локальным хранением и MinIO измените переменную `USE_MINIO`:

- `USE_MINIO=False` - локальное хранение
- `USE_MINIO=True` - MinIO

**Важно:** При переключении существующие файлы не мигрируются автоматически.

## Ограничения

- **Ограничений на количество файлов нет**
- **Поддерживаемые форматы**:
  - Изображения: jpg, jpeg, png, webp, gif
  - Видео: mp4, mov, avi, webm

## Использование в коде

### Работа с изображениями помещений

```python
from apps.re_objects.models import Premise, PremiseImage

# Получить все изображения помещения
premise = Premise.objects.get(id=1)
images = PremiseImage.objects.filter(premise=premise).order_by('order')

# Получить основное изображение
primary_image = PremiseImage.objects.filter(
    premise=premise,
    is_primary=True
).first()

# Создать новое изображение
image = PremiseImage.objects.create(
    premise=premise,
    file=uploaded_file,
    title='Интерьер помещения',
    order=0,
    is_primary=True
)
```

### Работа с изображениями зданий

```python
from apps.re_objects.models import Building, BuildingImage

# Получить все изображения здания
building = Building.objects.get(id=1)
images = BuildingImage.objects.filter(building=building).order_by('order')

# Получить изображения по категории
facade_images = BuildingImage.objects.filter(
    building=building,
    category='фасад'
).order_by('order')

interior_images = BuildingImage.objects.filter(
    building=building,
    category='интерьер'
).order_by('order')

# Получить основное изображение
primary_image = BuildingImage.objects.filter(
    building=building,
    is_primary=True
).first()

# Создать новое изображение с категорией
image = BuildingImage.objects.create(
    building=building,
    file=uploaded_file,
    title='Фасад здания',
    category='фасад',
    order=0,
    is_primary=True
)
```

### Работа с видео зданий

```python
from apps.re_objects.models import Building, BuildingVideo

# Получить все видео здания
building = Building.objects.get(id=1)
videos = BuildingVideo.objects.filter(building=building).order_by('order')

# Получить видео по категории
tour_videos = BuildingVideo.objects.filter(
    building=building,
    category='тур'
).order_by('order')

# Создать новое видео с категорией
video = BuildingVideo.objects.create(
    building=building,
    file=video_file,
    title='Виртуальный тур',
    category='тур',
    order=0
)
```

### Использование через related_name

```python
# Получить изображения через related_name
premise = Premise.objects.get(id=1)
images = premise.images.all()  # Все изображения

# Получить основное изображение
primary_image = premise.images.filter(is_primary=True).first()

# То же самое для зданий
building = Building.objects.get(id=1)
images = building.images.all()
videos = building.videos.all()

# Получить изображения по категории
facade_images = building.images.filter(category='фасад')
interior_images = building.images.filter(category='интерьер')

# Получить видео по категории
tour_videos = building.videos.filter(category='тур')
```

## Структура БД

**Таблица `re_premise_images`:**
```
id | premise_id | file                    | title      | order | is_primary | created_at
---|------------|-------------------------|------------|-------|------------|------------
1  | 123        | premises/123/images/img1.jpg | Фото 1  | 0     | true       | 2026-01-26
2  | 123        | premises/123/images/img2.jpg | Фото 2  | 1     | false      | 2026-01-26
```

**Таблица `re_building_images`:**
```
id | building_id | file                      | title      | category | order | is_primary | created_at
---|-------------|---------------------------|------------|----------|-------|------------|------------
1  | 45          | buildings/45/images/facade.jpg | Фасад   | фасад    | 0     | true       | 2026-01-26
2  | 45          | buildings/45/images/interior.jpg | Интерьер | интерьер | 1   | false      | 2026-01-26
```

**Таблица `re_building_videos`:**
```
id | building_id | file                      | title      | category | order | created_at
---|-------------|---------------------------|------------|----------|-------|------------
1  | 45          | buildings/45/videos/tour.mp4 | Виртуальный тур | тур | 0   | 2026-01-26
```

## Преимущества архитектуры с миксинами

1. **Переиспользование кода** - общие поля и методы в миксине
2. **Отдельные таблицы** - каждая модель имеет свою таблицу (быстрые запросы)
3. **Гибкость** - легко добавить специфичные поля для каждого типа
4. **Работа с S3** - через `DEFAULT_FILE_STORAGE` из settings (автоматически)
5. **Простая админка** - inline для каждой модели прямо в админке Premise/Building

## Работа с S3

S3 работает автоматически через `DEFAULT_FILE_STORAGE` в settings:
- Если `USE_MINIO=True` - файлы сохраняются в MinIO
- Если `USE_MINIO=False` - файлы сохраняются локально

Все FileField и ImageField автоматически используют storage из `DEFAULT_FILE_STORAGE`.
