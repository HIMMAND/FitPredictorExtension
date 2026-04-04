# UI

The product direction is a manual-open side panel instead of a popup-first flow.

- Keep the extension lightweight and private by default
- Favor fallback-first sizing guidance in the main UI
- Surface review interpretation as compact support, not a dominant workflow
- Keep AI-assisted explanations optional and gated behind the user's key
- Keep body type selection aligned to the currently shipped gender-specific model labels
- Move body type selection toward a dedicated first step with one large image-backed carousel item shown at a time, while keeping a lightweight placeholder only when an asset fails to load
- Load body-type visuals from `assets/body-types/` using the current image-key-based filename convention
- Reveal the recommendation with motion and auto-scroll so the result does not feel buried below the fold
- Show page context status early so the user can tell that product imagery was found while live size-chart extraction is disabled and fallback sizing will be used
