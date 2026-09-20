import { motion } from "framer-motion";
import { IconChat } from "./icons.jsx";

const KIND = {
  disease: { label: "Болезнь", color: "text-rose-300 border-rose-400/30 bg-rose-400/10" },
  pest: { label: "Вредитель", color: "text-gold-300 border-gold-400/30 bg-gold-400/10" },
  weed: { label: "Сорняк", color: "text-moss-300 border-moss-400/30 bg-moss-400/10" },
  healthy: { label: "Здоровое растение", color: "text-moss-300 border-moss-400/30 bg-moss-400/10" },
};

const URGENCY = {
  high: { label: "🔴 Срочно", color: "text-rose-300" },
  medium: { label: "🟡 В ближайшее время", color: "text-gold-300" },
  low: { label: "⚪️ Под наблюдением", color: "text-slate-300" },
  none: { label: "🟢 Норма", color: "text-moss-300" },
};

function Ring({ value }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const pctv = Math.max(0, Math.min(1, value));
  return (
    <div className="relative h-[76px] w-[76px] shrink-0">
      <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="#f0c05a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pctv) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-white">
        {Math.round(pctv * 100)}%
      </div>
    </div>
  );
}

export default function DiseaseResult({ data, onConsult }) {
  const d = data.diagnosis;
  const kind = KIND[d.kind] ?? KIND.disease;
  const urg = URGENCY[d.urgency] ?? URGENCY.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-5"
    >
      {data.offline_sample && (
        <div className="rounded-xl border border-gold-500/20 bg-gold-500/[0.06] px-4 py-2.5 text-sm text-gold-300">
          Нет связи с сервером — показан сохранённый пример диагностики.
        </div>
      )}

      <div className="glass relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex items-start gap-5">
          <Ring value={d.confidence} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${kind.color}`}>
                {kind.label}
              </span>
              <span className={`text-xs font-medium ${urg.color}`}>{urg.label}</span>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">{d.name_ru}</h3>
            <p className="mt-0.5 text-sm text-slate-500">уверенность модели {Math.round(d.confidence * 100)}%</p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Что это</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{d.what_is_it}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Что делать</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{d.action}</p>
          </div>
        </div>
      </div>

      {data.alternatives?.length ? (
        <div className="glass p-6">
          <h4 className="text-sm font-semibold text-white">Другие возможные варианты</h4>
          <div className="mt-4 space-y-3">
            {data.alternatives.map((a) => (
              <div key={a.class} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm text-slate-300">{a.name_ru}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(2, a.confidence * 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-slate-500"
                  />
                </div>
                <span className="w-10 text-right text-sm tabular-nums text-slate-400">
                  {Math.round(a.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.low_confidence && data.confidence_note && (
        <div className="rounded-xl border border-gold-500/20 bg-gold-500/[0.06] px-4 py-3 text-sm text-gold-300">
          {data.confidence_note}
        </div>
      )}

      <button onClick={() => onConsult?.(data)} className="btn-ghost w-full">
        <IconChat className="h-4 w-4 text-moss-300" />
        Спросить консультанта об этом диагнозе
      </button>

      <p className="text-xs leading-relaxed text-slate-600">{data.disclaimer}</p>
    </motion.div>
  );
}
