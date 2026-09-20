import Reveal from "./Reveal.jsx";
import { IconUpload, IconSpark, IconCheck } from "./icons.jsx";

const STEPS = [
  {
    n: "01",
    icon: <IconUpload className="h-5 w-5" />,
    title: "Снимаете фото",
    desc: "Проба зерна тонким слоем на контрастном фоне или поражённый лист крупным планом. С телефона.",
  },
  {
    n: "02",
    icon: <IconSpark className="h-5 w-5" />,
    title: "Модель разбирает",
    desc: "OpenCV вырезает каждое зерно, замороженный DINOv2 достаёт признаки, лёгкая голова классифицирует.",
  },
  {
    n: "03",
    icon: <IconCheck className="h-5 w-5" />,
    title: "Получаете решение",
    desc: "Класс, цена в тенге, состав пробы и понятные шаги — что сделать с партией и сколько это даст.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <span className="eyebrow">Как это работает</span>
          <h2 className="mt-5 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
            Три шага от снимка до денег
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="relative h-full">
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-3 top-8 hidden h-px w-6 bg-white/10 md:block" />
                )}
                <div className="glass glass-hover h-full p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-gold-300 ring-1 ring-white/10">
                      {s.icon}
                    </span>
                    <span className="font-display text-4xl font-bold text-white/10">{s.n}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-400">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
