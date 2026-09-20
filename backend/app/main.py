"""FastAPI backend: два эндпоинта анализа фото + служебные."""

import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .common import config, embedder
from .module1_grain import pipeline as grain_pipeline
from .module2_disease import pipeline as disease_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dnai")

app = FastAPI(
    title="D-n-AI — агроскан",
    description="Качество зерна и здоровье растений по фото",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"}


@app.on_event("startup")
async def _startup() -> None:
    if config.DEMO_MODE:
        logger.info("DEMO_MODE=1 — нейросеть не загружается, отдаются демо-ответы")
        return
    try:
        embedder.warmup()
        logger.info("DINOv2 загружен, сервис готов")
    except Exception as exc:  # noqa: BLE001 — сервис должен подняться даже без весов
        logger.warning("Не удалось прогреть DINOv2 на старте: %s", exc)


async def _read_image(file: UploadFile) -> bytes:
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(415, f"Неподдерживаемый тип файла: {file.content_type}")
    data = await file.read()
    if not data:
        raise HTTPException(400, "Пустой файл")
    if len(data) > config.MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Файл слишком большой (максимум 12 МБ)")
    return data


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "demo_mode": config.DEMO_MODE}


@app.post("/predict/grain")
async def predict_grain(file: UploadFile = File(...)) -> dict:
    data = await _read_image(file)
    try:
        return grain_pipeline.analyze(data)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Ошибка анализа зерна")
        raise HTTPException(500, f"Ошибка анализа: {exc}") from exc


@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)) -> dict:
    data = await _read_image(file)
    try:
        return disease_pipeline.analyze(data)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Ошибка анализа растения")
        raise HTTPException(500, f"Ошибка анализа: {exc}") from exc
