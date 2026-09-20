import { Component, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { IconArrow, IconGrain, IconLeaf } from "./icons.jsx";

const HeroScene = lazy(() => import("../three/HeroScene.jsx"));

// Если WebGL недоступен или сцена упала — показываем мягкое CSS-свечение,
// страница остаётся рабочей.
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero({ onAnalyze, onScrollModules }) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* 3D-сцена на фоне */}
      <div className="absolute inset-0 z-0">
        <SceneBoundary>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </SceneBoundary>
      </div>

      {/* Свечение-подложка (и запасной вариант без 3D) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[120px]" />
        <div className="absolute right-[12%] top-1/2 h-[360px] w-[360px] rounded-full bg-moss-500/10 blur-[120px]" />
      </div>

      {/* Градиенты для читаемости текста слева и затемнения краёв */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_100%_at_0%_50%,rgba(5,5,6,0.92)_0%,rgba(5,5,6,0.55)_38%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-base-950 to-transparent" />

      {/* Контент */}
      <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-24 pt-32 sm:px-6">
        <motion.span
          variants={fade}
          initial="hidden"
          animate="show"
          custom={0}
          className="eyebrow w-fit"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-moss-400" />
          AgriTech AI · Компьютерное зрение в агрономии
        </motion.span>

        <motion.h1
          variants={fade}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-6 max-w-3xl text-[42px] font-extrabold leading-[0.98] text-white sm:text-6xl md:text-7xl"
        >
          Качество зерна
          <br />
          <span className="text-gradient-gold">по одному фото</span>
        </motion.h1>

        <motion.p
          variants={fade}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300/90"
        >
          Сфотографируйте пробу зерна или больной лист — получите доли по
          категориям, предварительный класс, цену в тенге и точные шаги. За
          секунды, с телефона.
        </motion.p>

        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <button onClick={() => onAnalyze("grain")} className="btn-primary group">
            <IconGrain className="h-4 w-4" />
            Проверить зерно
            <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button onClick={() => onAnalyze("disease")} className="btn-ghost group">
            <IconLeaf className="h-4 w-4 text-moss-400" />
            Диагноз растения
          </button>
        </motion.div>

        {/* Мини-показатели доверия */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-14 flex flex-wrap gap-x-10 gap-y-6"
        >
          {[
            ["98.8%", "точность по зерну"],
            ["24", "класса болезней и сорняков"],
            ["< 5 c", "ответ на фото"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="font-display text-3xl font-bold text-white">{v}</div>
              <div className="mt-1 text-sm text-slate-400">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Подсказка скролла */}
      <button
        onClick={onScrollModules}
        className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-slate-500 transition-colors hover:text-slate-300 md:flex"
      >
        <span className="text-xs uppercase tracking-[0.2em]">листайте</span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/15 p-1">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="h-1.5 w-1 rounded-full bg-slate-400"
          />
        </span>
      </button>
    </section>
  );
}
