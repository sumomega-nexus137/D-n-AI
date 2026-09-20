"""Общий код для Colab-ноутбуков: загрузка DINOv2 и извлечение эмбеддингов.

Препроцессинг здесь обязан совпадать с `backend/app/common/embedder.py`
до последней константы. Если он разойдётся — голова будет обучена на одних
признаках, а в проде получит другие, и точность упадёт молча, без ошибки.
"""

from pathlib import Path

import cv2
import numpy as np
import torch

IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
INPUT_SIZE = 224
EMBED_DIM = 384  # dinov2_vits14

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}


def load_dinov2(name: str = "dinov2_vits14"):
    """Замороженный DINOv2. Ничего не дообучаем — только eval()."""
    model = torch.hub.load("facebookresearch/dinov2", name)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"DINOv2 {name} на {device}")
    return model.to(device).eval(), device


def preprocess(image_bgr: np.ndarray) -> np.ndarray:
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (INPUT_SIZE, INPUT_SIZE), interpolation=cv2.INTER_AREA)
    arr = resized.astype(np.float32) / 255.0
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    return np.transpose(arr, (2, 0, 1))


def list_split(split_dir: Path) -> tuple[list[Path], list[str]]:
    """Папка вида <split>/<класс>/*.png -> (пути, метки), отсортировано."""
    paths, labels = [], []
    for class_dir in sorted(p for p in split_dir.iterdir() if p.is_dir()):
        for img in sorted(class_dir.iterdir()):
            if img.suffix.lower() in IMAGE_SUFFIXES:
                paths.append(img)
                labels.append(class_dir.name)
    return paths, labels


def embed_paths(model, device, paths: list[Path], batch_size: int = 64) -> np.ndarray:
    """Пути к файлам -> матрица эмбеддингов (N, 384)."""
    feats = np.zeros((len(paths), EMBED_DIM), dtype=np.float32)
    buffer, index = [], []

    def flush():
        if not buffer:
            return
        tensor = torch.from_numpy(np.stack(buffer)).to(device)
        with torch.no_grad():
            feats[index] = model(tensor).cpu().numpy()
        buffer.clear()
        index.clear()

    for i, path in enumerate(paths):
        image = cv2.imread(str(path))
        if image is None:
            raise ValueError(f"Не читается файл: {path}")
        buffer.append(preprocess(image))
        index.append(i)
        if len(buffer) == batch_size:
            flush()
        if (i + 1) % 2000 == 0:
            print(f"  {i + 1}/{len(paths)}")
    flush()
    return feats
