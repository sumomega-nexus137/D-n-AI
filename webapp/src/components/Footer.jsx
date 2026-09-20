import Logo from "./Logo.jsx";
import { TELEGRAM_URL } from "../lib/config.js";

export default function Footer({ onHome, onView }) {
  return (
    <footer className="relative border-t border-white/[0.06] py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <Logo onClick={onHome} />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Оценка качества зерна и здоровья посевов по фото. Прототип для
              AgriTech AI Hackathon, трек «Компьютерное зрение в агрономии».
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">Продукт</span>
              <button onClick={() => onView("analyze")} className="text-left text-slate-400 hover:text-white">
                Проверить фото
              </button>
              <button onClick={() => onView("consultant")} className="text-left text-slate-400 hover:text-white">
                Консультант
              </button>
              <button onClick={() => onView("account")} className="text-left text-slate-400 hover:text-white">
                Кабинет
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">Каналы</span>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                Telegram-бот
              </a>
              <a
                href="https://github.com/sumomega-nexus137/D-n-AI"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} D-n-AI. Оценка носит предварительный характер и не заменяет лабораторный анализ.</span>
          <span>Сделано на DINOv2 · FastAPI · React</span>
        </div>
      </div>
    </footer>
  );
}
