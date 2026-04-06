# Recommendation Engine

Priority order:

1. Hardcoded brand/global fallback chart
2. Local model

Reviews never become the primary recommendation. They only produce a small supporting note when profile matching is strong enough.

## Page Context Strategy

- Keep page-context collection focused on stable signals: product title and lead imagery
- Do not extract or trust live size charts from the active page
- Always resolve sizing through brand-specific fallback charts first, then the global fallback when no brand mapping exists
- Pass the product title through the recommendation request so tops-specific weighting can distinguish more structured items like shirts from casual tops like sweatshirts
- Always use the submitted gender selection to choose the `men` or `women` chart slice before scoring sizes

## Hardcoded Fallback Notes

- Hardcoded fallback charts must stay in the same measurement unit as the local predictor output; today that means inches
- The H&M mens XS-3XL fallback rows were aligned to the captured UAE tops/jackets/shirts/blazers size-guide screenshots by converting the live chart's centimeter ranges into inches before storing them in `server.js`
- That H&M mens tops fallback intentionally omits `hip` because the captured live chart only exposes chest, waist, arm length, and neckline; keeping an invented hip range would bias fallback recommendations with unsupported data
- H&M fallback routing is now gender- and item-aware: tops product titles route to the tops chart variant, while trousers titles can route to the trousers variant instead of treating the brand as one generic H&M chart
- The captured H&M women tops XXS-4XL rows now use the UAE `TOPS, BLOUSES, DRESSES ETC.` regular-tab screenshot values converted to inches, so female tops routing can resolve the aligned chart instead of falling back to the generic women range
- Pull&Bear men and women tops screenshots are being treated as body-measurement charts too, so they stay on the same range-aware tops scoring path as H&M instead of introducing a separate garment-ease conversion strategy
- Because the captured Pull&Bear screenshots expose one value per size instead of an explicit min/max band, the runtime derives each size range by splitting the midpoint between adjacent sizes before converting the chart into inches
- Pull&Bear fallback routing is now tops-aware: tops product titles resolve to the captured men/women tops charts, while non-top Pull&Bear items still fall back to the older generic brand chart
- Bershka women currently uses a handwritten fallback chart in the shipped code, but the approved refresh direction is to replace it with captured `XS-L` body-measurement anchors in centimeters, treat `bust` as `chest`, and derive inch-based bands without inventing an unsupported `XL` row
- Known routing gap: the live UAE Centrepoint storefront uses `centrepointstores.com`, which is not yet normalized consistently in the shipped recommendation flow; any routing update should preserve separate Splash and Centrepoint chart families rather than merging them into one brand path

## Local Model Notes

- The shipped root predictor artifacts now come from the body-type-aware ANSUR retrain rather than the older baseline-only models
- Runtime prediction still normalizes outputs to inches before blending with hardcoded fallback charts so the extension recommendation contract stays stable
- Neck prediction no longer subtracts a hardcoded three-inch bias in `predict.py`; the runtime now uses the model output directly and only rounds the final value

## Tops Recommendation Notes

- The current top recommendation path now lives in `recommendation.js` instead of inline in `server.js`
- Method 1 for tops is a range-aware weighted score rather than nearest-center matching
- Fit preference currently applies only to tops and biases the scoring toward smaller or roomier sizes using the Step 2 values `slim`, `regular`, `relaxed`, and `oversized`
- Product-title heuristics now give neckline more influence for structured tops such as shirts while keeping chest and waist dominant for casual tops
- The recommendation response now includes a structured `measurements` payload in both inches and centimeters plus a short `explanation` string so the Step 3 panel can show an auditable breakdown without inventing its own contract; these measurements are predicted body measurements, not garment measurements
- Female `Runway` is a UI alias for `rectangle`, not a new measurement class; it uses `female-runway.png` on the carousel and applies a small final-size bias in the tops scorer so the lean editorial silhouette nudges one step roomier/smaller only when the fit context supports it
