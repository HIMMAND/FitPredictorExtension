# UI

The product direction is a manual-open side panel instead of a popup-first flow.

- Keep the extension lightweight and private by default
- Favor fallback-first sizing guidance in the main UI
- Surface review interpretation as compact support, not a dominant workflow
- Keep AI-assisted explanations optional and gated behind the user's key
- Keep body type selection aligned to the currently shipped gender-specific model labels
- Use a dedicated first step for body type with one large image-backed carousel item shown at a time, while keeping a lightweight placeholder only when an asset fails to load
- Give Step 1 most of the vertical emphasis in the side panel, keep the model centered and readable with `object-fit: contain`, and make Step 2 noticeably quieter and more utilitarian
- Keep previous/next controls below the model content rather than beside it so the image stage can use the full panel width
- Load body-type visuals from `assets/body-types/` using the current image-key-based filename convention
- Keep body-type assets tightly cropped and portrait-oriented so the model occupies most of the carousel frame instead of shrinking inside a wide export canvas
- Include a female-only `Runway` alias in the carousel; it uses `female-runway.png`, maps internally to `rectangle`, and should read as a lean editorial variant rather than a separate structural category
- Because `female-runway.png` still ships on a much wider canvas than the rest of the female set, normalize it with a slightly larger per-option carousel image scale so it reads close to `Rectangle`, `Hourglass`, and the other portrait assets without visually dominating them
- Allow per-option render scaling in the carousel so an outlier asset like `female-runway.png` can be visually normalized without resizing the rest of the model set
- Prefer product-gallery hero imagery over logos or brand marks when selecting the lead product image from the page context
- When the recommendation request cannot reach the local service, say explicitly that the backend on `localhost:3000` is unavailable and prompt the user to start `npm start`
- Reveal the recommendation with motion and auto-scroll so the result does not feel buried below the fold
- Keep Step 2 focused on compact profile inputs plus a practical tops-only fit preference selector with `slim`, `regular`, `relaxed`, and `oversized`
- Step 3 should show the chosen size, a compact explanation, and the predicted body measurements in both inches and cm without expanding into a full report view
- Show page context status early so the user can tell when product imagery was found and brand fallback sizing is ready for the active store context
- Prefer the visible product-gallery hero image over logos or brand marks when page imagery is scanned for the preview card
