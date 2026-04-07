# ML Strategy

- ANSUR male and female datasets train the body-measurement models
- Rent the Runway review data supports review intelligence
- ModCloth is secondary experimental data
- Model output is advisory, not the primary size source
- Runtime model artifacts remain at the repo root for local prediction
- Large evaluation `.joblib` outputs under `reports/model-evals/` are generated locally and should not be committed to Git history
- Current baseline metrics from `reports/model-evals/ansur-baseline/metrics.json` are:
  chest `R2=0.8637`, `MAE=2.87 cm`; waist `R2=0.8361`, `MAE=3.58 cm`; neck `R2=0.8575`, `MAE=1.15 cm`; hip `R2=0.8570`, `MAE=2.25 cm`
- Current body-type-aware metrics from `reports/model-evals/ansur-bodytype/metrics.json` are:
  chest `R2=0.9180`, `MAE=2.24 cm`; waist `R2=0.8737`, `MAE=3.14 cm`; neck `R2=0.8637`, `MAE=1.12 cm`; hip `R2=0.8956`, `MAE=1.95 cm`
- The measured lift from the body-type-aware retrain is:
  chest `+0.0543 R2`, `-0.63 cm MAE`; waist `+0.0376 R2`, `-0.44 cm MAE`; neck `+0.0062 R2`, `-0.03 cm MAE`; hip `+0.0385 R2`, `-0.30 cm MAE`
- The training pipeline now derives heuristic ANSUR body-type labels and includes `body_type` as an explicit modeled feature
- Runtime prediction supports both the legacy `body_type_encoded` model schema and the newer explicit `gender` + `body_type` schema so retrained models can be swapped in without breaking the extension contract
- The current root runtime `.joblib` artifacts are the retrained body-type-aware models, stored with `xz` compression so each model stays around `15-16 MB` instead of exceeding GitHub's single-file limit
- Neck output in `predict.py` now uses the raw model prediction directly; the old hardcoded three-inch subtraction was removed after audit
