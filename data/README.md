# data/

Сюда скачиваются датасеты. Сама папка (кроме этого README и `.gitkeep`)
исключена из git через `.gitignore` — датасеты слишком большие для репозитория.

- `module1_grain/raw/` — исходные датасеты для модуля "качество зерна"
  (GrainSpace, GrainSet, Kaggle)
- `module1_grain/processed/` — приведённые к единой таксономии классов данные
- `module2_disease/raw/` — исходные датасеты для модуля "болезни/сорняки"
  (PlantDoc, Roboflow, PlantVillage)
- `module2_disease/processed/` — приведённые к единой таксономии данные

Точные команды скачивания — см. `docs/DATASETS.md` (Этап 1).
