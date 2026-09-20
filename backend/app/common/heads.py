"""Загрузка обученных голов-классификаторов (LogisticRegression поверх
эмбеддингов DINOv2) и их списков классов."""

import threading
from dataclasses import dataclass

import joblib
import numpy as np

from . import config


@dataclass
class Head:
    model: object
    classes: list[str]

    def predict(self, embeddings: np.ndarray) -> np.ndarray:
        return self.model.predict(embeddings)

    def predict_proba(self, embeddings: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(embeddings)


_cache: dict[str, Head] = {}
_lock = threading.Lock()


def _load(name: str) -> Head:
    if name in _cache:
        return _cache[name]
    with _lock:
        if name not in _cache:
            model = joblib.load(config.MODELS_DIR / f"{name}_head.pkl")
            classes_path = config.MODELS_DIR / f"{name}_classes.txt"
            classes = classes_path.read_text(encoding="utf-8").splitlines()
            _cache[name] = Head(model=model, classes=classes)
    return _cache[name]


def grain_head() -> Head:
    return _load("module1_grain")


def disease_head() -> Head:
    return _load("module2_disease")
