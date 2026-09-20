import { useState } from "react";
import { motion } from "framer-motion";
import Recommendations from "./Recommendations.jsx";
import { kzt, pct, grains } from "../lib/format.js";
import { IconChat } from "./icons.jsx";

// Валидированная палитра (проверена на цветовую слепоту) — не менять порядок.
const SERIES = {
  celoe_zdorovoe: "#3987e5",
  bitoe_povrezhdennoe: "#d95926",
  shuploe_melkoe: "#199e70",
  prorosshee: "#c98500",
  primes: "#d55181",
};

function StatTile({ label, children, sub, accent }) {
  return (
    <div className="glass relative overflow-hidden p-5">
      {accent && (
        <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${accent} blur-2xl opacity-50`} />
      )}
      <div className="relative">
        <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
        <div className="mt-2">{children}</div>
        {sub && <div className="mt-1.5 text-xs text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

export default function GrainResult({ data, onConsult }) {
  const [hover, setHover] = useState(null);
  const cats = (data.categories || []).filter((c) => c.percent > 0);
  const shown = hover ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-5"
    >
      {data.offline_sample && (
        <div className="rounded-xl border border-gold-500/20 bg-gold-500/[0.06] px-4 py-2.5 text-sm text-gold-300">
          Нет связи с сервером — показан сохранённый пример разбора пробы.
        </div>
      )}

      {/* Три ключевые плитки */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Предварительный класс" accent="bg-gold-500/20">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-white">
              {data.grade ?? "—"}
            </span>
            <span className="text-lg text-slate-300">
              {data.grade ? "класс" : data.grade_label}
            </span>
          </div>
        </StatTile>

        <StatTile
          label="Ориентировочная цена"
          sub={
            data.price_range_kzt_per_ton
              ? `${kzt(data.price_range_kzt_per_ton[0])} — ${kzt(data.price_range_kzt_per_ton[1])}`
              : "партия не проходит 5 класс"
          }
        >
          <div className="font-display text-3xl font-bold text-white">
            {data.price_kzt_per_ton ? kzt(data.price_kzt_per_ton) : "—"}
          </div>
          {data.price_kzt_per_ton ? <div className="text-xs text-slate-500">за тонну</div> : null}
        </StatTile>

        <StatTile
          label="Потенциал после очистки"
          accent="bg-moss-500/20"
          sub={
            data.potential_grade
              ? `возможный класс: ${data.potential_grade}`
              : "очистка не поднимает класс"
          }
        >
          <div className="font-display text-3xl font-bold text-moss-300">
            {data.potential_gain_kzt_per_ton > 0 ? `+${kzt(data.potential_gain_kzt_per_ton)}` : "—"}
          </div>
          {data.potential_gain_kzt_per_ton > 0 ? <div className="text-xs text-slate-500">за тонну</div> : null}
        </StatTile>
      </div>

      {/* Состав пробы */}
      <div className="glass p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Состав пробы</h3>
          <span className="text-sm text-slate-500">
            {grains(data.grains_analyzed || data.total_grains || 0)}
          </span>
        </div>

        <div className="mt-4 h-5 min-h-[20px] text-sm text-slate-400">
          {shown ? (
            <span>
              <span className="font-medium text-white">{shown.label}</span> — {pct(shown.percent)}
            </span>
          ) : (
            <span>Наведите на сегмент, чтобы увидеть долю</span>
          )}
        </div>

        {/* Стековая полоса */}
        <div className="mt-2 flex h-9 w-full gap-[2px] overflow-hidden rounded-lg">
          {cats.map((c) => (
            <motion.button
              key={c.key}
              initial={{ width: 0 }}
              animate={{ width: `${c.percent}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHover(c)}
              onMouseLeave={() => setHover(null)}
              className="h-full min-w-[3px] rounded-[3px] transition-opacity"
              style={{
                backgroundColor: SERIES[c.key] || "#64748b",
                opacity: hover && hover.key !== c.key ? 0.4 : 1,
              }}
              aria-label={`${c.label}: ${pct(c.percent)}`}
            />
          ))}
        </div>

        {/* Легенда */}
        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {cats.map((c) => (
            <div key={c.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2.5 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SERIES[c.key] }} />
                {c.label}
              </span>
              <span className="font-medium tabular-nums text-white">{pct(c.percent)}</span>
            </div>
          ))}
        </div>

        <details className="mt-5 border-t border-white/[0.06] pt-4 text-sm">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">Показать таблицей</summary>
          <table className="mt-3 w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 font-medium">Категория</th>
                <th className="pb-2 text-right font-medium">Зёрен</th>
                <th className="pb-2 text-right font-medium">Доля</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {cats.map((c) => (
                <tr key={c.key} className="border-t border-white/[0.04]">
                  <td className="py-1.5">{c.label}</td>
                  <td className="py-1.5 text-right tabular-nums">{c.count}</td>
                  <td className="py-1.5 text-right tabular-nums">{pct(c.percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>

      {/* Рекомендации */}
      {data.recommendations?.length ? (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">Что делать</h3>
          <Recommendations items={data.recommendations} />
        </div>
      ) : null}

      {(data.confidence_note || data.sampling_note) && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-400">
          {data.confidence_note || data.sampling_note}
        </div>
      )}

      <button onClick={() => onConsult?.(data)} className="btn-ghost w-full group">
        <IconChat className="h-4 w-4 text-gold-300" />
        Спросить консультанта об этом результате
      </button>

      <p className="text-xs leading-relaxed text-slate-600">{data.disclaimer}</p>
    </motion.div>
  );
}
