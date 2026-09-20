import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UploadZone from "./components/UploadZone.jsx";
import GrainResult from "./components/GrainResult.jsx";
import DiseaseResult from "./components/DiseaseResult.jsx";
import { analyzeDisease, analyzeGrain, ApiError } from "./lib/api.js";
import { DEMO_DISEASE, DEMO_GRAIN } from "./lib/demoResults.js";

const TABS = [
  {
    id: "grain",
    title: "Качество зерна",
    subtitle: "Доли по категориям, класс, цена и что делать с партией",
    hint: "Разложите пробу тонким слоем на контрастном фоне и снимите сверху",
  },
  {
    id: "disease",
    title: "Болезни и сорняки",
    subtitle: "Диагноз по листу или растению и меры обработки",
    hint: "Снимите поражённый лист крупным планом при дневном свете",
  },
];

export default function App() {
  const [tab, setTab] = useState("grain");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const active = TABS.find((t) => t.id === tab);

  const switchTab = (id) => {
    setTab(id);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const onSelectFile = (selected) => {
    setFile(selected);
    setResult(null);
    setError(null);
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = tab === "grain" ? await analyzeGrain(file) : await analyzeDisease(file);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        // Сервер недоступен — показываем сохранённый пример, а не пустой экран
        setResult(tab === "grain" ? DEMO_GRAIN : DEMO_DISEASE);
        setError("offline");
      } else {
        setError(err.message || "Не удалось выполнить анализ");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-14">
      <header className="mb-8 sm:mb-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-grain-500/15 ring-1 ring-grain-500/25">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-grain-400">
              <path
                d="M12 21V11m0 0c0-3 1.8-6 5-7 0 3.5-2 6.2-5 7Zm0 0C12 8 10.2 5 7 4c0 3.5 2 6.2 5 7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">D-n-AI</span>
          <span className="text-sm text-slate-500">агроскан</span>
        </div>

        <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Оценка зерна и посевов
          <br />
          <span className="text-slate-500">по одному фото</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400">
          Сфотографируйте пробу зерна или поражённый лист — получите разбор по категориям,
          предварительный класс, цену в тенге и конкретные шаги.
        </p>
      </header>

      {!online && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-grain-500/20 bg-grain-500/[0.06] px-4 py-3 text-sm text-grain-400">
          <span className="h-2 w-2 shrink-0 rounded-full bg-grain-500" />
          Нет подключения к интернету. Можно посмотреть сохранённый пример разбора.
        </div>
      )}

      <div className="mb-5 flex gap-1.5 rounded-xl border border-white/[0.06] bg-ink-900/60 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`relative flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-white/[0.07] ring-1 ring-white/10"
              />
            )}
            <span className="relative">{t.title}</span>
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-slate-500">{active.subtitle}</p>

      <UploadZone hint={active.hint} preview={preview} onFile={onSelectFile} disabled={loading} />

      <button
        onClick={run}
        disabled={!file || loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-grain-500 px-5 py-3.5 text-sm font-semibold text-ink-950 transition-all hover:bg-grain-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500"
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            />
            Анализируем…
          </>
        ) : (
          "Анализировать"
        )}
      </button>

      {error && error !== "offline" && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {result && (
          <div key={tab + (result.offline_sample ? "-demo" : "")} className="mt-8">
            {tab === "grain" ? <GrainResult data={result} /> : <DiseaseResult data={result} />}
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-16 border-t border-white/[0.06] pt-6 text-xs leading-relaxed text-slate-600">
        <p>
          D-n-AI — прототип для AgriTech AI Hackathon, трек «Компьютерное зрение в агрономии».
          Оценка носит предварительный характер и не заменяет лабораторный анализ и решение
          агронома.
        </p>
      </footer>
    </div>
  );
}
