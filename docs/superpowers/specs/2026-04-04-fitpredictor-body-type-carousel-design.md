# FitPredictor Body Type Carousel And Stepped Panel Design

## Overview

FitPredictor should stop treating body type as one field inside a crowded first form step. The body type choice should become the opening interaction of the side panel, with one large visual model shown at a time and a calmer guided flow afterward.

The panel should move from a dense "everything in step 1" form to a three-step flow:

1. Body type
2. Profile metrics
3. Recommendation

This redesign is meant to make the body-shape imagery feel premium and legible, reduce cognitive load, and make the extension feel more guided than form-driven.

## Goals

- Make body-type selection the visual hero of the panel
- Increase the size and impact of the 3D body images
- Separate image selection from metric entry so the first screen feels focused
- Keep the side panel narrow but editorial rather than cramped
- Preserve the current gender-specific body-type sets and asset filenames
- Keep the recommendation result reveal as its own final step

## Non-Goals

- Interactive 3D rendering inside the panel
- Drag or swipe gesture support in the first pass
- Changing the underlying model labels or gender/body-type taxonomy
- Reintroducing live size-chart extraction

## Chosen Approach

Use a three-step guided flow with a carousel-first opening screen.

This is preferred over a card grid because:

- the user only needs to evaluate one body silhouette at a time
- the image can become meaningfully larger
- the panel stops competing between visuals and numeric fields
- switching male/female becomes clearer because the carousel set swaps directly

## Information Architecture

### Step 1: Body Type

This step is dedicated to silhouette selection.

Contents:

- top progress indicator showing `Step 1 of 3`
- top segmented toggle for `Male` and `Female`
- one large central body model
- previous and next carousel controls
- current body-type label
- one short descriptor line under the label
- primary CTA: `Next`

The visual should dominate the panel height. The user should not need to scan ten small cards at once.

### Step 2: Profile

This step collects numeric inputs.

Contents:

- progress indicator showing `Step 2 of 3`
- age
- height
- weight
- compact current product context
- secondary CTA: `Back`
- primary CTA: `Get Recommendation`

This step should feel compact and utilitarian after the visual first step.

### Step 3: Recommendation

This step remains result-focused.

Contents:

- progress indicator showing `Step 3 of 3`
- large recommended size
- short summary sentence
- chart status
- review status
- review note
- optional `Back` or `Edit Inputs` affordance

The recommendation should remain the clearest element on the final screen.

## Carousel Behavior

### Gender Toggle

- `Male` and `Female` appear as a segmented control at the top of Step 1
- changing gender swaps the available carousel items immediately
- when gender changes, the active body type resets to the first item in that gender's set unless the current body type still exists in the new set, which it does not today

### Carousel Navigation

- left and right arrow buttons move through one item at a time
- movement wraps around at the ends
- keyboard support should work through button focus and activation
- the user does not need thumbnails in the first pass

### Body Type Content

For the active slide show:

- large image
- body type label
- one short supporting descriptor

Initial descriptors can be simple:

- male rectangle: `Straight balanced torso`
- male inverted triangle: `Broad upper body taper`
- male trapezoid: `Balanced athletic taper`
- male triangle: `Wider through waist and hips`
- male oval: `Fuller through the midsection`
- female rectangle: `Balanced straight silhouette`
- female hourglass: `Balanced bust and hips`
- female inverted triangle: `Broader shoulders than hips`
- female pear (triangle): `Hips wider than shoulders`
- female apple: `Fuller through the midsection`

## Visual Direction

### Layout

- dedicate most of Step 1 vertical space to the image stage
- keep the model centered
- use restrained chrome around the carousel controls
- avoid grids of small cards on Step 1

### Image Treatment

- show the actual PNG assets from `assets/body-types/`
- keep transparent backgrounds
- maintain consistent framing and containment
- prefer `object-fit: contain` so the silhouette stays readable and not cropped
- avoid shrinking the visual to make room for too much surrounding text

### Motion

- carousel change can use a subtle fade or slide transition
- transition should feel deliberate, not flashy
- result reveal animation can remain as-is for Step 3

## State Rules

- Step 1 cannot proceed without a selected body type
- Step 2 cannot submit without age, height, and weight
- selected gender and body type must persist into Step 2 and Step 3
- going `Back` from Step 2 should return to the currently selected slide
- if an image fails to load, show the current lightweight placeholder fallback instead of breaking layout

## Accessibility

- gender toggle must be keyboard reachable
- previous and next controls must be explicit buttons with labels
- current body type should be announced as text, not image-only
- the selected body type must remain stored in the hidden form state used by the recommendation request

## Asset Contract

Step 1 will continue to rely on the current filenames:

- `male-rectangle.png`
- `male-inverted-triangle.png`
- `male-trapezoid.png`
- `male-triangle.png`
- `male-oval.png`
- `female-rectangle.png`
- `female-hourglass.png`
- `female-inverted-triangle.png`
- `female-pear-triangle.png`
- `female-apple.png`

No filename contract changes are needed for this redesign.

## Implementation Notes

The implementation should reuse the existing `getBodyTypeOptions()` source of truth and replace the current grid rendering in the side panel with:

- step state
- carousel state
- gender toggle state
- one active image view rather than many simultaneous cards

The current page context hero can remain, but it should not visually overpower Step 1.

## Recommended Rollout

1. Replace the body-type card grid with a dedicated carousel step
2. Move age/height/weight into a separate second step
3. Keep the result step as the third screen
4. Tune spacing and image containment only after the stepped flow works
