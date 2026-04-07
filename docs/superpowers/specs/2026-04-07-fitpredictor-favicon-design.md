# FitPredictor Favicon And Extension Icon Design

## Overview

FitPredictor needs a single icon mark that works for both browser favicon use and Chrome extension icon use. The mark should feel premium, fashion-forward, and modern rather than technical or literal.

The approved direction is a geometric black-and-white symbol based on the selected `Slice Mark` concept. It should only hint at an `F` instead of drawing a normal monogram letterform.

This work is about icon identity and asset structure. It does not change product behavior, recommendation logic, or the side-panel flow.

## Goals

- Create one core symbol that works as both favicon and extension icon
- Keep the mark premium, editorial, and minimal
- Avoid a plain literal `F`
- Keep the icon recognizable at tiny sizes like `16x16`
- Use one master source asset for future refinement and export

## Non-Goals

- Designing a full wordmark system
- Adding gradients, shadows, or glossy effects
- Building a full brand color palette in this pass
- Changing UI layout or recommendation behavior

## Chosen Direction

Use the `Slice Mark` direction as the core icon.

This symbol is:

- geometric
- monochrome
- premium and fashion-led
- only loosely suggestive of an `F`

It is preferred over the earlier directions because it feels ownable without becoming overly abstract, and it survives favicon scale better than more fragmented or more literal constructions.

## Visual Direction

### Symbol

- Build the icon from clean angular blocks and cuts
- Let the shape imply an `F` without spelling it out
- Keep the silhouette simple enough to remain legible at small sizes
- Preserve the sharp, editorial feel seen in the selected `A. Slice Mark` direction

### Color

- Use a dark background with a light symbol as the default identity
- Keep the favicon and extension icon monochrome by default
- Reserve accent color use for future larger brand surfaces, not the core favicon asset

### Tone

- premium
- confident
- fashion-forward
- restrained

Avoid technical, sporty, cartoonish, or overtly app-generic icon language.

## Asset System

The icon system should use one master vector source and export the required raster sizes from it.

Recommended source-of-truth structure:

- one master SVG for the chosen icon
- exported PNG sizes for extension usage
- favicon-ready outputs derived from the same source

Required practical outputs:

- `16x16`
- `32x32`
- `48x48`
- `128x128`

If the browser/site layer needs additional favicon sizes later, they should still come from the same master SVG rather than being redrawn independently.

## Sizing And Rendering Rules

- Keep the icon on a dark square field with comfortable padding
- Do not push the mark edge-to-edge
- Preserve the same core geometry across all sizes
- Allow tiny-size optical tuning only when needed to keep the mark legible at `16x16`
- Keep the render flat and crisp, with no shadows or gradients

## Implementation Notes

- Store the editable vector source in the repo so the icon can be revised without redrawing from scratch
- Export the required PNG sizes for the extension manifest from that source
- Wire the favicon/site references and extension icon references to the new asset set in their existing configuration points

## Testing

Verification should cover:

- the extension references the new icon assets in manifest configuration
- the browser-facing favicon reference points to the new asset
- the generated icon set includes the expected exported sizes
- the smallest size remains legible in practice

## Documentation Updates

Update project context docs to record:

- FitPredictor now has an approved favicon and extension-icon direction
- the chosen mark is the monochrome `Slice Mark`
- the icon is intentionally only suggestive of an `F`, not a literal letterform

## Rollout

1. Create the master vector for the approved `Slice Mark`
2. Export the favicon and extension icon sizes from that source
3. Wire the new assets into the manifest and favicon references
4. Update project-context docs after implementation lands
