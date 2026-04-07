# Overview

FitPredictor is a privacy-first Chrome extension evolving toward a manual-open side panel.

- Primary sizing source: hardcoded brand fallback chart
- Secondary support: local body-measurement model
- The current local model is the body-type-aware ANSUR retrain, stored as compressed `.joblib` artifacts in the repo root
- Review note: only when matched to user profile
- Optional AI: user-provided key for review interpretation and explanations
- Local `.env` / `.env.example` scaffolds now exist for future optional AI provider keys, but the current runtime does not consume those values yet
- The extension still reads page title and product imagery for context, but live size-chart extraction is intentionally disabled
