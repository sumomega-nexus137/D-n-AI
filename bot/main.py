"""Telegram-бот: фото пробы зерна или растения -> полный разбор.

Голосовые сообщения пересылаются напрямую в Gemini Flash (он же распознаёт
речь и отвечает) — собственного распознавания речи в проекте нет.
"""

import asyncio
import logging
import os
from io import BytesIO

import httpx
from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.constants import ChatAction
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from formatting import format_disease, format_grain

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("dnai-bot")

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000").rstrip("/")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
REQUEST_TIMEOUT = float(os.environ.get("BOT_REQUEST_TIMEOUT", 90))

WELCOME = (
    "<b>D-n-AI — агроскан</b>\n\n"
    "Пришлите фото — разберу и подскажу, что делать:\n\n"
    "🌾 <b>Проба зерна</b> — доли по категориям, предварительный класс, "
    "цена в тенге и как поднять сортность\n"
    "🌱 <b>Лист или растение</b> — болезнь, вредитель или сорняк с мерами обработки\n\n"
    "Можно также надиктовать голосовое сообщение с вопросом — отвечу текстом.\n\n"
    "<i>Как снимать зерно:</i> разложите пробу тонким слоем на контрастном фоне, "
    "снимайте сверху при ровном свете.\n"
    "<i>Как снимать растение:</i> поражённый лист крупным планом, при дневном свете."
)

CHOOSE_KEYBOARD = InlineKeyboardMarkup(
    [
        [
            InlineKeyboardButton("🌾 Качество зерна", callback_data="grain"),
            InlineKeyboardButton("🌱 Болезни и сорняки", callback_data="disease"),
        ]
    ]
)


async def start(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_html(WELCOME)


async def on_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Сохраняем фото и спрашиваем, что именно анализировать."""
    photo = update.message.photo[-1]
    context.user_data["file_id"] = photo.file_id
    await update.message.reply_text(
        "Что на фото?", reply_markup=CHOOSE_KEYBOARD, reply_to_message_id=update.message.message_id
    )


async def on_document_image(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    doc = update.message.document
    if not (doc.mime_type or "").startswith("image/"):
        await update.message.reply_text("Пришлите, пожалуйста, изображение.")
        return
    context.user_data["file_id"] = doc.file_id
    await update.message.reply_text("Что на фото?", reply_markup=CHOOSE_KEYBOARD)


async def on_choice(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()

    file_id = context.user_data.get("file_id")
    if not file_id:
        await query.edit_message_text("Фото не найдено — пришлите его ещё раз.")
        return

    mode = query.data
    await query.edit_message_text("Анализирую… это займёт несколько секунд")
    await context.bot.send_chat_action(query.message.chat_id, ChatAction.TYPING)

    try:
        tg_file = await context.bot.get_file(file_id)
        buffer = BytesIO()
        await tg_file.download_to_memory(buffer)
        buffer.seek(0)

        endpoint = "/predict/grain" if mode == "grain" else "/predict/disease"
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(
                f"{BACKEND_URL}{endpoint}",
                files={"file": ("photo.jpg", buffer.getvalue(), "image/jpeg")},
            )
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPStatusError as exc:
        detail = ""
        try:
            detail = exc.response.json().get("detail", "")
        except Exception:  # noqa: BLE001
            pass
        await query.edit_message_text(f"Сервер вернул ошибку. {detail}".strip())
        return
    except Exception:  # noqa: BLE001
        logger.exception("Ошибка запроса к backend")
        await query.edit_message_text(
            "Не удалось связаться с сервером анализа. Попробуйте ещё раз через минуту."
        )
        return

    text = format_grain(data) if mode == "grain" else format_disease(data)
    await query.edit_message_text(text, parse_mode="HTML")


async def on_voice(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Голосовое -> напрямую в Gemini Flash (он и распознаёт речь, и отвечает)."""
    if not GEMINI_API_KEY:
        await update.message.reply_text(
            "Голосовые пока недоступны: не задан GEMINI_API_KEY на сервере."
        )
        return

    await context.bot.send_chat_action(update.message.chat_id, ChatAction.TYPING)

    voice = update.message.voice or update.message.audio
    tg_file = await context.bot.get_file(voice.file_id)
    buffer = BytesIO()
    await tg_file.download_to_memory(buffer)
    audio_bytes = buffer.getvalue()

    prompt = (
        "Ты — агроном-консультант для фермеров Казахстана. Пользователь задал "
        "вопрос голосом (на русском или казахском). Пойми вопрос и ответь на том "
        "же языке, коротко и по делу — не больше 6 предложений. Если вопрос про "
        "качество зерна или болезни растений, упомяни, что можно прислать фото "
        "боту для точной оценки."
    )

    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        result = await asyncio.to_thread(
            model.generate_content,
            [prompt, {"mime_type": voice.mime_type or "audio/ogg", "data": audio_bytes}],
        )
        await update.message.reply_text(result.text)
    except Exception:  # noqa: BLE001
        logger.exception("Ошибка обращения к Gemini")
        await update.message.reply_text(
            "Не получилось обработать голосовое сообщение. Попробуйте ещё раз "
            "или напишите вопрос текстом."
        )


async def on_text(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_html(
        "Пришлите фото пробы зерна или растения — разберу.\n"
        "Или надиктуйте голосовое с вопросом.\n\n/start — как это работает"
    )


def main() -> None:
    if not TELEGRAM_BOT_TOKEN:
        raise SystemExit(
            "Не задан TELEGRAM_BOT_TOKEN. Скопируйте .env.example в .env и заполните его."
        )

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler(["start", "help"], start))
    app.add_handler(MessageHandler(filters.PHOTO, on_photo))
    app.add_handler(MessageHandler(filters.Document.IMAGE, on_document_image))
    app.add_handler(MessageHandler(filters.VOICE | filters.AUDIO, on_voice))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_text))
    app.add_handler(CallbackQueryHandler(on_choice, pattern="^(grain|disease)$"))

    logger.info("Бот запущен, backend: %s", BACKEND_URL)
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
