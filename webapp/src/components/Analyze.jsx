import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UploadZone from "./UploadZone.jsx";
import GrainResult from "./GrainResult.jsx";
import DiseaseResult from "./DiseaseResult.jsx";
import { analyzeDisease, analyzeGrain, ApiError } from "../lib/api.js";
import { DEMO_DISEASE, DEMO_GRAIN } from "../lib/demoResults.js";
import { addHistory } from "../lib/store.js";
import { kzt } from "../lib/format.js";
import { IconGrain, IconLeaf } from "./icons.jsx";

const TABS = {
  grain: {
    label: "Качество зерна",
    icon: IconGrain,
    hint: "Разложите пробу тонким слоем на контрастном фоне, снимайте сверху",
    accent: "gold",
  },
  disease: {
    label: "Болезни и сорняки",
    icon: IconLeaf,
    hint: "Поражённый лист крупным планом при дневном свете",
    accent: "moss",
  },
};

const LOADING_STEPS = [
  "Готовлю изображение…",
  "Выделяю объекты (OpenCV)…",
  "Извлекаю признаки (DINOv2)…",
  "Классифицирую и считаю доли…",
];

function LoadingState() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % LOADING_STEPS.length), 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="glass flex flex-col items-center justify-center gap-5 py-16">
      <div className="relative h-16 w-16">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-gold-400/30 border-t-gold-400"
        />
        <motion.span
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.7, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-moss-400/20 border-b-moss-400"
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-sm text-slate-400"
        >
          {LOADING_STEPS[step]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function Analyze({ initialMode = "grain", onConsult }) {
  const [mode, setMode] = useState(initialMode);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => setMode(initialMode), [initialMode]);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const switchMode = (m) => {
    setMode(m);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const saveHistory = (m, data) => {
    if (data.offline_sample) return;
    const summary =
      m === "grain"
        ? `${data.grade_label}${data.price_kzt_per_ton ? " · " + kzt(data.price_kzt_per_ton) + "/т" : ""}`
        : `${data.diagnosis?.name_ru} · ${Math.round((data.diagnosis?.confidence || 0) * 100)}%`;
    try {
      addHistory({ mode: m, summary });
    } catch {
      /* localStorage недоступен */
    }
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = mode === "grain" ? await analyzeGrain(file) : await analyzeDisease(file);
      setResult(data);
      saveHistory(mode, data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        setResult(mode === "grain" ? DEMO_GRAIN : DEMO_DISEASE);
        setError("offline");
      } else {
        setError(err.message || "Не удалось выполнить анализ");
      }
    } finally {
      setLoading(false);
    }
  };

  const tab = TABS[mode];

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-6 sm:pt-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Анализ по фото</h1>
        <p className="mt-2 text-slate-400">Загрузите снимок — модель разберёт его за несколько секунд.</p>
      </div>

      {/* Переключатель модулей */}
      <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1.5">
        {Object.entries(TABS).map(([id, t]) => {
          const Icon = t.icon;
          return (
            <button
              key={id}
              onClick={() => switchMode(id)}
              className={`relative flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                mode === id ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode === id && (
                <motion.span
                  layoutId="analyze-tab"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-white/[0.06] ring-1 ring-white/10"
                />
              )}
              <Icon className={`relative h-4 w-4 ${t.accent === "gold" ? "text-gold-300" : "text-moss-300"}`} />
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      <UploadZone
        hint={tab.hint}
        preview={preview}
        onFile={(f) => {
          setFile(f);
          setResult(null);
          setError(null);
        }}
        disabled={loading}
        accent={tab.accent}
      />

      <button onClick={run} disabled={!file || loading} className="btn-primary mt-4 w-full disabled:opacity-50">
        {loading ? "Анализирую…" : "Анализировать"}
      </button>

      {error && error !== "offline" && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" exit={{ opacity: 0 }}>
              <LoadingState />
            </motion.div>
          ) : result ? (
            <div key={mode + (result.offline_sample ? "-demo" : "")}>
              {mode === "grain" ? (
                <GrainResult data={result} onConsult={onConsult} />
              ) : (
                <DiseaseResult data={result} onConsult={onConsult} />
              )}
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
