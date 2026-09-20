import { useState } from "react";
import { motion } from "framer-motion";
import { kzt, pct, grains } from "../lib/format.js";
import Recommendations from "./Recommendations.jsx";

// Категориальная палитра, проверенная валидатором на тёмной подложке #0b0e13:
// все пары соседних сегментов различимы и при дальтонизме.
const SERIES_COLORS = {
  celoe_zdorovoe: "#3987e5",
  bitoe_povrezhdennoe: "#d95926",
  shuploe_melkoe: "#199e70",
  prorosshee: "#c98500",
  primes: "#d55181",
};

const GRADE_TONE = {
  3: { ring: "ring-leaf-500/30", text: "text-leaf-400", bg: "bg-leaf-500/10", label: "Хороший" },
  4: { ring: "ring-grain-500/30", text: "text-grain-400", bg: "bg-grain-500/10", label: "Средний" },
  5: { ring: "ring-orange-500/30", text: "text-orange-400", bg: "bg-orange-500/10", label: "Низкий" },
};
const GRADE_FALLBACK = {
  ring: "ring-rose-500/30",
  text: "text-rose-400",
  bg: "bg-rose-500/10",
  label: "Вне класса",
};

function StatTile({ label, children, hint }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function DistributionBar({ categories }) {
  const [hovered, setHovered] = useState(null);
  const visible = categories.filter((c) => c.percent > 0);

  return (
    <div>
      <div className="mb-3 flex h-6 items-end">
        {hovered ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-300"
          >
            <span className="font-medium text-white">{hovered.label}</span>
            {" — "}
            {pct(hovered.percent)} · {grains(hovered.count)}
          </motion.p>
        ) : (
          <p className="text-sm text-slate-500">Состав пробы — наведите на сегмент</p>
        )}
      </div>

      <div
        className="flex h-6 w-full gap-[2px] overflow-hidden rounded-[4px]"
        role="img"
        aria-label={visible
          .map((c) => `${c.label}: ${pct(c.percent)}`)
          .join(", ")}
      >
        {visible.map((cat) => (
          <motion.div
            key={cat.key}
            initial={{ width: 0 }}
            animate={{ width: `${cat.percent}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(cat)}
            onMouseLeave={() => setHovered(null)}
            className="h-full min-w-[3px] cursor-default rounded-[4px] transition-opacity hover:opacity-90"
            style={{ backgroundColor: SERIES_COLORS[cat.key] }}
            title={`${cat.label}: ${pct(cat.percent)}`}
          />
        ))}
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {categories.map((cat) => (
          <li key={cat.key} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SERIES_COLORS[cat.key] }}
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-sm text-slate-300">{cat.label}</span>
            <span className="tabular-nums text-sm font-medium text-white">{pct(cat.percent)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GrainResult({ data }) {
  const tone = data.grade ? GRADE_TONE[data.grade] ?? GRADE_FALLBACK : GRADE_FALLBACK;
  const gain = data.potential_gain_kzt_per_ton;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {data.offline_sample && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          Нет связи с сервером — показан сохранённый пример разбора пробы.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Предварительный класс" hint={`Оценка качества: ${tone.label.toLowerCase()}`}>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-semibold tracking-tight ${tone.text}`}>
              {data.grade ?? "—"}
            </span>
            <span className="text-sm text-slate-400">
              {data.grade ? "класс" : data.grade_label}
            </span>
          </div>
        </StatTile>

        <StatTile
          label="Ориентировочная цена"
          hint={
            data.price_range_kzt_per_ton
              ? `Диапазон ${kzt(data.price_range_kzt_per_ton[0])} — ${kzt(
                  data.price_range_kzt_per_ton[1]
                )}`
              : "Партия не проходит под 5 класс"
          }
        >
          <p className="text-3xl font-semibold tracking-tight text-white">
            {data.price_kzt_per_ton ? kzt(data.price_kzt_per_ton) : "—"}
          </p>
          <p className="text-xs text-slate-500">за тонну</p>
        </StatTile>

        <StatTile
          label="Потенциал после очистки"
          hint={
            data.potential_grade
              ? `Возможный класс после подработки: ${data.potential_grade}`
              : "Очистка класс не поднимет"
          }
        >
          <p
            className={`text-3xl font-semibold tracking-tight ${
              gain > 0 ? "text-leaf-400" : "text-slate-400"
            }`}
          >
            {gain > 0 ? `+${kzt(gain)}` : "—"}
          </p>
          <p className="text-xs text-slate-500">за тонну</p>
        </StatTile>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-white">Состав пробы</h3>
          <p className="text-sm text-slate-500">
            Проанализировано {grains(data.grains_analyzed ?? data.total_grains)}
            {data.grains_detected_total &&
            data.grains_analyzed &&
            data.grains_detected_total > data.grains_analyzed
              ? ` из ${data.grains_detected_total} найденных`
              : ""}
          </p>
        </div>

        <DistributionBar categories={data.categories} />

        <details className="mt-6 border-t border-white/[0.06] pt-4">
          <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-200">
            Показать таблицей
          </summary>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 font-medium">Категория</th>
                <th className="pb-2 text-right font-medium">Зёрен</th>
                <th className="pb-2 text-right font-medium">Доля</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {data.categories.map((cat) => (
                <tr key={cat.key} className="border-t border-white/[0.04]">
                  <td className="py-2">{cat.label}</td>
                  <td className="py-2 text-right tabular-nums">{cat.count}</td>
                  <td className="py-2 text-right tabular-nums">{pct(cat.percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>

      {(data.confidence_note || data.sampling_note) && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-400">
          {data.confidence_note || data.sampling_note}
        </div>
      )}

      <Recommendations items={data.recommendations} />

      <p className="px-1 text-xs leading-relaxed text-slate-600">{data.disclaimer}</p>
    </motion.div>
  );
}
