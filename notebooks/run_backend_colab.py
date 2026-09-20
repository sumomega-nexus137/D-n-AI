"""Запуск живого сайта D-n-AI из Google Colab через ngrok.

Backend сам раздаёт и сайт, и API, поэтому одна ngrok-ссылка = весь рабочий
сайт с настоящей моделью. Colab бесплатный, есть GPU — анализ быстрый.

Как пользоваться:
1. Открой https://colab.research.google.com → New notebook.
2. Скопируй ВЕСЬ этот код в одну ячейку.
3. Впиши свой ngrok-токен и статический домен в NGROK_AUTHTOKEN / NGROK_DOMAIN.
4. Runtime → Run all. Через 1-2 минуты появится ссылка — открой её.
5. Держи ноутбук запущенным, пока показываешь сайт. Закроешь — ссылка гаснет.
"""

# ── ВПИШИ СВОЁ ───────────────────────────────────────────────────────────────
NGROK_AUTHTOKEN = "ВСТАВЬ_СВОЙ_ТОКЕН"  # ngrok → Your Authtoken (только токен)
# Домен НЕ нужен: на бесплатном плане ngrok выдаёт случайную ссылку сам
# (кастомные домены у ngrok теперь только на платном плане).
# ─────────────────────────────────────────────────────────────────────────────

REPO = "https://github.com/sumomega-nexus137/D-n-AI.git"
BRANCH = "claude/agritech-ai-hackathon-tlv08x"

import os
import subprocess
import time
import urllib.request

# 1. Забираем код с GitHub (модели и собранный сайт уже внутри репозитория)
if not os.path.isdir("D-n-AI"):
    subprocess.run(["git", "clone", "-b", BRANCH, REPO], check=True)
os.chdir("D-n-AI")

# 2. Ставим зависимости backend'а + pyngrok
subprocess.run(
    ["pip", "install", "-q", "-r", "backend/requirements.txt", "pyngrok"],
    check=True,
)

# 3. Запускаем backend в фоне (при первом старте качается DINOv2 ~84 МБ)
server = subprocess.Popen(
    ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
)

# 4. Ждём, пока backend поднимется
print("Запускаю backend (качаю веса модели)…")
ready = False
for _ in range(80):
    try:
        urllib.request.urlopen("http://localhost:8000/health", timeout=2)
        ready = True
        break
    except Exception:
        time.sleep(3)

if not ready:
    raise RuntimeError("Backend не поднялся — посмотри логи ячейки выше.")
print("Backend готов.")

# 5. Открываем публичный адрес на постоянном ngrok-домене
from pyngrok import conf, ngrok

conf.get_default().auth_token = NGROK_AUTHTOKEN
tunnel = ngrok.connect(addr=8000)
url = tunnel.public_url

print("\n" + "=" * 60)
print("  САЙТ РАБОТАЕТ:", url)
print("  Проверка API:", url + "/health")
print("  При первом заходе ngrok покажет предупреждение —")
print("  нажми 'Visit Site', дальше всё откроется нормально.")
print("  НЕ закрывай эту вкладку, пока показываешь сайт.")
print("=" * 60)

# 6. Держим ячейку живой
while True:
    time.sleep(3600)
