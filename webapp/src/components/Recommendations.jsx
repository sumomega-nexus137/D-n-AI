import { motion } from "framer-motion";
import { kzt } from "../lib/format.js";

const PRIORITY = {
  high: { label: "Сделать сейчас", cls: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-500/25" },
  medium: { label: "Стоит учесть", cls: "bg-grain-500/12 text-grain-400 ring-1 ring-grain-500/25" },
  low: { label: "На заметку", cls: "bg-white/[0.06] text-slate-300 ring-1 ring-white/10" },
};

export default function Recommendations({ items }) {
  if (!items?.length) return null;

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-white">Что делать</h3>
      <ul className="space-y-3">
        {items.map((rec, i) => {
          const tone = PRIORITY[rec.priority] ?? PRIORITY.low;
          return (
            <motion.li
              key={rec.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.35 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium text-white">{rec.title}</h4>
                <span className={`pill ${tone.cls}`}>{tone.label}</span>
                {rec.gain_kzt_per_ton ? (
                  <span className="pill bg-leaf-500/12 text-leaf-400 ring-1 ring-leaf-500/25">
                    +{kzt(rec.gain_kzt_per_ton)}/т
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{rec.detail}</p>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
