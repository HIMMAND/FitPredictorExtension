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
- shared body-type metadata now carries short descriptor text for the upcoming carousel cards
- Step 1 of the side-panel flow now gives the body-type carousel a larger, more intentional image stage while Step 2 is visually quieter and more compact
- recommendation results now auto-scroll into view and animate on reveal
- local development now supports `npm run dev` via Node watch mode
- page context now stays limited to product title and imagery; live size-chart extraction is intentionally disabled
- backend chart resolution is now fallback-only and no longer honors live `pageChart` input
- the page-context helper was simplified to remove dead chart-parser code now that live size-chart extraction is disabled
- content-script runtime no longer depends on a leaked outer `root` binding, and the side panel now fails gracefully if the helper script does not initialize
- product header rendering now prefers stable product-title selectors and clamps chart-source labels so modal/page text cannot flood the panel UI
- page-context image scanning now has regression coverage for preferring the gallery hero image over small logos and brand marks in the preview card
- the hardcoded H&M mens fallback chart for XS-3XL now matches the captured UAE tops/jackets/shirts/blazers size guide values after converting the screenshot's centimeter ranges to inches for predictor compatibility, and it no longer carries a guessed hip measurement that the live tops chart does not provide
- H&M fallback routing is now gender- and item-aware, so women tops can resolve the captured UAE tops chart variant while trousers can route separately instead of sharing one generic brand chart
- the captured H&M women tops XXS-4XL fallback rows now use the UAE `TOPS, BLOUSES, DRESSES ETC.` regular-tab screenshot values converted to inches
- Pull&Bear men and women tops now route through dedicated tops fallback charts instead of the older generic brand rows when the product title resolves to a top
- the captured Pull&Bear men and women tops screenshots are being treated as body-measurement charts too, and their one-value-per-size screenshots are converted into H&M-style ranges by splitting adjacent size midpoints so the same tops scoring logic can stay in place
- the selected gender from Step 1 now has explicit regression coverage across the panel payload, backend chart routing, and final scoring so men/women chart slices stay tied to the active input
- page-context image selection now prefers product-gallery hero imagery over larger logo or brand-mark assets, which fixes Pull&Bear pages that previously surfaced the brand mark in the panel preview
- `assets/body-types/` now exists as the drop-in folder for generated male/female body-shape PNGs, with a local filename guide for the currently referenced assets
- side-panel body type cards now render the shipped `assets/body-types/*.png` visuals directly via extension URLs instead of staying stuck on placeholder-only copy
- body-type PNG assets were normalized to tighter portrait crops so the carousel models read large in the side panel instead of appearing tiny inside wide canvases
- the carousel navigation now sits below the body-type copy instead of flanking the image, which gives the Step 1 model stage more width and visual emphasis
- the side panel now uses a three-step flow where Step 1 is a large body-type carousel with a male/female toggle, Step 2 collects profile metrics, and Step 3 reveals the recommendation
- the female-only `Runway` body-type alias is now part of the carousel contract, reusing the `female-runway.png` asset while staying mapped to the internal `rectangle` category
- the `Runway` body-type now uses a slightly elevated per-option carousel image scale so its wider source canvas renders close to the rest of the female models without oversizing the figure
- the `Runway` carousel scale was tuned down again so the model reads closer to the rest of the female set without visually dominating the frame
- the `Runway` carousel option now applies a per-option image scale so its unusually wide asset canvas renders at the same apparent size as the rest of the female model set
- Step 2 now includes a tops fit-preference selector and sends that preference, along with the product title, to the local recommendation API
- Step 3 now surfaces a compact explanation plus the predicted chest, waist, neck, and hip measurements in both inches and centimeters so the final result is easier to audit
- recommendation failures now distinguish a missing local backend on `localhost:3000` from generic request errors and tell the user to start `npm start`
- local `.env` and `.env.example` scaffolds now exist for future optional AI provider keys, and the docs explicitly note that the current runtime does not consume them yet
- body-type-aware ANSUR retraining is now completed with local male/female public CSVs, and the root runtime models were replaced with the retrained artifacts after compressing them to stay around `15-16 MB` each
- measured ANSUR lift versus baseline is now chest `0.8637 -> 0.9180 R2`, waist `0.8361 -> 0.8737 R2`, neck `0.8575 -> 0.8637 R2`, and hip `0.8570 -> 0.8956 R2`
- tops recommendations now use the new `recommendation.js` utility for range-aware weighted scoring with fit bias and title-aware neckline weighting instead of the old nearest-center heuristic in `server.js`
- `predict.py` no longer subtracts a hardcoded three-inch neck bias; the runtime now rounds the model output directly
- page-context copy now describes brand fallback sizing as ready instead of calling out disabled live chart extraction in the panel status text

## In Progress

- repo restructuring
- runtime migration toward a manual-open side panel
- Centrepoint storefront routing audit: the live UAE domain is `centrepointstores.com`, the shipped build can still fall through to `fallback (global)`, and the approved follow-up is to route Centrepoint and Splash through the same chart family while making the chart status show that shared path explicitly
- Bershka women fallback chart refresh design approved: replace the handwritten women chart with captured `XS-L` body-measurement anchors, map `bust` to `chest`, and stop at `L` until an `XL` value is captured

## Next

- implement the Bershka women chart refresh from captured `XS-L` centimeter body measurements and add regression coverage for the derived ranges plus missing `XL`
- resolve the live `centrepointstores.com` routing gap by mapping Centrepoint and Splash to the same chart family and updating the panel's chart status so supported pages no longer report `fallback (global)`
- deepen review extraction so support notes can use current-page review evidence instead of always reporting unavailable
- document a reproducible path for regenerating evaluation artifacts outside Git history
- compare heuristic body-type labels against a stronger labeling strategy if we want more lift than the current `+0.6` to `+5.4` R2-point gains
- keep tuning the new carousel-first body-type step now that the large-image three-step flow is shipped
- expand fit-preference-aware scoring beyond tops only if we intentionally add lower-body recommendation logic later
- keep this file updated after every work session
