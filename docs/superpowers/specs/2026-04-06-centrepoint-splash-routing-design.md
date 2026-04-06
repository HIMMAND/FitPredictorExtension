# FitPredictor Centrepoint Splash Routing Design

## Overview

FitPredictor currently routes sizing by website domain, but the live Centrepoint UAE storefront uses `centrepointstores.com`, which is not recognized by the current backend or side-panel support logic. As a result, Splash products sold through Centrepoint can drift to the generic global fallback chart instead of using the intended brand fallback path.

The approved product decision is to treat Centrepoint as Splash for now. Centrepoint pages should not use a separate Centrepoint chart family. They should normalize to the internal Splash brand route and then use Splash's existing gender-specific fallback charts.

This change is only about storefront-to-brand routing. It does not change the measurement model, the scoring logic, or the meaning of predicted measurements.

## Goals

- Recognize `https://www.centrepointstores.com/ae/` as a supported storefront
- Treat Centrepoint product pages as Splash in the sizing pipeline
- Keep male and female routing separate by using the submitted gender to select the correct Splash chart slice
- Prevent Centrepoint Splash products from falling back to the generic global chart when the storefront is supported
- Make the UI copy clearer by labeling the result as `Predicted body measurements`

## Non-Goals

- Supporting multiple independent Centrepoint sub-brands in this pass
- Changing the underlying Splash size-chart values
- Changing recommendation scoring logic
- Changing the meaning of predicted measurements from body measurements to garment measurements

## Chosen Approach

Add a domain-normalization step ahead of chart resolution and map `centrepointstores.com` to the internal Splash route.

This is preferred over keeping a distinct Centrepoint chart family because the approved product assumption is that Centrepoint currently equals Splash for the supported experience. Reusing Splash's existing male and female chart slices avoids duplicate chart maintenance and removes ambiguity between two competing routing paths.

## Architecture

There should be one storefront normalization decision ahead of chart selection.

Inputs remain:

- website URL
- submitted gender
- product title

The resolver should:

1. Normalize the raw domain
2. Map `centrepointstores.com` to the internal Splash brand key
3. Resolve Splash fallback charts from that normalized key
4. Use the submitted gender to choose the male or female chart slice
5. Score the predicted body measurements against the resolved chart using the existing recommendation logic

The normalization decision should drive both the backend resolver and the extension-side resolver/status text so the recommendation behavior and UI support messaging cannot disagree.

## Components And Data Flow

### Domain Routing

- Read the active product URL from the current page context
- Normalize the domain before chart lookup
- Treat `centrepointstores.com` as the same supported route as Splash
- Continue to route unsupported domains to the generic global fallback chart

### Chart Resolution

- Resolve the fallback chart after domain normalization
- Reuse the existing Splash chart family instead of maintaining a separate Centrepoint chart family
- Keep gender-specific selection intact so male input uses the Splash men's chart and female input uses the Splash women's chart

### Recommendation Contract

- Keep predicted measurements as predicted body measurements
- Keep the current chest, waist, neck, and hip measurement payload structure
- Return a `chartUsed` value that clearly indicates Splash fallback routing instead of generic global routing

## UI And Copy

- The supported-site/status copy in the side panel should recognize `centrepointstores.com` as supported
- A Centrepoint product should no longer read as unsupported when it is expected to route through Splash
- The Step 3 result label should change from `Predicted measurements` to `Predicted body measurements` so users do not confuse body predictions with garment measurements

## Error Handling

- If the domain is recognized as Centrepoint, normalize it to Splash and continue through the normal Splash fallback path
- If the domain is not recognized, keep the existing generic global fallback behavior
- Do not invent a separate fallback branch just for Centrepoint; it should either resolve to Splash or remain unsupported/global

## Testing

Add regression coverage for both the backend and extension-side routing paths.

Core assertions:

- `https://www.centrepointstores.com/ae/` is recognized as supported
- Centrepoint routing resolves to Splash rather than the generic global chart
- male and female requests resolve different Splash chart slices
- unsupported domains still resolve to the generic global chart
- Step 3 copy uses `Predicted body measurements`

## Documentation Updates

Update project context docs to record:

- Centrepoint storefront pages are intentionally treated as Splash in the current recommendation design
- the current live storefront domain is `centrepointstores.com`
- predicted measurements continue to mean predicted body measurements

## Rollout

1. Normalize `centrepointstores.com` to Splash in the chart-routing path
2. Align backend, extension bundle, and support-status UI text to the same routing decision
3. Add regression tests for Centrepoint-to-Splash routing and the clarified Step 3 copy
4. Update project-context docs after implementation lands
