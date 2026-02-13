#!/usr/bin/env python3
"""
Экспорт OpenAPI-схемы API в JSON (api/api.json).

Запуск из каталога backend:
  uv run python scripts/export_openapi.py
Если uv run падает (например в песочнице на macOS): uv sync, затем
  .venv/bin/python scripts/export_openapi.py
"""
import json
import os
import sys
from pathlib import Path

# Корень backend (где manage.py)
BACKEND_DIR = Path(__file__).resolve().parent.parent
os.chdir(BACKEND_DIR)
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from api.router import api

OUTPUT_PATH = BACKEND_DIR.parent / "api" / "api.json"


def main():
    schema = api.get_openapi_schema()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(schema, f, ensure_ascii=False, indent=2)
    print(f"OpenAPI schema written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
