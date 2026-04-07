# FitPredictor Bershka Women Chart Refresh Design

## Overview

FitPredictor currently ships a handwritten Bershka women fallback chart. We now have captured Bershka women body-measurement values in centimeters for sizes `XS` through `L`, covering bust, waist, and hips.

The approved direction is to replace the current Bershka women fallback chart with these captured values, treat `bust` as `chest`, derive size bands from the captured anchors using the existing midpoint-splitting approach, and avoid inventing an unsupported `XL` row.

This change updates chart data provenance only. It does not change Bershka domain routing, the recommendation-scoring method, or the meaning of predicted measurements.

## Goals

- Replace the current Bershka women fallback chart with captured body measurements
- Use the supplied centimeter values as the source of truth
- Map `bust` to `chest`
- Build range bands from anchor values instead of maintaining a handwritten fixed table
- Keep recommendation behavior limited to the sizes that are actually supported by captured data

## Non-Goals

- Changing Bershka men sizing
- Adding or guessing a Bershka women `XL` row
- Changing Bershka domain routing
- Changing the recommendation scorer
- Changing predicted body measurements into garment measurements

## Captured Source Data

The approved Bershka women body measurements are:

- `XS`: chest `80 cm`, waist `62 cm`, hip `88 cm`
- `S`: chest `86 cm`, waist `68 cm`, hip `94 cm`
- `M`: chest `92 cm`, waist `74 cm`, hip `100 cm`
- `L`: chest `98 cm`, waist `80 cm`, hip `106 cm`

`Bust` should be treated as `chest`.

## Chosen Approach

Use an anchor-derived chart for Bershka women and limit the available size set to `XS`, `S`, `M`, and `L`.

This is preferred over extrapolating `XL` because the project already treats captured chart values as evidence-backed data and avoids inventing unsupported measurements. It is also preferred over leaving the older handwritten chart in place because the new captured values are a more trustworthy source.

## Architecture

The change should affect only the Bershka women chart source.

- Keep the existing Bershka brand route
- Keep the existing Bershka men chart as-is
- Replace only the Bershka women fixed table with an anchor-derived chart
- Continue converting chart values into inches before the scorer uses them
- Continue passing predicted body measurements into the same recommendation logic

## Data Flow

1. Receive the Bershka women captured centimeter anchors
2. Map `bust` to `chest`
3. Convert anchor rows into size bands by splitting the midpoint between adjacent sizes
4. Convert the resulting ranges into inches
5. Expose the derived chart as the Bershka women fallback chart
6. Let the existing scorer evaluate only `XS`, `S`, `M`, and `L`

## Error Handling

- Do not synthesize an `XL` row when source data is missing
- If a recommendation is requested for a larger Bershka women body profile, the scorer should still operate only on the supported chart rows that exist
- Do not mix old handwritten women values with the new captured rows

## Testing

Add regression coverage for:

- Bershka women chart derivation from the captured `XS-L` centimeter anchors
- correct mapping of `bust` to `chest`
- expected converted inch ranges for representative rows
- the absence of a Bershka women `XL` row after the refresh
- unchanged Bershka men routing and chart behavior

## Documentation Updates

Update project context docs to record:

- Bershka women now uses captured body-measurement anchors for `XS-L`
- `bust` is treated as `chest`
- predicted measurements in the UI and recommendation contract mean predicted body measurements

## Rollout

1. Replace the Bershka women handwritten chart with the captured `XS-L` anchor data
2. Derive inch-based ranges from the captured centimeter anchors
3. Add regression tests for the refreshed chart and missing `XL`
4. Update project-context docs after implementation lands
