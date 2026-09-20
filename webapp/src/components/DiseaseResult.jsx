import { motion } from "framer-motion";

const URGENCY = {
  high: {
    label: "Срочно",
    cls: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-500/25",
    note: "Действовать в ближайшие дни — потери растут быстро",
  },
  medium: {
    label: "В ближайшее время",
    cls: "bg-grain-500/12 text-grain-400 ring-1 ring-grain-500/25",
    note: "Запланировать обработку в текущем цикле работ",
  },
  low: {
    label: "Под наблюдением",
    cls: "bg-white/[0.06] text-slate-300 ring-1 ring-white/10",
    note: "Контролировать при плановом осмотре",
  },
  none: {
    label: "Норма",
    cls: "bg-leaf-500/12 text-leaf-400 ring-1 ring-leaf-500/25",
    note: "Признаков поражения не выявлено",
  },
};

const KIND_LABEL = {
  disease: "Болезнь",
  pest: "Вредитель",
  weed: "Сорняк",
  healthy: "Здоровое растение",
};

export default function DiseaseResult({ data }) {
  const d = data.diagnosis;
  const urgency = URGENCY[d.urgency] ?? URGENCY.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {data.offline_sample && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          Нет связи с сервером — показан сохранённый пример диагностики.
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="border-b border-white/[0.06] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill bg-white/[0.06] text-slate-300 ring-1 ring-white/10">
              {KIND_LABEL[d.kind] ?? "Диагноз"}
            </span>
            <span className={`pill ${urgency.cls}`}>{urgency.label}</span>
          </div>

          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {d.name_ru}
          </h3>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(d.confidence * 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-grain-500"
              />
            </div>
            <span className="tabular-nums text-sm text-slate-400">
              {Math.round(d.confidence * 100)}%
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">Уверенность модели</p>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Что это</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{d.what_is_it}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Что делать</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{d.action}</p>
            <p className="mt-2 text-xs text-slate-500">{urgency.note}</p>
          </div>
        </div>
      </div>

      {data.low_confidence && data.confidence_note && (
        <div className="rounded-xl border border-grain-500/20 bg-grain-500/[0.06] px-4 py-3 text-sm text-grain-400">
          {data.confidence_note}
        </div>
      )}

      {data.alternatives?.length > 0 && (
        <div className="card p-5 sm:p-6">
          <h3 className="mb-3 text-base font-semibold text-white">Другие возможные варианты</h3>
          <ul className="space-y-2">
            {data.alternatives.map((alt) => (
              <li
                key={alt.class}
                className="flex items-center justify-between gap-3 border-t border-white/[0.04] pt-2 first:border-0 first:pt-0"
              >
                <span className="text-sm text-slate-300">{alt.name_ru}</span>
                <span className="tabular-nums text-sm text-slate-500">
                  {Math.round(alt.confidence * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="px-1 text-xs leading-relaxed text-slate-600">{data.disclaimer}</p>
    </motion.div>
  );
}
