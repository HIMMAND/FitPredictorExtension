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

No Python needed. ONNX models are committed — clone and load.

### 1. Clone the repo

```bash
git clone <repo-url>
cd FitPredictorExtension
```

### 2. Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this repository root

### 3. Test it

Open any product page on a supported brand (H&M, Pull&Bear, Splash, Bershka, Brands For Less, Centrepoint), open the FitPredictor side panel, and enter your measurements.

> After reloading the extension, refresh any already-open product tabs once so the content script activates.

---

## Retraining models (optional)

The ONNX models in `models/` are pre-built and committed. Only do this if you want to retrain from scratch using the ANSUR dataset.

**Prerequisites:** Python 3.9+, Node.js 18+

```bash
pip install scikit-learn joblib numpy pandas
python training/train/train_measurement_models.py
```

This writes `.joblib` files into `ml-models/`. To convert to ONNX and rebuild the bundle, see `training/README.md`.

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
