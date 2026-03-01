#!/usr/bin/env python3
"""
Скрипт загрузки тестовых данных: 20 зданий, по 10 помещений в каждом.

Использование:
    python scripts/seed_buildings.py [--base-url URL] [--email EMAIL] [--password PASSWORD]
    python scripts/seed_buildings.py --base-url http://176.98.176.204 --email admin@example.com --password admin

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

# Путь к examples относительно корня проекта
PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXAMPLES_DIR = PROJECT_ROOT / "backend" / "examples"

# Медиа для зданий (фото + видео)
BUILDING_IMAGES = ["buildig.png", "building2.png", "building3.jpeg"]
BUILDING_VIDEO = "build_video.mp4"

# Медиа для помещений
PREMISE_IMAGES = ["office.png", "office2.png", "office3.jpg", "office4.jpg"]

# Варианты названий зданий
BUILDING_NAMES = [
    "Бизнес-центр Смолино", "Деловой центр Татарстан", "Офисный комплекс Кремлёвский",
    "БЦ Баумана", "Торгово-офисный центр Центральный", "Бизнес-парк Казань",
    "Деловой квартал Султановский", "Офис-центр Пушкина", "БЦ Петербургский",
    "Бизнес-центр Батурина", "Офисный дом Дзержинского", "Деловой центр Ямашева",
    "БЦ Проспект Победы", "Офис-комплекс Адоратского", "Бизнес-центр Чистопольская",
    "Деловой дом Галактионова", "Офисный центр Тукая", "БЦ Кави Наджми",
    "Бизнес-парк Аметьевская", "Деловой квартал Фучика",
]

# Улицы Казани для адресов
STREETS = [
    "ул. Баумана", "ул. Пушкина", "ул. Тукая", "пр. Победы", "ул. Дзержинского",
    "ул. Ямашева", "ул. Петербургская", "ул. Батурина", "ул. Смоленская",
    "ул. Чистопольская", "ул. Аметьевская", "ул. Фучика", "ул. Галактионова",
    "ул. Адоратского", "ул. Султановская", "ул. Кремлёвская", "ул. Центральная",
]

# Шаблоны номеров помещений (подставляется случайное число)
PREMISE_NUMBER_TEMPLATES = [
    "Помещение {n}",
    "Офис {n}",
    "№ {n}",
    "{n}",
]

# Описания зданий
BUILDING_DESCRIPTIONS = [
    "Современный бизнес-центр класса А с развитой инфраструктурой.",
    "Офисное здание в центре города с удобной транспортной доступностью.",
    "Комфортабельный деловой центр с конференц-залами и паркингом.",
    "Бизнес-центр с круглосуточной охраной и видеонаблюдением.",
    "Офисный комплекс с ремонтом под ключ и меблированными помещениями.",
]


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
    examples_dir: Path,
    include_video: bool = True,
) -> dict | None:
    """Создаёт здание с этажом и медиа. Возвращает ответ или None."""
    url = f"{base_url.rstrip('/')}/api/v1/dev/buildings"

    # Собираем файлы в случайном порядке
    file_handles = []
    all_files = []
    for fname in BUILDING_IMAGES:
        p = examples_dir / fname
        if p.exists():
            fh = p.open("rb")
            file_handles.append(fh)
            ct = "image/png" if fname.endswith(".png") else "image/jpeg"
            all_files.append(("files", (fname, fh, ct)))
    if include_video:
        video_path = examples_dir / BUILDING_VIDEO
        if video_path.exists():
            fh = video_path.open("rb")
            file_handles.append(fh)
            all_files.append(("files", (BUILDING_VIDEO, fh, "video/mp4")))
    random.shuffle(all_files)

    data = {"name": name, "address": address, "description": description}
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    try:
        r = requests.post(url, data=data, files=all_files, headers=headers, timeout=120)
        if r.status_code not in (200, 201):
            log(f"  Ошибка создания здания: {r.status_code}")
            log(f"  Ответ: {r.text[:500]}")
            return None
        return r.json()
    except Exception as e:
        log(f"  Ошибка при создании здания: {e}")
        return None
    finally:
        for fh in file_handles:
            fh.close()


def create_premise(
    base_url: str,
    token: str | None,
    building_uuid: str,
    area: float,
    price_per_month: float,
    number: str,
    description: str,
    examples_dir: Path,
) -> dict | None:
    """Создаёт помещение в здании с фото. Возвращает ответ или None."""
    url = f"{base_url.rstrip('/')}/api/v1/dev/premises/{building_uuid}"

    # Фото в случайном порядке
    file_handles = []
    files = []
    for fname in PREMISE_IMAGES:
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
    }
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    try:
        r = requests.post(url, data=data, files=files, headers=headers, timeout=60)
        if r.status_code not in (200, 201):
            log(f"  Ошибка создания помещения: {r.status_code}")
            log(f"  Ответ: {r.text[:500]}")
            return None
        return r.json()
    except Exception as e:
        log(f"  Ошибка при создании помещения: {e}")
        return None
    finally:
        for fh in file_handles:
            fh.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Загрузка тестовых зданий и помещений")
    parser.add_argument("--base-url", default="http://176.98.176.204", help="Базовый URL сервера")
    parser.add_argument("--email", default="admin@example.com", help="Email для входа")
    parser.add_argument("--password", default="admin", help="Пароль")
    parser.add_argument("--buildings", type=int, default=20, help="Количество зданий")
    parser.add_argument("--premises-per-building", type=int, default=10, help="Помещений в каждом здании")
    parser.add_argument("--no-auth", action="store_true", help="Не использовать авторизацию (если dev-ручки публичные)")
    parser.add_argument("--no-video", action="store_true", help="Не загружать видео (экономия трафика, видео ~18MB)")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    examples_dir = EXAMPLES_DIR

    if not examples_dir.exists():
        log(f"Ошибка: папка examples не найдена: {examples_dir}")
        return 1

    log("=== Загрузка тестовых данных ===")
    log(f"Сервер: {base_url}")
    log(f"Зданий: {args.buildings}, помещений в каждом: {args.premises_per_building}")
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

    # Используем копию списка имён и перемешиваем
    building_names = BUILDING_NAMES.copy()
    random.shuffle(building_names)

    total_ok_buildings = 0
    total_ok_premises = 0

    for i in range(args.buildings):
        name = building_names[i % len(building_names)]
        if args.buildings > len(building_names):
            name = f"{name} ({i + 1})"
        street = random.choice(STREETS)
        num = random.randint(1, 150)
        address = f"{street}, {num}, Казань, Татарстан"
        description = random.choice(BUILDING_DESCRIPTIONS)

        log(f"[{i + 1}/{args.buildings}] Создание здания: {name}")

        resp = create_building(
            base_url, token, name, address, description, examples_dir,
            include_video=not args.no_video,
        )
        if not resp:
            log(f"  Пропуск здания {name}")
            continue

        building_uuid = resp.get("uuid")
        if not building_uuid:
            log(f"  Нет uuid в ответе: {resp}")
            continue

        total_ok_buildings += 1
        log(f"  Здание создано: uuid={building_uuid}")

        for j in range(args.premises_per_building):
            area = round(random.uniform(20, 200), 1)
            price = random.randint(30000, 150000)
            num = random.randint(1, 999)
            number = random.choice(PREMISE_NUMBER_TEMPLATES).format(n=num)
            desc = f"Офисное помещение {area} м², аренда от {price} ₽/мес."

            resp_p = create_premise(
                base_url, token, building_uuid,
                area=area, price_per_month=price,
                number=number, description=desc,
                examples_dir=examples_dir,
            )
            if resp_p:
                total_ok_premises += 1
                if (j + 1) % 5 == 0 or j == args.premises_per_building - 1:
                    log(f"  Помещений: {j + 1}/{args.premises_per_building}")

        log("")

    log("=== Готово ===")
    log(f"Создано зданий: {total_ok_buildings}/{args.buildings}")
    log(f"Создано помещений: {total_ok_premises}/{args.buildings * args.premises_per_building}")
    return 0 if total_ok_buildings == args.buildings else 1


if __name__ == "__main__":
    sys.exit(main())
