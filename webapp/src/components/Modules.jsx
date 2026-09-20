import { motion } from "framer-motion";
import Reveal from "./Reveal.jsx";
import { IconArrow, IconGrain, IconLeaf } from "./icons.jsx";

function ModuleCard({ accent, icon, tag, title, desc, points, cta, onClick }) {
  const ring = accent === "gold" ? "group-hover:shadow-glow" : "group-hover:shadow-glow-moss";
  const iconWrap =
    accent === "gold"
      ? "bg-gold-500/15 text-gold-300 ring-gold-500/25"
      : "bg-moss-500/15 text-moss-300 ring-moss-500/25";
  const glow = accent === "gold" ? "bg-gold-500/10" : "bg-moss-500/10";

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group glass relative overflow-hidden p-7 text-left sm:p-9 ${ring}`}
    >
      <div className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full ${glow} blur-3xl opacity-60 transition-opacity group-hover:opacity-100`} />
      <div className="relative">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${iconWrap}`}>
          {icon}
        </span>
        <div className="mt-5 flex items-center gap-2">
          <span className="pill text-slate-400">{tag}</span>
        </div>
        <h3 className="mt-3 text-2xl font-bold text-white">{title}</h3>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-slate-400">{desc}</p>
        <ul className="mt-5 space-y-2">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${accent === "gold" ? "bg-gold-400" : "bg-moss-400"}`} />
              {p}
            </li>
          ))}
        </ul>
        <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white">
          {cta}
          <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
        </span>
      </div>
    </motion.button>
  );
}

export default function Modules({ onAnalyze }) {
  return (
    <section id="modules" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
      <Reveal>
        <span className="eyebrow">Два модуля</span>
        <h2 className="mt-5 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
          Карманный советник по партии
        </h2>
        <p className="mt-4 max-w-xl text-lg text-slate-400">
          Не «вероятность 0.87», а класс, деньги и конкретное действие — то, что
          фермеру нужно было всегда.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Reveal delay={0.05}>
          <ModuleCard
            accent="gold"
            icon={<IconGrain className="h-6 w-6" />}
            tag="Главный модуль"
            title="Качество зерна"
            desc="Сфотографировали пробу — узнали класс, цену и что делать. До того, как повезли на элеватор."
            points={[
              "Предварительный класс и цена в тенге за тонну",
              "Сколько теряете против хорошего 3 класса",
              "Прибавка после очистки — сколько выгадаете",
            ]}
            cta="Проверить зерно"
            onClick={() => onAnalyze("grain")}
          />
        </Reveal>
        <Reveal delay={0.12}>
          <ModuleCard
            accent="moss"
            icon={<IconLeaf className="h-6 w-6" />}
            tag="24 класса"
            title="Болезни и сорняки"
            desc="Фото листа или растения — диагноз, меры обработки и срочность, с альтернативными версиями."
            points={[
              "Болезни, вредители и сорняки пшеницы",
              "Что это, что делать и насколько срочно",
              "Честно говорит, когда не уверена",
            ]}
            cta="Поставить диагноз"
            onClick={() => onAnalyze("disease")}
          />
        </Reveal>
      </div>
    </section>
  );
}
