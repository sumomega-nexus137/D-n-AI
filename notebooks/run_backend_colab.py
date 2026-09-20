"""Запуск ВСЕГО D-n-AI из Google Colab одной ячейкой: сайт + модель +
ИИ-консультант + Telegram-бот. Через ngrok сайт получает публичную ссылку.

Все ключи вводятся ниже и живут только в этом Colab — в код и git не попадают.

Как пользоваться:
1. Открой https://colab.research.google.com → New notebook (лучше T4 GPU).
2. Скопируй весь код в одну ячейку.
3. Впиши три значения ниже.
4. Runtime → Run all. Через 1-2 минуты появится ссылка на сайт.
5. Держи ноутбук запущенным, пока показываешь сайт/бота.
"""

# ── ВПИШИ СВОЁ ───────────────────────────────────────────────────────────────
NGROK_AUTHTOKEN = "ВСТАВЬ"      # ngrok → Your Authtoken (обязательно для сайта)
TELEGRAM_BOT_TOKEN = "ВСТАВЬ"  # @BotFather → токен (оставь пустым "", если бот не нужен)
GEMINI_API_KEY = "ВСТАВЬ"      # https://aistudio.google.com/apikey (для консультанта и голоса)
# ─────────────────────────────────────────────────────────────────────────────

import os
import subprocess
import time
import urllib.request

REPO = "https://github.com/sumomega-nexus137/D-n-AI.git"
BRANCH = "claude/agritech-ai-hackathon-tlv08x"

# гасим прошлый запуск, если был
subprocess.run(["pkill", "-f", "uvicorn"])
subprocess.run(["pkill", "-f", "bot/main.py"])
try:
    from pyngrok import ngrok

    ngrok.kill()
except Exception:
    pass

# всегда берём свежий код (модели и собранный сайт уже внутри репозитория)
subprocess.run(["rm", "-rf", "D-n-AI"])
subprocess.run(["git", "clone", "-b", BRANCH, REPO], check=True)
os.chdir("/content/D-n-AI")

# зависимости backend'а и бота
subprocess.run(
    ["pip", "install", "-q", "-r", "backend/requirements.txt", "-r", "bot/requirements.txt", "pyngrok"],
    check=True,
)

# 1) backend: сайт + модель + ИИ-консультант (ключ Gemini — в окружении процесса)
backend_env = {**os.environ, "GEMINI_API_KEY": GEMINI_API_KEY}
subprocess.Popen(
    ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"],
    env=backend_env,
)
print("Поднимаю backend (качаю модель)…")
ready = False
for _ in range(90):
    try:
        urllib.request.urlopen("http://localhost:8000/health", timeout=2)
        ready = True
        break
    except Exception:
        time.sleep(3)
print("backend готов" if ready else "!! backend не поднялся — смотри логи выше")

# 2) Telegram-бот: фото → тот же разбор, голос → Gemini. Ходит в backend локально.
if TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_TOKEN != "ВСТАВЬ":
    bot_env = {
        **os.environ,
        "TELEGRAM_BOT_TOKEN": TELEGRAM_BOT_TOKEN,
        "GEMINI_API_KEY": GEMINI_API_KEY,
        "BACKEND_URL": "http://localhost:8000",
    }
    subprocess.Popen(["python", "bot/main.py"], env=bot_env)
    print("Telegram-бот запущен.")
else:
    print("Токен бота не задан — бот пропущен (сайт работает).")

# 3) публичная ссылка на сайт
from pyngrok import conf, ngrok

conf.get_default().auth_token = NGROK_AUTHTOKEN
url = ngrok.connect(addr=8000).public_url
print("\n" + "=" * 60)
print("  САЙТ РАБОТАЕТ:", url)
print("  При первом заходе на странице ngrok нажми 'Visit Site'.")
print("  Не закрывай эту вкладку, пока показываешь сайт и бота.")
print("=" * 60)

while True:
    time.sleep(3600)
