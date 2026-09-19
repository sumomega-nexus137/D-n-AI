# Датасеты

## Модуль 1: качество зерна пшеницы

### Основной источник: GrainSet

- Статья: Fan et al., "An annotated grain kernel image database for visual
  quality inspection", *Scientific Data* (2023),
  DOI: 10.1038/s41597-023-02660-8
- Репозиторий: https://github.com/hellodfan/GrainSet
- Данные: Figshare, лицензия **CC BY 4.0**
- Пшеница: ~200K одноклеточных (single-kernel) изображений
- Скачивание (прямая ссылка, без регистрации):
  - Полный набор пшеницы (200K): DOI `10.6084/m9.figshare.22992317.v2` →
    `https://ndownloader.figshare.com/articles/22992317/versions/2`
  - Превью GrainSet-tiny (2%, 6.5K): DOI `10.6084/m9.figshare.22989029.v1` →
    `https://ndownloader.figshare.com/articles/22989029/versions/1`
  - **Важно**: figshare отдаёт zip-архив статьи, внутри которого лежит ещё
    один zip с данными (например `GrainSet-tiny.zip`) — нужно распаковывать
    дважды.
- Структура после распаковки: `tiny_data/wheat/{train,test}/<класс>/*.png`
  + `tiny_data/wheat/mask/*.png` (маски) + `wheat_tiny.xml` (метаданные:
    `ID`, `species`, `sub-species`, `location` (регион/страна, напр. `CN`),
    `time`, `size`, `DU_grain` (класс), `weight`).
- **GrainSet уже содержит собственное разбиение train/test** — используем
  его напрямую, не нужно делать свой сплит.
- Метаданные `location` позволяют дополнительно проверить генерализацию по
  региону сбора данных при необходимости.

**Классы пшеницы в GrainSet (поле `DU_grain`):**

| Код | Расшифровка |
|---|---|
| `0_NOR` | Normal — здоровое зерно |
| `1_F&S` | Fusarium & Shrivelled — заражено фузариозом / сморщенное |
| `2_SD` | Sprouted — проросшее |
| `3_MY` | Moldy — заплесневелое |
| `4_AP` | Attacked by Pest — повреждено вредителем |
| `5_BN` | Broken — битое |
| `6_BP` | Black Point — чёрная точка |
| `7_IM` | Impurities — примеси (постороннее, не отфильтрованное на сборе) |

**Итоговая таксономия проекта (5 классов) ← классы GrainSet:**

| Класс проекта | Классы GrainSet |
|---|---|
| целое здоровое | `0_NOR` |
| битое-повреждённое | `3_MY`, `4_AP`, `5_BN`, `6_BP` |
| щуплое-мелкое | `1_F&S` |
| проросшее | `2_SD` |
| примесь | `7_IM` |

### Дополнительно рассматривался: GrainSpace (CVPR 2022)

- Репозиторий: https://github.com/hellodfan/GrainSpace
- **Train/val доступны только по запросу авторам** (не успеваем до
  дедлайна) — train/val из GrainSpace НЕ используем.
- Публичный test-набор (Baidu-диск с паролем; папка Google Drive
  недоступна — отдаёт 404 при скачивании через `gdown`, вероятно из-за
  ограничения по числу обращений) — **тоже не используем**, т.к.
  недоступен на практике.
- Лицензия GrainSpace: CC BY-NC-SA 4.0 (некоммерческая) — ещё один повод
  не завязываться на неё как на основной источник.
- **Итог: GrainSpace исключён из пайплайна.** Held-out тест строим внутри
  самого GrainSet, используя его собственный `test`-сплит (и при
  необходимости — разбиение по `location`, если нужна дополнительная
  проверка кросс-регионной генерализации).

### Kaggle

Не используется на данный момент — датасеты, найденные по запросам "wheat
seed classification" / "grain quality", оказались в основном табличными
(геометрические признаки, как классический UCI Seeds), а не фотографиями,
пригодными для пайплайна DINOv2. Может быть добавлен позже как бонус, если
останется время — не является блокером.

### Финальная подвыборка для обучения (Colab, `/content/data/module1_grain/processed/wheat/`)

Полные 200K изображений не нужны для обучения линейной/XGBoost головы поверх
замороженного DINOv2 — взята сбалансированная стратифицированная подвыборка:

| Класс проекта | train | test |
|---|---|---|
| целое здоровое | 4000 | 500 |
| битое-повреждённое | 4000 (по ~1000 из MY/AP/BN/BP) | 500 |
| щуплое-мелкое | 4000 | 500 |
| проросшее | 4000 | 500 |
| примесь | 4000 | 500 |

Итого 20000 train + 2500 test. `train`/`test` — собственное разбиение
GrainSet (не пересекаются, честный held-out).

## Модуль 2: болезни/сорняки пшеницы и ячменя

Источники (по списку организаторов хакатона, совпадает с изначальным
планом):

- **PlantDoc**: https://github.com/pratikkayal/PlantDoc-Dataset — реальные
  фото (не лабораторные), разные культуры, есть пшеница
- **Roboflow Universe**: поиск "wheat disease" / "wheat weed" —
  https://universe.roboflow.com/search?q=wheat%20disease
- **PlantVillage**: https://www.kaggle.com/datasets/emmarex/plantdisease —
  только как дополнение объёма классов (лабораторный фон, нет пшеницы)
- Kaggle — общий поиск по мере необходимости

Не используются (общие видовые/аэро-датасеты, не подходят под пайплайн
"фото листа крупным планом" или требуют долгой фильтрации не по времени):
Agriculture-Vision (дрон-снимки полей), PlantNet, iNaturalist.

### PlantDoc — проверен, не подходит

https://github.com/pratikkayal/PlantDoc-Dataset — скачан, но **не содержит
ни пшеницы, ни ячменя** (только яблоня, томат, картофель, виноград, кукуруза
и др.). Не используется для Модуля 2.

### Основные источники болезней/вредителей пшеницы (Kaggle)

**`kushagra3204/wheat-plant-diseases`** (лицензия CC0-1.0, скачан):
Aphid (903), Black Rust (576), Blast (647), Brown Rust (1271), Common Root
Rot (614), Fusarium Head Blight (611), Healthy (1000), Leaf Blight (842),
Mildew (1081), Mite (800), Septoria (1144), Smut (1310), Stem fly (234),
Tan spot (770), Yellow Rust (1301). Готовое разбиение `train/valid/test`.
Помимо болезней содержит вредителей (Aphid/тля, Mite/клещ, Stem fly/
стеблевая муха) — оставляем как бонус сверх исходного плана.

**`olyadgetch/wheat-leaf-dataset`** (лицензия copyright-authors, скачан):
Healthy (102), septoria (97), stripe_rust (208).

**Объединение классов между источниками** (одинаковые заболевания под
разными именами):
- `Yellow Rust` (kushagra) = `stripe_rust` (olyadgetch) — жёлтая/полосатая
  ржавчина
- `Septoria` = `septoria` — септориоз
- `Healthy` = `Healthy` — здоровый лист

### Сорняки

Roboflow Universe оказался непригоден — там только аэро-снимки поля сверху
(не подходит под наш пайплайн "крупный план одного объекта").

Найден подходящий источник: **`vbookshelf/v2-plant-seedlings-dataset`**
(Kaggle, лицензия CC-BY-SA-4.0) — классический "Plant Seedlings Dataset"
(Aarhus University), крупные фото отдельных ростков. 12 классов: 3 культуры
(Common wheat, Maize, Sugar beet — не используем) + **9 видов сорняков**
(используем): Black-grass (309), Charlock (452), Cleavers (335), Common
Chickweed (713), Fat Hen (538), Loose Silky-bent (762), Scentless Mayweed
(607), Shepherd's Purse (274), Small-flowered Cranesbill (576).

В архиве также есть папка `nonsegmentedv2` — дубликаты тех же фото без
удаления фона, **не используем** (сегментированные версии в корневых папках
чище).

### Финальная таксономия Модуля 2

Берём классы "как есть" из источников (без искусственного объединения в
5 категорий, как в Модуле 1) — итоговый список:

**Болезни/вредители** (источник: `wheat-plant-diseases` + `wheat-leaf-dataset`,
объединены дубли Yellow Rust=stripe_rust, Septoria=septoria, Healthy=Healthy):
Healthy, Black Rust, Blast, Brown Rust, Common Root Rot, Fusarium Head
Blight, Leaf Blight, Mildew, Septoria/stripe_rust(Yellow Rust), Smut, Tan
spot, Aphid, Mite, Stem fly — 14 классов.

**Сорняки** (источник: Plant Seedlings Dataset): Black-grass, Charlock,
Cleavers, Common Chickweed, Fat Hen, Loose Silky-bent, Scentless Mayweed,
Shepherd's Purse, Small-flowered Cranesbill — 9 классов.

Итого 23 класса для Модуля 2. Объёмы финальной подвыборки — см. ниже.
