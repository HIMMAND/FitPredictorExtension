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
- local Node/npm toolchain installed in the dev environment
- npm audit remediations applied; current install reports zero vulnerabilities
- npm smoke tests now verify manifest, required docs, and predictor JSON output
- root `.gitignore` now excludes `node_modules/` so local installs do not show up as untracked verification noise
- side-panel body type selection now uses image-ready card slots for future 3D model assets
- recommendation results now auto-scroll into view and animate on reveal
- local development now supports `npm run dev` via Node watch mode
- page context now stays limited to product title and imagery; live size-chart extraction is intentionally disabled
- backend chart resolution is now fallback-only and no longer honors live `pageChart` input
- the page-context helper was simplified to remove dead chart-parser code now that live size-chart extraction is disabled
- content-script runtime no longer depends on a leaked outer `root` binding, and the side panel now fails gracefully if the helper script does not initialize
- product header rendering now prefers stable product-title selectors and clamps chart-source labels so modal/page text cannot flood the panel UI
- the hardcoded H&M mens fallback chart for XS-3XL now matches the captured UAE tops/jackets/shirts/blazers size guide values after converting the screenshot's centimeter ranges to inches for predictor compatibility, and it no longer carries a guessed hip measurement that the live tops chart does not provide
- `assets/body-types/` now exists as the drop-in folder for generated male/female body-shape PNGs, with a local filename guide for the currently referenced assets
- side-panel body type cards now render the shipped `assets/body-types/*.png` visuals directly via extension URLs instead of staying stuck on placeholder-only copy
- body-type-aware ANSUR retraining is now completed with local male/female public CSVs, and the root runtime models were replaced with the retrained artifacts after compressing them to stay around `15-16 MB` each
- measured ANSUR lift versus baseline is now chest `0.8637 -> 0.9180 R2`, waist `0.8361 -> 0.8737 R2`, neck `0.8575 -> 0.8637 R2`, and hip `0.8570 -> 0.8956 R2`

## In Progress

- repo restructuring
- runtime migration toward a manual-open side panel
- redesigning the side panel toward a three-step flow with a dedicated body-type carousel as Step 1

## Next

- deepen review extraction so support notes can use current-page review evidence instead of always reporting unavailable
- document a reproducible path for regenerating evaluation artifacts outside Git history
- compare heuristic body-type labels against a stronger labeling strategy if we want more lift than the current `+0.6` to `+5.4` R2-point gains
- replace the current body-type grid with the approved large-image carousel step and move age/height/weight into their own second step
- keep this file updated after every work session
