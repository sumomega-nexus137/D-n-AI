import { useState } from "react";
import { motion } from "framer-motion";
import { clearHistory, getHistory, signOut } from "../lib/store.js";
import { IconGrain, IconLeaf, IconArrow } from "./icons.jsx";

function timeAgo(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Account({ user, onSignIn, onSignOut, onAnalyze }) {
  const [history, setHistory] = useState(() => getHistory());

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70svh] max-w-xl flex-col items-center justify-center px-5 pt-28 text-center sm:pt-32">
        <h1 className="text-3xl font-bold text-white">Личный кабинет</h1>
        <p className="mt-3 max-w-sm text-slate-400">
          Войдите, чтобы сохранять историю анализов на этом устройстве.
        </p>
        <button onClick={onSignIn} className="btn-primary mt-6">
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-6 sm:pt-32">
      {/* Профиль */}
      <div className="glass flex flex-col items-start justify-between gap-5 p-7 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/15 text-xl font-bold text-gold-300 ring-1 ring-gold-500/25">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-slate-500">{user.email || "профиль на этом устройстве"}</p>
          </div>
        </div>
        <button
          onClick={() => {
            signOut();
            onSignOut();
          }}
          className="btn-ghost"
        >
          Выйти
        </button>
      </div>

      {/* История */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">История анализов</h2>
        {history.length > 0 && (
          <button
            onClick={() => {
              clearHistory();
              setHistory([]);
            }}
            className="text-sm text-slate-500 hover:text-slate-300"
          >
            Очистить
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass mt-4 flex flex-col items-center gap-4 py-14 text-center">
          <p className="text-slate-400">Пока ничего нет. Сделайте первый анализ.</p>
          <button onClick={() => onAnalyze("grain")} className="btn-primary">
            Проверить фото <IconArrow className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {history.map((h, i) => (
            <motion.button
              key={h.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onAnalyze(h.mode)}
              className="glass glass-hover flex w-full items-center gap-4 p-4 text-left"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                  h.mode === "grain"
                    ? "bg-gold-500/15 text-gold-300 ring-gold-500/25"
                    : "bg-moss-500/15 text-moss-300 ring-moss-500/25"
                }`}
              >
                {h.mode === "grain" ? <IconGrain className="h-5 w-5" /> : <IconLeaf className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">{h.summary}</div>
                <div className="text-xs text-slate-500">
                  {h.mode === "grain" ? "Качество зерна" : "Болезни и сорняки"} · {timeAgo(h.at)}
                </div>
              </div>
              <IconArrow className="h-4 w-4 shrink-0 text-slate-500" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
