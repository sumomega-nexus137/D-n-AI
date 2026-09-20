"""Оценка класса зерна, стоимости в тенге и рекомендаций фермеру.

ВАЖНО: это ориентировочная оценка по внешнему виду зерна на фото, а не
официальная лабораторная классификация. Настоящий ГОСТ учитывает ещё
клейковину, число падения, натуру и влажность — по фотографии их определить
невозможно. Пороги ниже — упрощённые и настраиваемые.
"""

from dataclasses import dataclass, field

from ..common import config

# Наши 5 классов модели -> роль в оценке качества
CLASS_LABELS_RU = {
    "celoe_zdorovoe": "Целое здоровое",
    "bitoe_povrezhdennoe": "Битое / повреждённое",
    "shuploe_melkoe": "Щуплое / мелкое",
    "prorosshee": "Проросшее",
    "primes": "Сорная примесь",
}

# Зерновая примесь по смыслу ГОСТ — повреждённое зерно культуры
GRAIN_IMPURITY_CLASSES = ("bitoe_povrezhdennoe", "shuploe_melkoe", "prorosshee")
# Сорная примесь — всё, что зерном не является
FOREIGN_IMPURITY_CLASSES = ("primes",)

# Упрощённые пороги классности (в процентах от пробы)
GRADE_LIMITS = {
    3: {"foreign_max": 2.0, "grain_impurity_max": 5.0, "sprouted_max": 1.0},
    4: {"foreign_max": 2.0, "grain_impurity_max": 15.0, "sprouted_max": 3.0},
    5: {"foreign_max": 5.0, "grain_impurity_max": 15.0, "sprouted_max": 5.0},
}

GRADE_PRICES_KZT = {
    3: config.PRICE_CLASS_3_KZT,
    4: config.PRICE_CLASS_4_KZT,
    5: config.PRICE_CLASS_5_KZT,
}

# Вилка «от и до» по каждому классу — её показываем фермеру
GRADE_PRICE_RANGES_KZT = {
    3: (config.PRICE_CLASS_3_MIN_KZT, config.PRICE_CLASS_3_MAX_KZT),
    4: (config.PRICE_CLASS_4_MIN_KZT, config.PRICE_CLASS_4_MAX_KZT),
    5: (config.PRICE_CLASS_5_MIN_KZT, config.PRICE_CLASS_5_MAX_KZT),
}

# Эффективность механической очистки (решётная очистка / просеивание):
# сорную примесь убирает почти полностью, битое и щуплое — частично.
CLEANING_REMOVAL = {
    "primes": 0.90,
    "bitoe_povrezhdennoe": 0.50,
    "shuploe_melkoe": 0.60,
    "prorosshee": 0.0,  # проросшее очисткой не убрать
}

MIN_GRAINS_FOR_CONFIDENCE = 80


def _pct(value: float) -> str:
    """Процент в русском формате: запятая как разделитель дробной части."""
    return f"{value:.1f}".replace(".", ",") + "%"


def _kzt(value: float) -> str:
    return f"{value:,.0f}".replace(",", " ") + " ₸"


@dataclass
class Recommendation:
    title: str
    detail: str
    priority: str  # high | medium | low
    gain_kzt_per_ton: float | None = None


@dataclass
class GrainAssessment:
    total_grains: int
    percentages: dict[str, float]
    foreign_pct: float
    grain_impurity_pct: float
    sound_pct: float
    grade: int | None
    grade_label: str
    price_kzt_per_ton: float | None
    price_range_kzt_per_ton: tuple[float, float] | None
    potential_grade: int | None
    potential_gain_kzt_per_ton: float
    loss_vs_best_kzt_per_ton: float = 0.0
    recommendations: list[Recommendation] = field(default_factory=list)
    confidence_note: str | None = None


def _percentages(counts: dict[str, int]) -> dict[str, float]:
    total = sum(counts.values())
    if total == 0:
        return {k: 0.0 for k in CLASS_LABELS_RU}
    return {k: 100.0 * counts.get(k, 0) / total for k in CLASS_LABELS_RU}


def _grade_for(foreign_pct: float, grain_impurity_pct: float, sprouted_pct: float) -> int | None:
    """Наименьший (то есть лучший) класс, под требования которого проба
    проходит. None — не проходит даже под 5 класс."""
    for grade in (3, 4, 5):
        limits = GRADE_LIMITS[grade]
        if (
            foreign_pct <= limits["foreign_max"]
            and grain_impurity_pct <= limits["grain_impurity_max"]
            and sprouted_pct <= limits["sprouted_max"]
        ):
            return grade
    return None


def _simulate_cleaning(percentages: dict[str, float]) -> dict[str, float]:
    """Как изменится состав пробы после механической очистки."""
    remaining = {}
    for cls, pct in percentages.items():
        removed_share = CLEANING_REMOVAL.get(cls, 0.0)
        remaining[cls] = pct * (1.0 - removed_share)

    total = sum(remaining.values())
    if total == 0:
        return remaining
    return {cls: 100.0 * val / total for cls, val in remaining.items()}


def _grade_label(grade: int | None) -> str:
    if grade is None:
        return "Ниже 5 класса"
    return f"{grade} класс"


def _price_range(grade: int | None) -> tuple[float, float]:
    if grade is None:
        return (config.PRICE_FODDER_MIN_KZT, config.PRICE_FODDER_MAX_KZT)
    return GRADE_PRICE_RANGES_KZT[grade]


def _build_recommendations(
    pct: dict[str, float],
    grade: int | None,
    potential_grade: int | None,
    gain: float,
) -> list[Recommendation]:
    recs: list[Recommendation] = []
    foreign = pct["primes"]
    broken = pct["bitoe_povrezhdennoe"]
    thin = pct["shuploe_melkoe"]
    sprouted = pct["prorosshee"]

    if potential_grade is not None and gain > 0 and (grade is None or potential_grade < grade):
        recs.append(
            Recommendation(
                title=f"Очистить партию — поднимете до {potential_grade} класса",
                detail=f"Прибавка примерно {_kzt(gain)} с каждой тонны.",
                priority="high",
                gain_kzt_per_ton=gain,
            )
        )

    if foreign > 2.0:
        recs.append(
            Recommendation(
                title="Просеять: много сора",
                detail=f"Сорной примеси {_pct(foreign)} при норме 2%. Решётная очистка уберёт основное.",
                priority="high",
            )
        )

    if broken + thin > 5.0:
        recs.append(
            Recommendation(
                title="Дочистить на сепараторе",
                detail=f"Битого и щуплого {_pct(broken + thin)}. Калибровка по размеру отсеет мелочь.",
                priority="high" if broken + thin > 12.0 else "medium",
            )
        )

    if sprouted > 1.0:
        recs.append(
            Recommendation(
                title="Проверить склад — есть проростки",
                detail=(
                    f"Проросшего {_pct(sprouted)}. Очисткой не убрать: проверьте влажность "
                    "и вентиляцию, продавайте быстрее."
                ),
                priority="high" if sprouted > 3.0 else "medium",
            )
        )

    if grade == 5 or grade is None:
        recs.append(
            Recommendation(
                title="Не выводится выше — продавайте на корм",
                detail="Фуражные цели или сдача на подработку элеватору будут выгоднее.",
                priority="medium",
            )
        )

    if grade == 3 and foreign <= 2.0 and broken + thin <= 5.0:
        recs.append(
            Recommendation(
                title="Партия в хорошем состоянии",
                detail="Держите влажность в норме при хранении, чтобы не потерять класс до продажи.",
                priority="low",
            )
        )

    return recs


def assess(counts: dict[str, int]) -> GrainAssessment:
    """Полная оценка пробы по подсчёту зёрен в каждой категории."""
    total = sum(counts.values())
    pct = _percentages(counts)

    if total == 0:
        return GrainAssessment(
            total_grains=0,
            percentages=pct,
            foreign_pct=0.0,
            grain_impurity_pct=0.0,
            sound_pct=0.0,
            grade=None,
            grade_label="Не определено",
            price_kzt_per_ton=None,
            price_range_kzt_per_ton=None,
            potential_grade=None,
            potential_gain_kzt_per_ton=0.0,
            recommendations=[],
            confidence_note=(
                "На фото не удалось выделить отдельные зёрна. Разложите пробу тонким "
                "слоем на контрастном фоне и снимите сверху при ровном освещении."
            ),
        )

    foreign_pct = sum(pct[c] for c in FOREIGN_IMPURITY_CLASSES)
    grain_impurity_pct = sum(pct[c] for c in GRAIN_IMPURITY_CLASSES)
    sound_pct = pct["celoe_zdorovoe"]

    grade = _grade_for(foreign_pct, grain_impurity_pct, pct["prorosshee"])

    cleaned = _simulate_cleaning(pct)
    potential_grade = _grade_for(
        sum(cleaned[c] for c in FOREIGN_IMPURITY_CLASSES),
        sum(cleaned[c] for c in GRAIN_IMPURITY_CLASSES),
        cleaned["prorosshee"],
    )

    # Цена показывается всегда: если партия не проходит даже 5 класс — это
    # фуражное зерно, и мы даём фуражную цену, а не «нет цены».
    if grade is None:
        price = config.PRICE_FODDER_KZT
        grade_label = "Фуражное (ниже 5 класса)"
    else:
        price = GRADE_PRICES_KZT[grade]
        grade_label = f"{grade} класс"
    price_range = _price_range(grade)

    potential_price = GRADE_PRICES_KZT.get(potential_grade) if potential_grade else None
    gain = 0.0
    if potential_price is not None and potential_price > price:
        gain = potential_price - price

    # Сколько партия теряет против хорошего 3 класса — главный ориентир по деньгам
    loss_vs_best = max(0.0, config.PRICE_CLASS_3_KZT - price)

    recommendations = _build_recommendations(pct, grade, potential_grade, gain)

    confidence_note = None
    if total == 0:
        confidence_note = (
            "На фото не удалось выделить отдельные зёрна. Разложите пробу тонким слоем "
            "на контрастном фоне и снимите сверху при ровном освещении."
        )
    elif total < MIN_GRAINS_FOR_CONFIDENCE:
        confidence_note = (
            f"Распознано всего {total} зёрен — для устойчивой оценки желательно "
            f"не меньше {MIN_GRAINS_FOR_CONFIDENCE}. Снимите пробу крупнее или разложите шире."
        )

    return GrainAssessment(
        total_grains=total,
        percentages=pct,
        foreign_pct=foreign_pct,
        grain_impurity_pct=grain_impurity_pct,
        sound_pct=sound_pct,
        grade=grade,
        grade_label=grade_label,
        price_kzt_per_ton=price,
        price_range_kzt_per_ton=price_range,
        potential_grade=potential_grade,
        potential_gain_kzt_per_ton=gain,
        loss_vs_best_kzt_per_ton=loss_vs_best,
        recommendations=recommendations,
        confidence_note=confidence_note,
    )
