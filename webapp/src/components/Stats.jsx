import Reveal from "./Reveal.jsx";
import { TELEGRAM_URL } from "../lib/config.js";
import { IconTelegram, IconArrow } from "./icons.jsx";

const METRICS = [
  { v: "98.8%", l: "accuracy по качеству зерна", s: "macro-F1 0.988, held-out тест" },
  { v: "85.7%", l: "accuracy по болезням и сорнякам", s: "24 класса, отдельный источник" },
  { v: "200K", l: "фото зерна в обучении", s: "датасет GrainSet, CC BY 4.0" },
  { v: "< 5 c", l: "ответ на одно фото", s: "на бесплатном CPU-хостинге" },
];

export default function Stats({ onConsultant }) {
  return (
    <section id="stats" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
      <Reveal>
        <span className="eyebrow">Точность и данные</span>
        <h2 className="mt-5 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
          Цифрам можно верить
        </h2>
        <p className="mt-4 max-w-xl text-lg text-slate-400">
          Метрики — на held-out тесте, это отдельный источник данных целиком, а
          не перемешанная выборка. Обучали один слой поверх замороженного DINOv2.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <Reveal key={m.l} delay={i * 0.06}>
            <div className="glass h-full p-6">
              <div className="text-gradient-gold font-display text-4xl font-bold">{m.v}</div>
              <div className="mt-3 text-sm font-medium text-slate-200">{m.l}</div>
              <div className="mt-1 text-xs text-slate-500">{m.s}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Полоса Telegram / консультант */}
      <Reveal delay={0.1}>
        <div className="glass mt-6 flex flex-col items-start justify-between gap-6 overflow-hidden p-8 sm:flex-row sm:items-center sm:p-10">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-moss-500/10 blur-3xl" />
          <div className="relative">
            <h3 className="text-2xl font-bold text-white">Всё то же — в Telegram</h3>
            <p className="mt-2 max-w-md text-[15px] text-slate-400">
              Фото прямо в чат, тот же разбор в ответ. Плюс голосовой вопрос на
              казахском или русском — ответит ИИ-консультант.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="btn-primary">
              <IconTelegram className="h-4 w-4" />
              Открыть бота
            </a>
            <button onClick={onConsultant} className="btn-ghost group">
              Спросить консультанта
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
