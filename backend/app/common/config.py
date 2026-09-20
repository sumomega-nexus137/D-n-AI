"""Конфигурация сервиса. Все секреты — только из окружения/.env."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODELS_DIR = Path(os.environ.get("MODELS_DIR", PROJECT_ROOT / "models"))

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

# Ориентировочные закупочные цены пшеницы, тенге за тонну.
# Переопределяются через окружение — рынок меняется, хардкодить нельзя.
PRICE_CLASS_3_KZT = float(os.environ.get("PRICE_CLASS_3_KZT", 102_000))
PRICE_CLASS_4_KZT = float(os.environ.get("PRICE_CLASS_4_KZT", 85_000))
PRICE_CLASS_5_KZT = float(os.environ.get("PRICE_CLASS_5_KZT", 70_000))

# Верхняя/нижняя граница диапазона 3 класса — для вилки "от и до" в ответе
PRICE_CLASS_3_MIN_KZT = float(os.environ.get("PRICE_CLASS_3_MIN_KZT", 90_000))
PRICE_CLASS_3_MAX_KZT = float(os.environ.get("PRICE_CLASS_3_MAX_KZT", 115_000))

# Фуражное зерно — база для расчёта прибавки, если партия не проходит даже 5 класс
PRICE_FODDER_KZT = float(os.environ.get("PRICE_FODDER_KZT", 55_000))

# Модель DINOv2: vits14 — компромисс скорость/качество, ~84 МБ весов
DINOV2_MODEL = os.environ.get("DINOV2_MODEL", "dinov2_vits14")

# Демо-режим: не грузить нейросеть, отдавать заранее подготовленный ответ.
# Нужен для разработки фронтенда и для окружений без доступа к весам.
DEMO_MODE = os.environ.get("DEMO_MODE", "0") == "1"

# Ограничение на размер загружаемого файла
MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", 12 * 1024 * 1024))

# Бюджет времени на прогон зёрен через DINOv2, секунды. Требование задачи —
# ответ не дольше 5 секунд, поэтому классифицируем столько зёрен, сколько
# успеваем, а не сколько нашлось: на слабом CPU это 40-80 зёрен, на GPU — все.
INFERENCE_TIME_BUDGET_S = float(os.environ.get("INFERENCE_TIME_BUDGET_S", 3.5))

# Потолок на число зёрен даже если железо быстрое (дальше точность долей
# растёт незначительно, а время — линейно)
MAX_GRAINS_PER_IMAGE = int(os.environ.get("MAX_GRAINS_PER_IMAGE", 400))
