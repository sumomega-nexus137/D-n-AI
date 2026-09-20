"""Этап 3: извлечение эмбеддингов замороженным DINOv2 (Google Colab, GPU T4).

Запускать после того, как датасеты разложены по папкам
`<DATA>/<модуль>/processed/<split>/<класс>/*.{png,jpg}`
(см. docs/DATASETS.md — какие источники и как они сводятся в таксономию).

Результат — .npy с эмбеддингами и метками, из них обучается голова
(02_train_heads.py). Сами эмбеддинги в git не кладём: они большие и
воспроизводятся за один прогон.

В Colab:
    !git clone -b claude/agritech-ai-hackathon-tlv08x https://github.com/sumomega-nexus137/D-n-AI
    %cd D-n-AI
    !python notebooks/01_extract_embeddings.py
"""

# %%
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common_colab import embed_paths, list_split, load_dinov2  # noqa: E402

DATA = Path("/content/data")
OUT = Path("/content/embeddings")
OUT.mkdir(parents=True, exist_ok=True)

MODULES = {
    # модуль: папка со сплитами
    "module1_grain": DATA / "module1_grain" / "processed" / "wheat",
    "module2_disease": DATA / "module2_disease" / "processed",
}

# %%
model, device = load_dinov2("dinov2_vits14")

# %%
for module, root in MODULES.items():
    if not root.exists():
        print(f"пропуск {module}: нет папки {root}")
        continue

    for split in ("train", "test"):
        split_dir = root / split
        if not split_dir.exists():
            print(f"пропуск {module}/{split}: нет папки")
            continue

        paths, labels = list_split(split_dir)
        print(f"\n{module}/{split}: {len(paths)} файлов, "
              f"{len(set(labels))} классов")

        features = embed_paths(model, device, paths)
        np.save(OUT / f"{module}_{split}_X.npy", features)
        np.save(OUT / f"{module}_{split}_y.npy", np.array(labels))
        print(f"  сохранено: {features.shape}")

# %%
print("\nГотово. Файлы:")
for f in sorted(OUT.iterdir()):
    print(" ", f.name, f.stat().st_size // 1024, "КБ")
