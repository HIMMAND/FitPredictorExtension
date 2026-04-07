# FitPredictor

A Chrome extension that predicts your clothing size using local body-measurement models, brand size charts, and review signals — no data leaves your device.

---

## How it works

1. You enter age, height, weight, gender, and body type
2. Local ML models predict your chest, waist, neck, and hip measurements
3. Predictions are matched against brand-specific size charts
4. A size recommendation is returned with an explanation

---

## Getting started

### Prerequisites

- Node.js 18+ (only needed to rebuild the bundle or run tests)
- Python 3.9+ with `scikit-learn joblib numpy pandas` — only needed if retraining models

---

### 1. Clone the repo

```bash
git clone <repo-url>
cd FitPredictorExtension
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Train the ML models

The `.joblib` model files are not committed. Generate them from the ANSUR dataset:

```bash
pip install scikit-learn joblib numpy pandas
python training/train/train_measurement_models.py
```

This writes `chest_model.joblib`, `waist_model.joblib`, `neck_model.joblib`, `hip_model.joblib`, and `body_type_encoder.joblib` into `ml-models/`.

> See `training/README.md` for dataset setup instructions.

### 4. Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this repository root

### 5. Test it

Open any product page on a supported brand (H&M, Pull&Bear, Splash, Bershka, Brands For Less), open the FitPredictor side panel, and enter your measurements.

> After reloading the extension, refresh any already-open product tabs once so the content script activates.

---

## New: Fit preference

Specify how you like your clothes to fit. Shifts the size recommendation within the predicted measurement range.

| Option | Description |
|---|---|
| **Slim** | Fitted — sits closer to the top of the size range |
| **Regular** | Default — balanced fit |
| **Relaxed** | Looser — sits lower in the size range |
| **Oversized** | Maximum room — biases toward the next size up |

Select in the extension panel, or pass `fitPreference` in the API request body. Defaults to `regular`.

---

## Project structure

```
models/           ONNX models for in-browser inference (committed)
ml-models/        Trained .joblib files (gitignored — generate via step 3)
dist/             Bundled extension JS (committed — no build step needed)
training/         Dataset prep + model training scripts
tests/            Node test suite
assets/           Extension icons and body-type illustrations
```

---

## Running tests

```bash
npm test
```

---

## License

[MIT](LICENSE)

---

## Principles

- **Local-first** — predictions run on-device, no user data sent to external servers
- **Fallback-first** — brand charts used when model confidence is low
- **Review-aware** — page review signals inform the final recommendation
- **Open source** — models are reproducible from public ANSUR anthropometric data
