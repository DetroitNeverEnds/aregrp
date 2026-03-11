#!/usr/bin/env python3
"""
Скрипт создания полностью заполненного здания:
- 1 здание
- 3 этажа
- 5 медиа в каждый этаж (категория "этаж_N")
- 12 медиа здания с категориями: фасад, инфраструктура, вход, общие зоны (по 3 каждого типа)
- 1 помещение (чтобы здание отображалось в API)

Использование:
    python scripts/seed_full_building.py [--base-url URL] [--email EMAIL] [--password PASSWORD]
    python scripts/seed_full_building.py --base-url http://localhost:8000 --email admin@example.com --password admin

Требования: pip install requests
"""
import argparse
import random
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("Ошибка: установите requests: pip install requests")
    sys.exit(1)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXAMPLES_DIR = PROJECT_ROOT / "backend" / "examples"

# Категории медиа здания (по 3 каждого типа)
BUILDING_CATEGORIES = ["фасад", "инфраструктура", "вход", "общие зоны"]
MEDIA_PER_CATEGORY = 3

# Медиа для этажей (5 на этаж, категория "этаж_N")
MEDIA_PER_FLOOR = 5
FLOORS_COUNT = 3

# Файлы для медиа (могут повторяться)
BUILDING_IMAGE_FILES = ["buildig.png", "building2.png", "building3.jpeg"]
PREMISE_IMAGE_FILES = ["office.png", "office2.png", "office3.jpg", "office4.jpg"]


def log(msg: str) -> None:
    print(msg, flush=True)


def login(base_url: str, email: str, password: str) -> str | None:
    """Авторизация, возвращает access_token или None."""
    url = f"{base_url.rstrip('/')}/api/v1/auth/login"
    try:
        r = requests.post(url, json={"email": email, "password": password}, timeout=30)
        if r.status_code != 200:
            log(f"  Ошибка логина: {r.status_code} {r.text[:200]}")
            return None
        data = r.json()
        return data.get("access_token")
    except Exception as e:
        log(f"  Ошибка при логине: {e}")
        return None


def create_building(
    base_url: str,
    token: str | None,
    name: str,
    address: str,
    description: str,
) -> dict | None:
    """Создаёт здание с этажом 1 (без медиа). Возвращает ответ или None."""
    url = f"{base_url.rstrip('/')}/api/v1/dev/buildings"
    data = {"name": name, "address": address, "description": description, "total_floors": str(FLOORS_COUNT)}
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    try:
        r = requests.post(url, data=data, headers=headers, timeout=60)
        if r.status_code not in (200, 201):
            log(f"  Ошибка создания здания: {r.status_code}")
            log(f"  Ответ: {r.text[:500]}")
            return None
        return r.json()
    except Exception as e:
        log(f"  Ошибка при создании здания: {e}")
        return None


def create_floor(
    base_url: str,
    token: str | None,
    building_uuid: str,
    number: int,
    description: str = "",
) -> dict | None:
    """Создаёт этаж в здании."""
    url = f"{base_url.rstrip('/')}/api/v1/dev/buildings/{building_uuid}/floors"
    data = {"number": str(number), "description": description}
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    try:
        r = requests.post(url, data=data, headers=headers, timeout=30)
        if r.status_code not in (200, 201):
            log(f"  Ошибка создания этажа {number}: {r.status_code} {r.text[:200]}")
            return None
        return r.json()
    except Exception as e:
        log(f"  Ошибка при создании этажа: {e}")
        return None


def add_building_media(
    base_url: str,
    token: str | None,
    building_uuid: str,
    category: str,
    examples_dir: Path,
    count: int,
) -> bool:
    """Добавляет медиа к зданию с категорией. Использует файлы из examples (могут повторяться)."""
    url = f"{base_url.rstrip('/')}/api/v1/dev/buildings/{building_uuid}/media"

    file_handles = []
    files = []
    for i in range(count):
        fname = BUILDING_IMAGE_FILES[i % len(BUILDING_IMAGE_FILES)]
        p = examples_dir / fname
        if p.exists():
            fh = p.open("rb")
            file_handles.append(fh)
            ct = "image/png" if fname.endswith(".png") else "image/jpeg"
            files.append(("files", (fname, fh, ct)))

    if not files:
        log(f"  Нет файлов для загрузки в {examples_dir}")
        return False

    data = {"category": category}
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    try:
        r = requests.post(url, data=data, files=files, headers=headers, timeout=60)
        for fh in file_handles:
            fh.close()
        if r.status_code not in (200, 201):
            log(f"  Ошибка добавления медиа ({category}): {r.status_code} {r.text[:200]}")
            return False
        return True
    except Exception as e:
        for fh in file_handles:
            fh.close()
        log(f"  Ошибка при добавлении медиа: {e}")
        return False


def create_premise(
    base_url: str,
    token: str | None,
    building_uuid: str,
    area: float,
    price_per_month: float,
    number: str,
    description: str,
    examples_dir: Path,
    floor_number: int = 1,
) -> dict | None:
    """Создаёт помещение в здании с фото."""
    url = f"{base_url.rstrip('/')}/api/v1/dev/premises/{building_uuid}"

    file_handles = []
    files = []
    for fname in PREMISE_IMAGE_FILES:
        p = examples_dir / fname
        if p.exists():
            fh = p.open("rb")
            file_handles.append(fh)
            ct = "image/png" if fname.endswith(".png") else "image/jpeg"
            files.append(("files", (fname, fh, ct)))
    random.shuffle(files)

    data = {
        "area": str(area),
        "price_per_month": str(int(price_per_month)),
        "number": number,
        "description": description,
        "floor_number": str(floor_number),
    }
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    try:
        r = requests.post(url, data=data, files=files, headers=headers, timeout=60)
        for fh in file_handles:
            fh.close()
        if r.status_code not in (200, 201):
            log(f"  Ошибка создания помещения: {r.status_code} {r.text[:500]}")
            return None
        return r.json()
    except Exception as e:
        for fh in file_handles:
            fh.close()
        log(f"  Ошибка при создании помещения: {e}")
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Создание полностью заполненного здания")
    parser.add_argument("--base-url", default="http://localhost:8000", help="Базовый URL сервера")
    parser.add_argument("--email", default="admin@example.com", help="Email для входа")
    parser.add_argument("--password", default="admin", help="Пароль")
    parser.add_argument("--no-auth", action="store_true", help="Не использовать авторизацию")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    examples_dir = EXAMPLES_DIR

    if not examples_dir.exists():
        log(f"Ошибка: папка examples не найдена: {examples_dir}")
        return 1

    log("=== Создание полностью заполненного здания ===")
    log(f"Сервер: {base_url}")
    log("")

    token = None
    if not args.no_auth:
        log("Авторизация...")
        token = login(base_url, args.email, args.password)
        if not token:
            log("Не удалось авторизоваться. Попробуйте --email и --password или --no-auth")
            return 1
        log("Авторизация успешна.")
    else:
        log("Авторизация отключена (--no-auth).")
    log("")

    # 1. Создаём здание (с этажом 1)
    log("Создание здания...")
    resp = create_building(
        base_url,
        token,
        name="Полное здание",
        address="ул. Баумана, 1, Казань, Татарстан",
        description="Полное здание: 3 этажа, 12 медиа по категориям (фасад, инфраструктура, вход, общие зоны), 5 медиа на этаж.",
    )
    if not resp:
        log("Ошибка: не удалось создать здание")
        return 1

    building_uuid = resp.get("uuid")
    if not building_uuid:
        log(f"Нет uuid в ответе: {resp}")
        return 1
    log(f"Здание создано: uuid={building_uuid}")
    log("")

    # 2. Создаём этажи 2 и 3
    log("Создание этажей 2 и 3...")
    for n in (2, 3):
        if create_floor(base_url, token, building_uuid, n, f"Этаж {n}"):
            log(f"  Этаж {n} создан")
        else:
            log(f"  Не удалось создать этаж {n}")
    log("")

    # 3. Медиа здания по категориям (по 3 каждого типа)
    log("Добавление медиа здания по категориям...")
    for cat in BUILDING_CATEGORIES:
        if add_building_media(base_url, token, building_uuid, cat, examples_dir, MEDIA_PER_CATEGORY):
            log(f"  {cat}: {MEDIA_PER_CATEGORY} медиа")
        else:
            log(f"  Ошибка при добавлении медиа категории {cat}")
    log("")

    # 4. Медиа для этажей (5 на этаж)
    log("Добавление медиа этажей...")
    for n in range(1, FLOORS_COUNT + 1):
        cat = f"этаж_{n}"
        if add_building_media(base_url, token, building_uuid, cat, examples_dir, MEDIA_PER_FLOOR):
            log(f"  {cat}: {MEDIA_PER_FLOOR} медиа")
        else:
            log(f"  Ошибка при добавлении медиа {cat}")
    log("")

    # 5. Помещение (чтобы здание отображалось в API)
    log("Создание помещения...")
    resp_p = create_premise(
        base_url,
        token,
        building_uuid,
        area=50.0,
        price_per_month=80000.0,
        number="101",
        description="Помещение в полном здании",
        examples_dir=examples_dir,
        floor_number=1,
    )
    if resp_p:
        log(f"Помещение создано: {resp_p.get('number', '101')}")
    else:
        log("Ошибка при создании помещения")
    log("")

    log("=== Готово ===")
    log(f"Здание: Полное здание")
    log(f"UUID: {building_uuid}")
    log(f"Этажей: {FLOORS_COUNT}")
    log(f"Медиа здания: {BUILDING_CATEGORIES} x {MEDIA_PER_CATEGORY}")
    log(f"Медиа этажей: {MEDIA_PER_FLOOR} на этаж")
    return 0


if __name__ == "__main__":
    sys.exit(main())
