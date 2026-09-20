"""FastAPI backend: два эндпоинта анализа фото + служебные."""

import asyncio
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

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


class ChatRequest(BaseModel):
    message: str
    context: dict | None = None


def _consultant_prompt(message: str, context: dict | None) -> str:
    """Собираем промпт для Gemini: роль агронома + контекст последнего анализа."""
    parts = [
        "Ты — агроном-консультант сервиса D-n-AI для фермеров Казахстана. "
        "Отвечай по-русски, коротко и по делу (до 6 предложений), практично. "
        "Не выдумывай точные дозировки препаратов — советуй уточнить их у "
        "агронома по регламенту применения.",
    ]
    if context:
        summary = []
        if context.get("grade_label"):
            summary.append(f"класс зерна: {context['grade_label']}")
        if context.get("price_kzt_per_ton"):
            summary.append(f"цена: ~{context['price_kzt_per_ton']:.0f} ₸/т")
        cats = context.get("categories") or []
        if cats:
            summary.append(
                "состав: "
                + ", ".join(f"{c['label']} {c['percent']:.1f}%" for c in cats if c.get("percent"))
            )
        diag = context.get("diagnosis")
        if diag:
            summary.append(
                f"диагноз листа: {diag.get('name_ru')} "
                f"({round((diag.get('confidence') or 0) * 100)}%)"
            )
        if summary:
            parts.append("Результат последнего анализа — " + "; ".join(summary) + ".")
    parts.append(f"Вопрос фермера: {message}")
    return "\n\n".join(parts)


@app.post("/chat")
async def chat(req: ChatRequest) -> dict:
    if not req.message.strip():
        raise HTTPException(400, "Пустой вопрос")
    if not config.GEMINI_API_KEY:
        raise HTTPException(
            503,
            "Консультант недоступен: на сервере не задан GEMINI_API_KEY.",
        )
    try:
        import google.generativeai as genai

        genai.configure(api_key=config.GEMINI_API_KEY)
        model = genai.GenerativeModel(config.GEMINI_MODEL)
        result = await asyncio.to_thread(
            model.generate_content, _consultant_prompt(req.message, req.context)
        )
        return {"reply": (result.text or "").strip()}
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Ошибка консультанта Gemini")
        raise HTTPException(502, "Консультант временно недоступен, попробуйте позже.") from exc


# Раздача собранного сайта. Монтируется последней, чтобы не перехватывать /health
# и /predict/*. Если сборки нет (локальная разработка через vite dev) — просто API.
if (config.WEBAPP_DIST / "index.html").exists():
    app.mount("/", StaticFiles(directory=config.WEBAPP_DIST, html=True), name="webapp")
    logger.info("Сайт раздаётся из %s", config.WEBAPP_DIST)
else:
    logger.info("Сборка фронтенда не найдена (%s) — работает только API", config.WEBAPP_DIST)

    @app.get("/")
    async def root() -> dict:
        return {
            "service": "D-n-AI",
            "endpoints": ["/health", "/predict/grain", "/predict/disease", "/docs"],
        }
