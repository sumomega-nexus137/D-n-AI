# Деплой

Три части системы: **backend + сайт** (один образ), **Telegram-бот** (отдельный
процесс), **ключи** (только через панель секретов хостинга).

Главное правило: ни `GEMINI_API_KEY`, ни `TELEGRAM_BOT_TOKEN` никогда не
попадают в репозиторий и в Docker-образ. `.env` перечислен в `.gitignore` и в
`.dockerignore`, в репозитории лежит только `.env.example` с пустыми
плейсхолдерами.

---

## Что где нужно

| Ключ | Кому нужен | Без него |
|---|---|---|
| `GEMINI_API_KEY` | только боту, для голосовых сообщений | бот отвечает «голосовые пока недоступны», всё остальное работает |
| `TELEGRAM_BOT_TOKEN` | только боту | бот не запускается (осознанно падает с понятным текстом) |
| `BACKEND_URL` | только боту | бот стучится в `http://localhost:8000` |

Сайту и backend'у ключи не нужны вообще — анализ фото работает полностью
локально на своих весах.

---

## Вариант 1. Hugging Face Spaces (Docker SDK)

Бесплатный тариф: 2 vCPU / 16 ГБ — модели хватает с запасом.

1. Создать Space → **Docker → Blank**, видимость Public.
2. Запушить репозиторий в Space:

   ```bash
   git remote add space https://huggingface.co/spaces/<user>/<space-name>
   git push space claude/agritech-ai-hackathon-tlv08x:main
   ```

3. В `README.md` того, что попадёт в Space, нужен YAML-заголовок — Spaces
   читает из него настройки. В этом репозитории заголовка нет специально
   (GitHub отрисовал бы его уродливой таблицей), поэтому в Space его надо
   добавить первыми строками README:

   ```yaml
   ---
   title: D-n-AI Agroscan
   emoji: 🌾
   colorFrom: yellow
   colorTo: gray
   sdk: docker
   app_port: 7860
   pinned: false
   ---
   ```

4. **Settings → Variables and secrets → New secret**: `GEMINI_API_KEY`
   (нужен, только если бот тоже живёт в этом Space).
5. Первая сборка идёт ~10–15 минут: ставится CPU-сборка torch и на этапе
   build скачиваются веса DINOv2 (~84 МБ), чтобы первый запрос пользователя
   не ждал загрузки.

После сборки Space отдаёт и сайт (`/`), и API (`/predict/grain`,
`/predict/disease`, `/health`, `/docs`).

---

## Вариант 2. Render

В репозитории лежит готовый `render.yaml` (Blueprint).

1. Render → **New → Blueprint** → указать репозиторий и ветку.
2. Render найдёт `render.yaml` и предложит два сервиса:
   - `dnai-api` — web-сервис из `Dockerfile` (backend + сайт), healthcheck
     на `/health`;
   - `dnai-bot` — worker с Telegram-ботом.
3. Render спросит значения ключей, помеченных `sync: false`
   (`GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `BACKEND_URL`) — вводятся в
   панели, в коде их нет.
4. `BACKEND_URL` для бота вписать **со схемой** после первого деплоя:
   `https://dnai-api.onrender.com`.

⚠️ Free-плана Render (512 МБ RAM) для torch **не хватает** — процесс убивает
OOM-killer. В `render.yaml` стоит `plan: starter`. Если нужен бесплатный
хостинг — берите Hugging Face Spaces.

---

## Локальный Docker

```bash
docker build -t dnai .
docker run --rm -p 7860:7860 dnai
# сайт и API: http://localhost:7860
```

Бот локально запускается отдельно:

```bash
pip install -r bot/requirements.txt
cp .env.example .env        # вписать TELEGRAM_BOT_TOKEN, GEMINI_API_KEY
python bot/main.py
```

---

## Проверка после деплоя

```bash
curl https://<адрес>/health
# {"status":"ok","demo_mode":false}

curl -X POST https://<адрес>/predict/grain -F "file=@проба.jpg" | head -c 300
```

Открыть `https://<адрес>/` — должен открыться сайт, а не JSON. Если пришёл
JSON со списком эндпоинтов, значит образ собрался без фронтенда
(`webapp/dist` не попал внутрь) — проверьте node-стадию сборки.

---

## Демо-режим без весов

`DEMO_MODE=1` поднимает сервис без DINOv2 и отдаёт заранее подготовленный
ответ той же структуры. Нужен для разработки фронтенда и как страховка на
показе, если хостинг не успевает прогреться:

```bash
DEMO_MODE=1 uvicorn backend.app.main:app --port 8000
```
