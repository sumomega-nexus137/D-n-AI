# Обучение в Google Colab

Здесь лежит код, которым получены головы-классификаторы в `models/`.
Обучение вынесено в Colab по одной причине: бесплатный T4 извлекает
эмбеддинги DINOv2 для 35 тысяч изображений за минуты, а не за часы.

Скрипты оформлены в формате «percent-cells» (`# %%`) — открываются как
ноутбук в Colab/VS Code/Jupyter и одновременно запускаются как обычные
python-файлы.

## Порядок

```python
# 1. Клонируем репозиторий и ставим зависимости
!git clone -b claude/agritech-ai-hackathon-tlv08x https://github.com/sumomega-nexus137/D-n-AI
%cd D-n-AI
!pip install -q scikit-learn==1.6.1 opencv-python-headless joblib

# 2. Раскладываем датасеты (см. docs/DATASETS.md) в
#    /content/data/module1_grain/processed/wheat/{train,test}/<класс>/
#    /content/data/module2_disease/processed/{train,test}/<класс>/

# 3. Эмбеддинги замороженным DINOv2 -> /content/embeddings/*.npy
!python notebooks/01_extract_embeddings.py

# 4. Обучение голов -> models/*.pkl + models/*_classes.txt
!python notebooks/02_train_heads.py

# 5. Забрать обученные головы к себе
from google.colab import files
files.download("models/module1_grain_head.pkl")
files.download("models/module2_disease_head.pkl")
```

## Что важно не сломать

- **Препроцессинг в `common_colab.py` обязан совпадать с
  `backend/app/common/embedder.py`**: BGR→RGB, resize 224×224 (`INTER_AREA`),
  нормализация ImageNet. Разойдётся — голова получит в проде не те признаки,
  и точность упадёт молча, без единой ошибки в логах.
- **Версия scikit-learn — 1.6.1**, как в `backend/requirements.txt`. Pickle
  чувствителен к версии: обучите другой — backend будет ругаться при загрузке.
- **DINOv2 не дообучается.** `model.eval()`, `torch.no_grad()`, никаких
  оптимизаторов по его параметрам. Обучается ровно одна линейная голова.
- **Test — отдельный источник/сплит, не перемешанная выборка.** Иначе
  метрики будут красивые и бессмысленные.

Полученные метрики — в [`../docs/TRAINING_RESULTS.md`](../docs/TRAINING_RESULTS.md).
