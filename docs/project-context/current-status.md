# Current Status

## Done

- side-panel product direction approved
- joblib artifacts statically audited
- ANSUR datasets identified for retraining
- root `AGENTS.md` created
- initial `docs/project-context/` docs created
- ANSUR audit script created and summary generated
- ANSUR training pipeline created and baseline models trained
- side-panel runtime foundation added with `background.js` and panel shell
- chart and review response contracts added to `server.js`
- backend runner now defaults to `python3` via `PYTHON_BIN` override support
- local recommendation API CORS narrowed to extension and localhost origins
- generated evaluation `.joblib` files under `reports/model-evals/` are now treated as local-only artifacts so GitHub pushes stay under size limits

## In Progress

- repo restructuring
- runtime migration toward a manual-open side panel

## Next

- replace placeholder page chart and review extraction with real normalization logic
- document a reproducible path for regenerating evaluation artifacts outside Git history
- keep this file updated after every work session
