# Backend + собранный веб-интерфейс в одном образе.
# Подходит для Hugging Face Spaces (Docker SDK) и Render.

FROM node:22-slim AS web
WORKDIR /web
COPY webapp/package*.json ./
RUN npm ci
COPY webapp/ ./
# VITE_BACKEND_URL не задаём: в production-сборке фронт ходит на тот же origin,
# с которого загрузился, а статику раздаёт сам backend (см. main.py)
RUN npm run build

FROM python:3.11-slim

# HOME/кеши — в /app, чтобы веса DINOv2 скачивались туда, куда есть права
# (на Hugging Face Spaces контейнер стартует под непривилегированным пользователем)
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HOME=/app \
    TORCH_HOME=/app/.cache/torch \
    HF_HOME=/app/.cache/hf \
    XDG_CACHE_HOME=/app/.cache

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libgl1 git \
    && rm -rf /var/lib/apt/lists/*

# torch ставим отдельно с CPU-индекса: иначе тянется CUDA-сборка на ~2.5 ГБ
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision \
    && pip install -r backend/requirements.txt

COPY backend/ ./backend/
COPY models/ ./models/
COPY --from=web /web/dist ./webapp/dist

RUN mkdir -p /app/.cache && chmod -R 777 /app/.cache

# Прогреваем веса DINOv2 на этапе сборки, чтобы первый запрос пользователя
# не ждал скачивания ~84 МБ. Если сети при сборке нет — не валим образ:
# веса скачаются при первом обращении.
RUN python -c "import torch; torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14')" \
    || echo "Веса DINOv2 не предзагружены — скачаются при первом запросе"
RUN chmod -R 777 /app/.cache

EXPOSE 7860
# Render передаёт свой порт через $PORT, Hugging Face Spaces ждёт 7860
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
