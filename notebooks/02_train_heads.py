"""Этап 4: обучение голов-классификаторов поверх эмбеддингов DINOv2.

Единственное, что обучается во всём проекте: линейная голова
(LogisticRegression) на 384-мерных признаках замороженного DINOv2.

Сохраняет `models/<модуль>_head.pkl` и `models/<модуль>_classes.txt` —
именно эти файлы читает backend (`backend/app/common/heads.py`).

⚠️ Версия scikit-learn имеет значение: backend закреплён на 1.6.1
(`backend/requirements.txt`). Обучайте той же версией, иначе при загрузке
pickle посыплются предупреждения о несовместимости.

В Colab:
    !pip install -q scikit-learn==1.6.1
    !python notebooks/02_train_heads.py
"""

# %%
from pathlib import Path

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score

EMB = Path("/content/embeddings")
MODELS = Path("models")
MODELS.mkdir(exist_ok=True)

HEADS = {
    "module1_grain": {"out": "module1_grain_head", "max_iter": 3000},
    "module2_disease": {"out": "module2_disease_head", "max_iter": 2000},
}

# %%
for module, cfg in HEADS.items():
    x_train_path = EMB / f"{module}_train_X.npy"
    if not x_train_path.exists():
        print(f"пропуск {module}: нет {x_train_path}")
        continue

    X_train = np.load(x_train_path)
    y_train = np.load(EMB / f"{module}_train_y.npy", allow_pickle=True)
    X_test = np.load(EMB / f"{module}_test_X.npy")
    y_test = np.load(EMB / f"{module}_test_y.npy", allow_pickle=True)

    print(f"\n=== {module}")
    print(f"train {X_train.shape}, test {X_test.shape}, "
          f"классов {len(set(y_train))}")

    head = LogisticRegression(max_iter=cfg["max_iter"], n_jobs=-1)
    head.fit(X_train, y_train)

    pred = head.predict(X_test)
    acc = accuracy_score(y_test, pred)
    f1 = f1_score(y_test, pred, average="macro")
    print(f"Accuracy: {acc:.4f}  Macro-F1: {f1:.4f}")
    print(classification_report(y_test, pred, zero_division=0))

    joblib.dump(head, MODELS / f"{cfg['out']}.pkl")
    (MODELS / f"{cfg['out'].replace('_head', '_classes')}.txt").write_text(
        "\n".join(head.classes_)
    )
    print(f"сохранено: models/{cfg['out']}.pkl")

# %%
# Скачать обученные головы из Colab на свою машину:
#   from google.colab import files
#   files.download("models/module1_grain_head.pkl")
