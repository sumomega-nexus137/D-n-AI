/** Кешированные примеры результата — показываются в офлайн-режиме, чтобы
 *  вместо белого экрана человек видел, как выглядит разбор пробы. */

export const DEMO_GRAIN = {
  module: "grain_quality",
  offline_sample: true,
  total_grains: 1000,
  grains_detected_total: 1000,
  grains_analyzed: 1000,
  categories: [
    { key: "celoe_zdorovoe", label: "Целое здоровое", count: 812, percent: 81.2 },
    { key: "bitoe_povrezhdennoe", label: "Битое / повреждённое", count: 96, percent: 9.6 },
    { key: "shuploe_melkoe", label: "Щуплое / мелкое", count: 41, percent: 4.1 },
    { key: "prorosshee", label: "Проросшее", count: 12, percent: 1.2 },
    { key: "primes", label: "Сорная примесь", count: 39, percent: 3.9 },
  ],
  summary: { sound_percent: 81.2, grain_impurity_percent: 14.9, foreign_impurity_percent: 3.9 },
  grade: 5,
  grade_label: "5 класс",
  price_kzt_per_ton: 75000,
  price_range_kzt_per_ton: [70000, 80000],
  // 102 500 ₸ (середина вилки 3 класса) − 75 000 ₸ = 27 500 ₸ потерь на тонне
  loss_vs_best_kzt_per_ton: 27500,
  potential_grade: 4,
  potential_gain_kzt_per_ton: 10000,
  recommendations: [
    {
      title: "Просеять партию",
      detail:
        "Сорная примесь 3,9% — выше нормы 2%. Просеивание на решётной очистке уберёт основную часть сора и поднимет сортность.",
      priority: "high",
      gain_kzt_per_ton: null,
    },
    {
      title: "Провести дочистку зерна",
      detail:
        "Битого и щуплого зерна 13,7%. Дочистка на сепараторе с калибровкой по размеру отсеет мелкую и дроблёную фракцию.",
      priority: "high",
      gain_kzt_per_ton: 10000,
    },
    {
      title: "Можно поднять до 4 класса",
      detail: "После очистки партия проходит под 4 класс. Прибавка около 10 000 ₸ за тонну.",
      priority: "high",
      gain_kzt_per_ton: 10000,
    },
  ],
  confidence_note: null,
  disclaimer:
    "Ориентировочная оценка по внешнему виду зерна на фото. Официальная классность определяется лабораторно.",
};

export const DEMO_DISEASE = {
  module: "plant_health",
  offline_sample: true,
  diagnosis: {
    class: "Mildew",
    name_ru: "Мучнистая роса",
    kind: "disease",
    confidence: 0.94,
    what_is_it: "Белый мучнистый налёт на листьях и стеблях, позже сереет.",
    action:
      "Фунгицид при поражении более 10% листовой поверхности. Избегать избыточных азотных подкормок и загущения посева.",
    urgency: "medium",
  },
  alternatives: [
    { class: "Leaf Blight", name_ru: "Гельминтоспориозная пятнистость листьев", confidence: 0.03 },
    { class: "Septoria", name_ru: "Септориоз", confidence: 0.01 },
  ],
  low_confidence: false,
  confidence_note: null,
  disclaimer:
    "Предварительная диагностика по фото. Перед обработкой уточните препарат и дозировку у агронома.",
};
