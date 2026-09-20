"""Проверка, что справочник мер покрывает все классы обученной модели.

Модель умеет предсказать 24 класса. Если для какого-то из них нет карточки
в справочнике, пользователь вместо диагноза получит «Не определено» —
и это не упадёт с ошибкой, а тихо испортит ответ. Поэтому проверяем.
"""

from backend.app.common import config
from backend.app.module2_disease import knowledge

VALID_KINDS = {"disease", "pest", "weed", "healthy"}
VALID_URGENCY = {"high", "medium", "low", "none"}


def model_classes() -> list[str]:
    path = config.MODELS_DIR / "module2_disease_classes.txt"
    return [line for line in path.read_text(encoding="utf-8").splitlines() if line]


def test_every_model_class_has_a_knowledge_card():
    missing = [c for c in model_classes() if c not in knowledge.KNOWLEDGE]
    assert missing == [], f"нет карточки для классов: {missing}"


def test_knowledge_has_no_entries_the_model_cannot_predict():
    """Лишние карточки — признак рассинхрона справочника и обученной головы."""
    extra = sorted(set(knowledge.KNOWLEDGE) - set(model_classes()))
    assert extra == [], f"карточки без класса в модели: {extra}"


def test_cards_are_filled_and_well_formed():
    for name, info in knowledge.KNOWLEDGE.items():
        assert info.name_ru.strip(), f"{name}: пустое название"
        assert info.what_is_it.strip(), f"{name}: пустое описание"
        assert info.action.strip(), f"{name}: не сказано, что делать"
        assert info.kind in VALID_KINDS, f"{name}: неизвестный kind {info.kind!r}"
        assert info.urgency in VALID_URGENCY, f"{name}: неизвестная срочность"


def test_healthy_plant_is_not_urgent():
    healthy = knowledge.get("Healthy")
    assert healthy.kind == "healthy"
    assert healthy.urgency == "none"


def test_unknown_class_falls_back_to_a_safe_card():
    info = knowledge.get("Чего-то-такого-модель-не-знает")
    assert info is knowledge.UNKNOWN
    assert info.name_ru == "Не определено"
