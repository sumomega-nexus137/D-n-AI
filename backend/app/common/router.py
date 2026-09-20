"""Автоопределение: на фото проба зерна или растение/лист.

Пользователь не должен выбирать модуль вручную — это выглядит несерьёзно и
приводит к ошибкам (лист, посчитанный как зерно). Решаем по картинке.

Сигналы (дёшево, без нейросети):
1. Доля «зелёного» — листья и растения зелёные, проба зерна нет.
2. Доля кадра под самым крупным объектом — лист занимает большую часть кадра,
   зерно рассыпано мелкими частицами.
3. Число найденных зёрен сегментацией — у пробы их много.
"""

import cv2
import numpy as np

from ..module1_grain.segmentation import segment_grains

GREEN_FRACTION_MIN = 0.12   # выше — почти наверняка растение
BIG_OBJECT_FRACTION = 0.22  # один объект занимает столько кадра — это лист/растение
MIN_GRAINS = 8              # столько частиц — это проба зерна


def _green_fraction(image_bgr: np.ndarray) -> float:
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    green = (h >= 35) & (h <= 85) & (s >= 35) & (v >= 35)
    return float(green.mean())


def _largest_blob_fraction(image_bgr: np.ndarray) -> float:
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # объект должен быть меньшинством пикселей; если наоборот — инвертируем
    if mask.mean() > 127:
        mask = 255 - mask
    num, _, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8))
    if num <= 1:
        return 0.0
    largest = stats[1:, cv2.CC_STAT_AREA].max()
    return float(largest) / mask.size


def detect_module(image_bgr: np.ndarray) -> str:
    """Возвращает 'grain' или 'disease'."""
    if _green_fraction(image_bgr) >= GREEN_FRACTION_MIN:
        return "disease"
    if _largest_blob_fraction(image_bgr) >= BIG_OBJECT_FRACTION:
        return "disease"
    try:
        if len(segment_grains(image_bgr)) >= MIN_GRAINS:
            return "grain"
    except Exception:  # noqa: BLE001 — при любой ошибке сегментации считаем растением
        return "disease"
    return "disease"
