import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { askConsultant, ApiError } from "../lib/api.js";
import { IconSpark, IconArrow } from "./icons.jsx";

const SUGGESTIONS_GENERIC = [
  "Как поднять класс пшеницы перед продажей?",
  "При какой влажности хранить зерно?",
  "Когда обрабатывать посев от жёлтой ржавчины?",
];

const SUGGESTIONS_GRAIN = [
  "Стоит ли чистить эту партию?",
  "Как продать выгоднее при таком составе?",
  "Из-за чего может быть столько битого зерна?",
];

const SUGGESTIONS_DISEASE = [
  "Чем обработать и как срочно?",
  "Насколько это опасно для урожая?",
  "Как не допустить этого в следующем сезоне?",
];

function contextLabel(ctx) {
  if (!ctx) return null;
  if (ctx.diagnosis) return `Диагноз: ${ctx.diagnosis.name_ru}`;
  if (ctx.grade_label) return `Зерно: ${ctx.grade_label}`;
  return "Результат анализа";
}

export default function Consultant({ context }) {
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      text:
        "Здравствуйте! Я консультант Dän-AI. Помогу решить, что делать с партией: чистить или продавать, как не потерять класс, чем обработать посев. Спрашивайте коротко — отвечу по делу.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef();

  const suggestions = context?.diagnosis
    ? SUGGESTIONS_DISEASE
    : context?.grade_label
      ? SUGGESTIONS_GRAIN
      : SUGGESTIONS_GENERIC;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const { reply } = await askConsultant(q, context ?? null);
      setMessages((m) => [...m, { role: "assistant", text: reply || "…" }]);
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 0
          ? "Нет связи с сервером. Проверьте, что backend запущен."
          : err.message || "Консультант временно недоступен.";
      setMessages((m) => [...m, { role: "assistant", text: msg, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col px-5 pb-6 pt-28 sm:px-6 sm:pt-32">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/25">
          <IconSpark className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">ИИ-консультант</h1>
          <p className="text-sm text-slate-500">
            На базе Gemini · {contextLabel(context) || "общие вопросы по агрономии"}
          </p>
        </div>
      </div>

      {/* Лента сообщений */}
      <div className="glass flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gold-400 text-base-950"
                  : m.error
                    ? "border border-rose-400/20 bg-rose-400/[0.06] text-rose-200"
                    : "border border-white/[0.07] bg-white/[0.03] text-slate-200"
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.1, delay: d * 0.18 }}
                    className="h-1.5 w-1.5 rounded-full bg-slate-400"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Подсказки */}
      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Ввод */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Задайте вопрос агроному…"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-base-950 transition-all hover:bg-gold-300 disabled:opacity-40"
          aria-label="Отправить"
        >
          <IconArrow className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-2 text-center text-xs text-slate-600">
        Консультант даёт ориентиры. Дозировки и сроки уточняйте у агронома.
      </p>
    </div>
  );
}
