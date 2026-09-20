import { motion } from "framer-motion";
import { kzt } from "../lib/format.js";

const PRIORITY = {
  high: { dot: "bg-rose-400", label: "Сделать сейчас", chip: "text-rose-300 border-rose-400/30 bg-rose-400/10" },
  medium: { dot: "bg-gold-400", label: "Стоит учесть", chip: "text-gold-300 border-gold-400/30 bg-gold-400/10" },
  low: { dot: "bg-moss-400", label: "На заметку", chip: "text-moss-300 border-moss-400/30 bg-moss-400/10" },
};

export default function Recommendations({ items }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-3">
      {items.map((rec, i) => {
        const p = PRIORITY[rec.priority] ?? PRIORITY.medium;
        return (
          <motion.div
            key={rec.title + i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.5 }}
            className="glass p-5"
          >
            <div className="flex items-start gap-3.5">
              <span className="relative mt-1 flex h-2.5 w-2.5 shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full ${p.dot} opacity-40 ${rec.priority === "high" ? "animate-ping" : ""}`} />
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${p.dot}`} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[15px] font-semibold text-white">{rec.title}</h4>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${p.chip}`}>
                    {p.label}
                  </span>
                  {rec.gain_kzt_per_ton ? (
                    <span className="rounded-full border border-moss-400/30 bg-moss-400/10 px-2 py-0.5 text-[11px] font-semibold text-moss-300">
                      +{kzt(rec.gain_kzt_per_ton)}/т
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{rec.detail}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
