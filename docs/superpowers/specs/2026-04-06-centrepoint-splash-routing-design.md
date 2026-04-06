# FitPredictor Centrepoint Splash Routing Design

## Overview

FitPredictor currently routes sizing by website domain, but the live Centrepoint UAE storefront uses `centrepointstores.com`, which is not recognized by the current backend or side-panel support logic. As a result, products on Centrepoint can drift to the generic global fallback chart instead of using the intended shared brand fallback path.

The approved product decision is that Centrepoint and Splash use the same fallback size chart. Centrepoint pages should normalize to the shared Splash/Centrepoint chart route instead of falling through to the global chart, and the chart status in the UI should make that shared route visible.

This change is only about storefront-to-brand routing. It does not change the measurement model, the scoring logic, or the meaning of predicted measurements.

## Goals

- Recognize `https://www.centrepointstores.com/ae/` as a supported storefront
- Treat Centrepoint product pages as part of the same shared chart family as Splash
- Keep male and female routing separate by using the submitted gender to select the correct shared chart slice
- Prevent Centrepoint products from falling back to the generic global chart when the storefront is supported
- Make the UI copy clearer by labeling the result as `Predicted body measurements`
- Make the chart status show the shared supported route instead of `global`

## Non-Goals

- Supporting multiple independent Centrepoint sub-brands in this pass
- Splitting Centrepoint and Splash into different chart families
- Changing recommendation scoring logic
- Changing the meaning of predicted measurements from body measurements to garment measurements

## Chosen Approach

Add a domain-normalization step ahead of chart resolution and map `centrepointstores.com` to the same shared chart route used by `splashfashions.com` and `splash.com`.

This is preferred over keeping separate Centrepoint and Splash chart families because the approved product assumption is that both storefronts use the same chart. Reusing one shared male/female chart family avoids duplicate maintenance and matches the desired chart-status messaging in the panel.

## Architecture

There should be one storefront normalization decision ahead of chart selection.

Inputs remain:

- website URL
- submitted gender
- product title

The resolver should:

1. Normalize the raw domain
2. Map `centrepointstores.com` to the same shared chart key used by Splash
3. Resolve the shared Centrepoint/Splash fallback charts from that normalized key
4. Use the submitted gender to choose the male or female chart slice
5. Score the predicted body measurements against the resolved chart using the existing recommendation logic

The normalization decision should drive both the backend resolver and the extension-side resolver/status text so the recommendation behavior and UI support messaging cannot disagree.

## Components And Data Flow

### Domain Routing

- Read the active product URL from the current page context
- Normalize the domain before chart lookup
- Treat `centrepointstores.com`, `splashfashions.com`, and `splash.com` as the same supported chart route
- Continue to route unsupported domains to the generic global fallback chart

### Chart Resolution

- Resolve the fallback chart after domain normalization
- Reuse one shared Splash/Centrepoint chart family instead of separate chart families
- Keep gender-specific selection intact so male input uses the shared men's chart and female input uses the shared women's chart

### Recommendation Contract

- Keep predicted measurements as predicted body measurements
- Keep the current chest, waist, neck, and hip measurement payload structure
- Return a `chartUsed` value that clearly indicates the shared Centrepoint/Splash fallback routing instead of generic global routing

## UI And Copy

- The supported-site/status copy in the side panel should recognize `centrepointstores.com` as supported
- A Centrepoint product should no longer read as unsupported or `global` when it is expected to route through the shared chart
- The chart status should name the shared route explicitly, such as `fallback (splash)` or `fallback (splash / centrepoint)`, instead of `fallback (global)`
- The Step 3 result label should change from `Predicted measurements` to `Predicted body measurements` so users do not confuse body predictions with garment measurements

## Error Handling

- If the domain is recognized as Centrepoint, normalize it to the shared Splash/Centrepoint route and continue through the normal shared fallback path
- If the domain is not recognized, keep the existing generic global fallback behavior
- Do not send supported Centrepoint pages to the generic global status when the shared chart route is available

## Testing

Add regression coverage for both the backend and extension-side routing paths.

Core assertions:

- `https://www.centrepointstores.com/ae/` is recognized as supported
- Centrepoint routing resolves to the same chart family as Splash rather than the generic global chart
- male and female requests resolve different shared chart slices
- chart status for supported Centrepoint and Splash pages no longer reports `global`
- unsupported domains still resolve to the generic global chart
- Step 3 copy uses `Predicted body measurements`

## Documentation Updates

Update project context docs to record:

- Centrepoint and Splash intentionally share the same fallback chart family in the current recommendation design
- the current live storefront domain is `centrepointstores.com`
- predicted measurements continue to mean predicted body measurements

## Rollout

1. Normalize `centrepointstores.com` to the shared Centrepoint/Splash chart route
2. Align backend, extension bundle, and support-status UI text to the same routing decision
3. Add regression tests for the shared Centrepoint/Splash routing, chart status copy, and the clarified Step 3 copy
4. Update project-context docs after implementation lands
