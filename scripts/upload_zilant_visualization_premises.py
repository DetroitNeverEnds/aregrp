#!/usr/bin/env python3
"""
Создание помещений 102–108 через dev API: POST /api/v1/dev/premises/{building_uuid}.

В корне (--path) ожидаются подпапки «2 офис»…«8 офис» с изображениями → номера помещений 102…108.
Порядок файлов в подпапке — по имени. Площадь всегда 1 м²; available_for_rent=true, available_for_sale=false.

Зависимость requests — окружение backend:
  cd backend && uv run python ../scripts/upload_zilant_visualization_premises.py --help

Пример:
  cd backend && uv run python ../scripts/upload_zilant_visualization_premises.py \\
    --base-url https://aregrp.ru \\
    --building-uuid '<uuid>' \\
    --path /abs/path/to/визуализация \\
    --floor-number 1 \\
    --email '…' --password '…'
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from uuid import UUID

try:
    import requests
except ImportError:
    print("Ошибка: установите requests (или uv sync в backend).", file=sys.stderr)
    sys.exit(1)

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# Подпапка «N офис» → номер помещения 100 + N (2 офис→102 … 8 офис→108)
FOLDER_TO_PREMISE = [(f"{n} офис", str(100 + n)) for n in range(2, 9)]

# Площадь для всех создаваемых помещений (форма API)
PREMISE_AREA = "1"


def log(msg: str) -> None:
    print(msg, flush=True)


def _mime(path: Path) -> str:
    s = path.suffix.lower()
    if s in (".jpg", ".jpeg"):
        return "image/jpeg"
    if s == ".png":
        return "image/png"
    if s == ".webp":
        return "image/webp"
    if s == ".gif":
        return "image/gif"
    return "application/octet-stream"


def login(base_url: str, email: str, password: str) -> str | None:
    url = f"{base_url.rstrip('/')}/api/v1/auth/login"
    try:
        r = requests.post(url, json={"email": email, "password": password}, timeout=30)
        if r.status_code != 200:
            log(f"Ошибка логина: {r.status_code} {r.text[:300]}")
            return None
        return r.json().get("access_token")
    except OSError as e:
        log(f"Ошибка сети при логине: {e}")
        return None


def collect_images(folder: Path) -> list[Path]:
    if not folder.is_dir():
        return []
    out = [p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_SUFFIXES]
    out.sort(key=lambda p: p.name.lower())
    return out


def create_premise(
    base_url: str,
    token: str | None,
    building_uuid: str,
    number: str,
    image_paths: list[Path],
    floor_number: int,
) -> dict | None:
    url = f"{base_url.rstrip('/')}/api/v1/dev/premises/{building_uuid}"
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    data = {
        "area": PREMISE_AREA,
        "number": number,
        "description": "",
        "floor_number": str(floor_number),
        "available_for_rent": "true",
        "available_for_sale": "false",
    }

    file_handles: list = []
    files: list[tuple[str, tuple]] = []
    try:
        for p in image_paths:
            fh = p.open("rb")
            file_handles.append(fh)
            files.append(("files", (p.name, fh, _mime(p))))

        r = requests.post(url, data=data, files=files, headers=headers, timeout=120)
        if r.status_code not in (200, 201):
            log(f"  Ошибка API: {r.status_code} {r.text[:800]}")
            return None
        return r.json()
    except OSError as e:
        log(f"  Ошибка файлов/сети: {e}")
        return None
    finally:
        for fh in file_handles:
            fh.close()


def _resolve_token(base_url: str, args: argparse.Namespace) -> str | None:
    if args.no_auth:
        return None
    if args.token is not None:
        return args.token.strip()
    if args.email is not None and args.password is not None:
        log("Вход…")
        return login(base_url, args.email, args.password)
    return None


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Помещения 102–108: dev API + фото из подпапок «2 офис»…«8 офис» (--path)",
    )
    parser.add_argument("--base-url", required=True, help="Базовый URL API (без завершающего /)")
    parser.add_argument("--building-uuid", required=True, help="UUID здания")
    parser.add_argument(
        "-p",
        "--path",
        required=True,
        type=Path,
        metavar="DIR",
        help='Каталог с подпапками «2 офис»…«8 офис» (картинки по помещениям)',
    )
    parser.add_argument("--floor-number", type=int, required=True, help="Номер этажа в здании")
    parser.add_argument("--email", help="Email для POST /api/v1/auth/login")
    parser.add_argument("--password", help="Пароль")
    parser.add_argument("--token", help="Bearer-токен (без префикса Bearer)")
    parser.add_argument("--no-auth", action="store_true", help="Не передавать заголовок Authorization")
    args = parser.parse_args()

    try:
        UUID(str(args.building_uuid).strip())
    except ValueError:
        log("Некорректный --building-uuid (ожидается UUID).")
        return 1

    if args.no_auth and (args.token or args.email or args.password):
        parser.error("Сочетание --no-auth с --token или --email/--password недопустимо.")
    if not args.no_auth:
        if args.token:
            if args.email is not None or args.password is not None:
                parser.error("Укажите либо --token, либо пару --email и --password.")
        else:
            if args.email is None or args.password is None:
                parser.error("Нужен --no-auth, или --token, или оба --email и --password.")

    base_url = args.base_url.rstrip("/")
    visual_root: Path = args.path.resolve()
    building_uuid = str(args.building_uuid).strip()

    if not visual_root.is_dir():
        log(f"Нет каталога: {visual_root}")
        return 1

    token = _resolve_token(base_url, args)
    if not args.no_auth and not token:
        return 1

    ok = 0
    failed = 0
    for folder_name, premise_number in FOLDER_TO_PREMISE:
        sub = visual_root / folder_name
        images = collect_images(sub)
        if not images:
            log(f"Пропуск папки «{folder_name}» → №{premise_number}: нет изображений в {sub}")
            continue
        log(f"Помещение №{premise_number}, файлов: {len(images)} …")
        result = create_premise(
            base_url,
            token,
            building_uuid,
            premise_number,
            images,
            floor_number=args.floor_number,
        )
        if result:
            ok += 1
            log(f"  OK: {result}")
        else:
            failed += 1
            log(f"  Не создано: №{premise_number}")

    log(f"Готово: успешно создано {ok}, ошибок {failed}.")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())


# run python ../scripts/upload_zilant_visualization_premises.py \
#   --base-url http://aregrp.ru \
#   --building-uuid '1a32e7ec-9041-4cac-a3e7-41ff0f5791fb' \
#   -p ../../Визуализация \
#   --floor-number 1 \
#   --email 'admin' --password 'admin'