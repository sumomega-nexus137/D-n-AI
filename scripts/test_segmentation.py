"""Быстрая проверка сегментации зёрен.

Без аргументов — генерирует синтетическое фото (эллипсы-"зёрна" на
тёмном фоне) и проверяет, что алгоритм находит разумное число компонент.
С аргументом — путь к реальному фото пробы, сохраняет кропы в out/.

Запуск:
    python scripts/test_segmentation.py
    python scripts/test_segmentation.py path/to/photo.jpg
"""

import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from backend.app.module1_grain.segmentation import segment_grains


def make_synthetic_image(n_grains: int = 25, size: int = 800) -> np.ndarray:
    """Эллипсы с лёгким радиальным градиентом (имитация блика на реальном
    зерне) — плоская заливка не даёт watershed'у по яркости зацепиться
    за единственный пик на зерно."""
    rng = np.random.default_rng(42)
    img = np.full((size, size, 3), 20, dtype=np.uint8)  # тёмный фон
    for _ in range(n_grains):
        cx, cy = rng.integers(60, size - 60, size=2)
        ax_a, ax_b = int(rng.integers(18, 30)), int(rng.integers(10, 16))
        angle = int(rng.integers(0, 180))
        base_color = rng.integers(150, 190, size=3)

        mask = np.zeros((size, size), dtype=np.uint8)
        cv2.ellipse(mask, (int(cx), int(cy)), (ax_a, ax_b), angle, 0, 360, 255, -1)
        dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
        if dist.max() > 0:
            dist = dist / dist.max()
        for c in range(3):
            layer = img[:, :, c].astype(np.float32)
            highlight = base_color[c] + dist * 50  # блик к центру ярче
            layer = np.where(mask > 0, highlight, layer)
            img[:, :, c] = layer.astype(np.uint8)
    return img


def main():
    if len(sys.argv) > 1:
        path = sys.argv[1]
        img = cv2.imread(path)
        if img is None:
            print(f"Не смог прочитать {path}")
            sys.exit(1)
        n_expected = None
    else:
        img = make_synthetic_image(n_grains=25)
        n_expected = 25
        cv2.imwrite("scripts/out_synthetic_input.png", img)

    crops = segment_grains(img)
    print(f"Найдено зёрен: {len(crops)}" + (f" (ожидалось ~{n_expected})" if n_expected else ""))

    out_dir = "scripts/out_crops"
    os.makedirs(out_dir, exist_ok=True)
    for i, c in enumerate(crops):
        cv2.imwrite(os.path.join(out_dir, f"grain_{i:03d}.png"), c.image)
    print(f"Кропы сохранены в {out_dir}/")

    if n_expected is not None:
        ok = abs(len(crops) - n_expected) <= 3
        print("OK" if ok else "ПОДОЗРИТЕЛЬНО: сильно отличается от ожидаемого числа")


if __name__ == "__main__":
    main()
