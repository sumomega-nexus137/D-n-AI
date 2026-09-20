"""Тесты логики классности и экономики — самой ответственной части проекта.

Здесь считается то, что фермер увидит как «5 класс, 70 000 ₸ за тонну,
после очистки +15 000». Ошибка тут стоит дороже, чем ошибка модели на
одном зерне, поэтому граничные случаи закрыты тестами.

Запуск из корня репозитория:  pytest -q
"""

from backend.app.common import config
from backend.app.module1_grain import grading


def counts(celoe=0, bitoe=0, shuploe=0, prorosshee=0, primes=0) -> dict[str, int]:
    return {
        "celoe_zdorovoe": celoe,
        "bitoe_povrezhdennoe": bitoe,
        "shuploe_melkoe": shuploe,
        "prorosshee": prorosshee,
        "primes": primes,
    }


def titles(assessment) -> list[str]:
    return [r.title for r in assessment.recommendations]


# --- пустая проба: главный опасный случай ---------------------------------


def test_empty_sample_has_no_grade_and_no_price():
    """Если зёрен не нашли — нельзя выдавать класс и цену с потолка."""
    a = grading.assess(counts())

    assert a.total_grains == 0
    assert a.grade is None
    assert a.grade_label == "Не определено"
    assert a.price_kzt_per_ton is None
    assert a.price_range_kzt_per_ton is None
    assert a.recommendations == []
    assert "не удалось выделить" in a.confidence_note


# --- чистая партия ---------------------------------------------------------


def test_clean_sample_is_third_grade():
    a = grading.assess(counts(celoe=970, bitoe=20, shuploe=10))

    assert a.grade == 3
    assert a.price_kzt_per_ton == config.PRICE_CLASS_3_KZT
    assert a.price_range_kzt_per_ton == (
        config.PRICE_CLASS_3_MIN_KZT,
        config.PRICE_CLASS_3_MAX_KZT,
    )
    assert a.potential_gain_kzt_per_ton == 0
    # 3 класс — лучший, терять нечего
    assert a.loss_vs_best_kzt_per_ton == 0
    assert titles(a) == ["Партия в хорошем состоянии"]


# --- грязная партия: сор + битое -------------------------------------------


def test_dirty_sample_gets_cleaning_advice_and_upgrade():
    # 5% сора и 15% зерновой примеси -> проходит только под 5 класс
    a = grading.assess(counts(celoe=800, bitoe=100, shuploe=50, primes=50))

    assert a.grade == 5
    assert a.foreign_pct == 5.0
    assert a.grain_impurity_pct == 15.0
    assert a.price_kzt_per_ton == config.PRICE_CLASS_5_KZT

    # очистка убирает сор и часть битого -> 4 класс
    assert a.potential_grade == 4
    assert a.potential_gain_kzt_per_ton == (
        config.PRICE_CLASS_4_KZT - config.PRICE_CLASS_5_KZT
    )

    # теряем против 3 класса
    assert a.loss_vs_best_kzt_per_ton == (
        config.PRICE_CLASS_3_KZT - config.PRICE_CLASS_5_KZT
    )
    assert "Просеять: много сора" in titles(a)
    assert "Дочистить на сепараторе" in titles(a)
    assert "Очистить партию — поднимете до 4 класса" in titles(a)
    assert "Не выводится выше — продавайте на корм" in titles(a)


def test_foreign_impurity_within_norm_gives_no_sieving_advice():
    a = grading.assess(counts(celoe=990, primes=10))  # 1% сора, норма 2%

    assert a.grade == 3
    assert "Просеять: много сора" not in titles(a)


# --- проросшее: очисткой не лечится ----------------------------------------


def test_sprouted_grain_warns_about_storage_not_cleaning():
    a = grading.assess(counts(celoe=950, prorosshee=50))  # 5% проросшего

    assert "Проверить склад — есть проростки" in titles(a)
    # проросшее очистка не убирает, класс подняться не должен
    assert a.potential_grade == a.grade


def test_sprouted_above_three_percent_is_high_priority():
    a = grading.assess(counts(celoe=950, prorosshee=50))
    rec = next(r for r in a.recommendations if r.title == "Проверить склад — есть проростки")
    assert rec.priority == "high"


# --- партия ниже 5 класса ---------------------------------------------------


def test_below_fifth_grade_shows_fodder_price_and_gain():
    """Ниже 5 класса — показываем фуражную цену (не «нет цены») и прибавку от неё."""
    a = grading.assess(counts(celoe=900, primes=100))  # 10% сора

    assert a.grade is None
    assert a.grade_label == "Фуражное (ниже 5 класса)"
    # цена показывается всегда — это фуражное зерно
    assert a.price_kzt_per_ton == config.PRICE_FODDER_KZT
    assert a.price_range_kzt_per_ton is not None
    assert a.potential_grade == 3
    assert a.potential_gain_kzt_per_ton == (
        config.PRICE_CLASS_3_KZT - config.PRICE_FODDER_KZT
    )
    # совет поднять класс обязан появиться, хотя текущего класса нет
    assert "Очистить партию — поднимете до 3 класса" in titles(a)


# --- доверие к оценке -------------------------------------------------------


def test_small_sample_gets_confidence_warning():
    a = grading.assess(counts(celoe=50))

    assert a.grade == 3
    assert a.confidence_note is not None
    assert str(grading.MIN_GRAINS_FOR_CONFIDENCE) in a.confidence_note


def test_large_sample_has_no_confidence_warning():
    a = grading.assess(counts(celoe=500))
    assert a.confidence_note is None


# --- проценты считаются от общего числа ------------------------------------


def test_percentages_sum_to_hundred():
    a = grading.assess(counts(celoe=317, bitoe=41, shuploe=23, prorosshee=7, primes=12))
    assert round(sum(a.percentages.values()), 6) == 100.0
    assert a.sound_pct + a.grain_impurity_pct + a.foreign_pct == a.percentages[
        "celoe_zdorovoe"
    ] + sum(
        a.percentages[c]
        for c in grading.GRAIN_IMPURITY_CLASSES + grading.FOREIGN_IMPURITY_CLASSES
    )


# --- формат чисел для фермера ----------------------------------------------


def test_numbers_are_formatted_in_russian():
    """Запятая в дробях и пробел в тысячах — иначе текст читается как чужой."""
    assert grading._pct(3.9) == "3,9%"
    assert grading._pct(15.0) == "15,0%"
    assert grading._kzt(15000) == "15 000 ₸"
    assert grading._kzt(102000) == "102 000 ₸"
