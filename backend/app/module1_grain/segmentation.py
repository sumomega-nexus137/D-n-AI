"""Классическая (без ML) сегментация зёрен на фото пробы пшеницы.

Ожидается фото пробы: много отдельных зёрен на контрастном фоне
(тёмный поднос/ткань, как в GrainSet). Пайплайн: бинаризация (Otsu) ->
морфологическая чистка -> watershed для разделения слипшихся зёрен ->
компоненты связности -> кроп каждого зерна с отступом.
"""

from dataclasses import dataclass

import cv2
import numpy as np


@dataclass
class GrainCrop:
    image: np.ndarray  # BGR-кроп отдельного зерна
    bbox: tuple[int, int, int, int]  # x, y, w, h в координатах исходного фото
    area_px: int
    centroid: tuple[float, float]


def _binarize(gray: np.ndarray) -> np.ndarray:
    """Otsu-порог. Пробуем обе полярности, берём ту, где доля переднего
    плана более правдоподобна для фото пробы зерна (не пустое и не всё
    фото целиком)."""
    _, mask_a = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    mask_b = cv2.bitwise_not(mask_a)

    total = gray.size
    frac_a = cv2.countNonZero(mask_a) / total
    frac_b = cv2.countNonZero(mask_b) / total

    def plausible(frac: float) -> float:
        # ожидаем зёрна где-то на 5%-70% кадра; чем ближе к разумной
        # середине, тем выше "правдоподобие"
        target = 0.3
        return -abs(frac - target)

    return mask_a if plausible(frac_a) >= plausible(frac_b) else mask_b


def segment_grains(
    image_bgr: np.ndarray,
    min_area_px: int = 150,
    max_area_frac: float = 0.05,
    pad: int = 6,
) -> list[GrainCrop]:
    """Находит отдельные зёрна на фото пробы и возвращает их кропы.

    min_area_px: отсекаем совсем мелкий мусор/шум
    max_area_frac: отсекаем совсем гигантские компоненты (слипшийся ком,
        либо неудачная бинаризация всего кадра) — доля от площади фото
    pad: отступ в пикселях вокруг bbox при кропе
    """
    h, w = image_bgr.shape[:2]
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    mask = _binarize(gray)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    # watershed, чтобы разделить слипшиеся зёрна
    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    _, sure_fg = cv2.threshold(dist, 0.4 * dist.max(), 255, 0)
    sure_fg = np.uint8(sure_fg)
    sure_bg = cv2.dilate(mask, kernel, iterations=3)
    unknown = cv2.subtract(sure_bg, sure_fg)

    _, markers = cv2.connectedComponents(sure_fg)
    markers = markers + 1
    markers[unknown == 255] = 0

    image_for_ws = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    cv2.watershed(image_for_ws, markers)

    max_area_px = max_area_frac * (h * w)
    crops: list[GrainCrop] = []

    for label in np.unique(markers):
        if label <= 1:  # 0 = граница watershed, 1 = фон
            continue
        component_mask = np.uint8(markers == label) * 255
        area = int(cv2.countNonZero(component_mask))
        if area < min_area_px or area > max_area_px:
            continue

        ys, xs = np.where(component_mask > 0)
        x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + pad)
        y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + pad)

        crop = image_bgr[y0:y1, x0:x1].copy()
        cx, cy = float(xs.mean()), float(ys.mean())
        crops.append(GrainCrop(image=crop, bbox=(x0, y0, x1 - x0, y1 - y0), area_px=area, centroid=(cx, cy)))

    return crops
