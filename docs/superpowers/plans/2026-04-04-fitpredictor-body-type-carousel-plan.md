# FitPredictor Body Type Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current body-type card grid with a three-step side-panel flow that opens with a large male/female body-type carousel, then collects profile metrics, then shows the recommendation.

**Architecture:** Keep the existing side-panel runtime in `index.html`, `pop.js`, and `page-context.js`, but reorganize the DOM and client state into explicit step state plus carousel state. Reuse the current gender-specific body-type metadata from `page-context.js`, preserve the existing recommendation API contract, and update tests/docs so the stepped UI remains inspectable and stable.

**Tech Stack:** Chrome Extension MV3, JavaScript, HTML/CSS, Node test runner, Markdown docs

---

## File Structure

- Modify: `index.html`
  - replace the current grid-based Step 1 form with a three-step panel shell
  - add carousel stage markup, progress labels, step containers, and navigation controls
- Modify: `pop.js`
  - introduce step state and carousel state
  - render one active body-type slide at a time
  - move age/height/weight into Step 2 flow
  - keep API payload contract unchanged
- Modify: `page-context.js`
  - optionally enrich body-type option metadata with short descriptors used by the carousel
- Modify: `tests/foundation.test.js`
  - assert the new carousel-first rendering contract and step structure
- Modify: `docs/project-context/ui.md`
  - document the shipped stepped flow once implementation is complete
- Modify: `docs/project-context/current-status.md`
  - record the delivered UI flow and remaining next steps

### Task 1: Add The Failing Carousel Flow Acceptance Tests

**Files:**
- Modify: `tests/foundation.test.js`
- Test: `tests/foundation.test.js`

- [ ] **Step 1: Write the failing UI contract test for carousel-first Step 1**

Add assertions that look for the new Step 1/Step 2/Step 3 structure in the source files:

```js
test("side panel uses a carousel-first multi-step profile flow", () => {
  const htmlSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");

  assert.match(htmlSource, /id="step-body-type"/);
  assert.match(htmlSource, /id="step-profile-metrics"/);
  assert.match(htmlSource, /id="step-result"/);
  assert.match(htmlSource, /id="body-type-carousel"/);
  assert.match(htmlSource, /id="gender-toggle"/);
  assert.match(popSource, /function renderBodyTypeCarousel\(/);
  assert.match(popSource, /function goToStep\(/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
/opt/homebrew/bin/node --test tests/foundation.test.js
```

Expected: FAIL because `index.html` and `pop.js` do not yet contain the new step IDs and carousel functions.

- [ ] **Step 3: Write the failing test for active-slide image rendering**

Extend the same test file with a second assertion covering large-image carousel behavior:

```js
test("body type carousel renders one active model image with descriptor copy", () => {
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");

  assert.match(popSource, /class="carousel-model-image"/);
  assert.match(popSource, /class="carousel-body-type-name"/);
  assert.match(popSource, /class="carousel-body-type-description"/);
  assert.match(popSource, /assetPath/);
});
```

- [ ] **Step 4: Run the test again to verify it also fails for the right reason**

Run:

```bash
/opt/homebrew/bin/node --test tests/foundation.test.js
```

Expected: FAIL with missing carousel rendering contract.

- [ ] **Step 5: Commit the failing tests**

```bash
git add tests/foundation.test.js
git commit -m "test: define carousel-first side panel flow"
```

### Task 2: Add Body Type Descriptors To The Shared Metadata

**Files:**
- Modify: `page-context.js`
- Test: `tests/foundation.test.js`

- [ ] **Step 1: Add descriptor text to the shared body-type options**

Update the `BODY_TYPE_OPTIONS` entries so each option includes a `description` property:

```js
male: [
  {
    value: "rectangle",
    label: "Rectangle",
    imageKey: "male-rectangle",
    description: "Straight balanced torso",
  },
  {
    value: "inverted triangle",
    label: "Inverted Triangle",
    imageKey: "male-inverted-triangle",
    description: "Broad upper body taper",
  },
]
```

Repeat for all male and female options using the spec-approved labels.

- [ ] **Step 2: Ensure `getBodyTypeOptions()` returns the description intact**

Keep the map output shaped like:

```js
return (BODY_TYPE_OPTIONS[gender] || []).map((option) => ({
  ...option,
  assetPath: `assets/body-types/${option.imageKey}.png`,
  assetAlt: `${option.label} 3D body type model`,
  assetSlug: slugify(option.imageKey),
}));
```

- [ ] **Step 3: Run the existing page-context tests**

Run:

```bash
/opt/homebrew/bin/node --test tests/page-context.test.js
```

Expected: PASS

- [ ] **Step 4: Commit the metadata update**

```bash
git add page-context.js
git commit -m "feat: add body type carousel descriptors"
```

### Task 3: Replace The Step 1 Grid Markup With A Three-Step Panel Shell

**Files:**
- Modify: `index.html`
- Test: `tests/foundation.test.js`

- [ ] **Step 1: Replace the current profile section with explicit step containers**

In `index.html`, replace the current single `step-profile` section with:

```html
<section id="step-body-type" class="card">
  <div class="step-header">
    <div class="eyebrow">Step 1 of 3</div>
    <h2>Choose Your Body Type</h2>
    <p class="lead">Pick the silhouette closest to your frame before we ask for your metrics.</p>
  </div>

  <div id="gender-toggle" class="segmented-toggle" role="tablist" aria-label="Gender">
    <button type="button" data-gender="male" class="toggle-chip is-active">Male</button>
    <button type="button" data-gender="female" class="toggle-chip">Female</button>
  </div>

  <div id="body-type-carousel" class="body-type-carousel"></div>

  <div class="step-actions">
    <button id="step-1-next" type="button">Next</button>
  </div>
</section>

<section id="step-profile-metrics" class="card" hidden>
  ...
</section>
```

- [ ] **Step 2: Move age/height/weight inputs into the new Step 2 section**

Keep the same input IDs so the API contract remains unchanged:

```html
<section id="step-profile-metrics" class="card" hidden>
  <div class="eyebrow">Step 2 of 3</div>
  <h2>Profile Metrics</h2>
  <form id="profile-form" class="grid">
    <input id="body-type" type="hidden" required>
    <label>Age <input id="age" ...></label>
    <label>Height (cm) <input id="height" ...></label>
    <label>Weight (kg) <input id="weight" ...></label>
    <label>Website <input id="website" ... readonly></label>
    <div class="step-actions full-span">
      <button id="step-2-back" type="button" class="secondary-button">Back</button>
      <button id="recommend-button" type="submit">Get Recommendation</button>
    </div>
  </form>
</section>
```

- [ ] **Step 3: Keep Step 3 as the existing result section but update its header copy**

Use:

```html
<div class="eyebrow">Step 3 of 3</div>
<h2>Recommendation</h2>
```

- [ ] **Step 4: Add the carousel-stage CSS**

Add styles for:

```css
.segmented-toggle { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.toggle-chip { ... }
.body-type-carousel { display: grid; gap: 16px; }
.carousel-stage { min-height: 320px; display: grid; place-items: center; }
.carousel-model-image { width: 100%; max-height: 360px; object-fit: contain; }
.carousel-controls { display: flex; justify-content: space-between; gap: 12px; }
.step-actions { display: flex; gap: 12px; }
.secondary-button { background: var(--panel-strong); color: var(--text); }
```

- [ ] **Step 5: Run the foundation test to verify the HTML contract now passes**

Run:

```bash
/opt/homebrew/bin/node --test tests/foundation.test.js
```

Expected: the step/container assertions pass, but carousel behavior may still fail until `pop.js` is updated.

- [ ] **Step 6: Commit the panel shell update**

```bash
git add index.html
git commit -m "feat: add stepped panel shell for body type carousel"
```

### Task 4: Implement Step State And Large-Image Carousel Rendering

**Files:**
- Modify: `pop.js`
- Test: `tests/foundation.test.js`

- [ ] **Step 1: Add explicit step and carousel state near the top of `pop.js`**

Introduce:

```js
  const stepBodyType = document.getElementById("step-body-type");
  const stepProfileMetrics = document.getElementById("step-profile-metrics");
  const genderToggle = document.getElementById("gender-toggle");
  const bodyTypeCarousel = document.getElementById("body-type-carousel");
  const step1NextButton = document.getElementById("step-1-next");
  const step2BackButton = document.getElementById("step-2-back");

  let activeStep = 1;
  let activeCarouselIndex = 0;
```

- [ ] **Step 2: Add a `goToStep()` helper**

Implement:

```js
  function goToStep(stepNumber) {
    activeStep = stepNumber;
    stepBodyType.hidden = stepNumber !== 1;
    stepProfileMetrics.hidden = stepNumber !== 2;
    stepResult.hidden = stepNumber !== 3;
  }
```

- [ ] **Step 3: Replace `renderBodyTypeCards()` with `renderBodyTypeCarousel()`**

Implement:

```js
  function renderBodyTypeCarousel() {
    const options = extractor.getBodyTypeOptions(genderInput.value);
    const activeOption = options[activeCarouselIndex] || options[0];

    if (!activeOption) {
      bodyTypeCarousel.innerHTML = "";
      bodyTypeInput.value = "";
      return;
    }

    bodyTypeInput.value = activeOption.value;

    const assetUrl =
      typeof chrome !== "undefined" && chrome.runtime?.getURL
        ? chrome.runtime.getURL(activeOption.assetPath)
        : activeOption.assetPath;

    bodyTypeCarousel.innerHTML = `
      <div class="carousel-stage">
        <img class="carousel-model-image" src="${assetUrl}" alt="${activeOption.assetAlt}">
      </div>
      <div class="carousel-controls">
        <button type="button" id="carousel-prev" class="secondary-button" aria-label="Previous body type">Previous</button>
        <button type="button" id="carousel-next" class="secondary-button" aria-label="Next body type">Next</button>
      </div>
      <div class="carousel-copy">
        <div class="carousel-body-type-name">${activeOption.label}</div>
        <div class="carousel-body-type-description">${activeOption.description}</div>
      </div>
    `;
  }
```

- [ ] **Step 4: Wire previous/next carousel controls after rendering**

Right after setting `innerHTML`, add:

```js
    bodyTypeCarousel.querySelector("#carousel-prev")?.addEventListener("click", () => {
      activeCarouselIndex = (activeCarouselIndex - 1 + options.length) % options.length;
      renderBodyTypeCarousel();
    });

    bodyTypeCarousel.querySelector("#carousel-next")?.addEventListener("click", () => {
      activeCarouselIndex = (activeCarouselIndex + 1) % options.length;
      renderBodyTypeCarousel();
    });
```

- [ ] **Step 5: Update the gender toggle behavior**

Replace the old `genderInput`-driven grid update with:

```js
  for (const toggle of genderToggle.querySelectorAll("[data-gender]")) {
    toggle.addEventListener("click", () => {
      genderInput.value = toggle.dataset.gender;
      activeCarouselIndex = 0;
      syncGenderToggle();
      renderBodyTypeCarousel();
    });
  }
```

Also add:

```js
  function syncGenderToggle() {
    for (const toggle of genderToggle.querySelectorAll("[data-gender]")) {
      toggle.classList.toggle("is-active", toggle.dataset.gender === genderInput.value);
    }
  }
```

- [ ] **Step 6: Hook up step navigation**

Add:

```js
  step1NextButton.addEventListener("click", () => {
    if (!bodyTypeInput.value) {
      return;
    }
    goToStep(2);
  });

  step2BackButton.addEventListener("click", () => {
    goToStep(1);
  });
```

- [ ] **Step 7: Update result rendering to land on Step 3**

At the top of `renderResult(data)`, add:

```js
    goToStep(3);
```

and keep the existing animation and scroll behavior.

- [ ] **Step 8: Initialize the new flow on load**

Replace the old card-grid initialization with:

```js
  syncGenderToggle();
  renderBodyTypeCarousel();
  goToStep(1);
```

- [ ] **Step 9: Run the foundation test to verify the carousel contract passes**

Run:

```bash
/opt/homebrew/bin/node --test tests/foundation.test.js
```

Expected: PASS

- [ ] **Step 10: Commit the carousel state implementation**

```bash
git add pop.js
git commit -m "feat: add body type carousel step flow"
```

### Task 5: Refine Step 1 And Step 2 Styling For Large Visual Emphasis

**Files:**
- Modify: `index.html`
- Test: `tests/foundation.test.js`

- [ ] **Step 1: Increase the body model stage size**

Tune the Step 1 CSS so the image reads large in the side panel:

```css
.carousel-stage {
  min-height: 360px;
  padding: 20px;
  border-radius: 18px;
  background:
    radial-gradient(circle at top, rgba(240, 138, 36, 0.18), transparent 42%),
    linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
}

.carousel-model-image {
  width: 100%;
  max-width: 260px;
  max-height: 420px;
  object-fit: contain;
}
```

- [ ] **Step 2: Make Step 2 visually quieter than Step 1**

Keep Step 2 focused on inputs by reducing decorative density around the metrics form. Update only the relevant section classes instead of restyling the whole panel.

- [ ] **Step 3: Ensure result styling still works when `step-result` begins hidden**

Keep the existing classes:

```css
.result-ready { animation: resultReveal 420ms ease; }
.result-size.is-highlighted { animation: resultPulse 720ms ease; }
```

- [ ] **Step 4: Run full test and syntax verification**

Run:

```bash
/opt/homebrew/bin/node --test tests/foundation.test.js tests/page-context.test.js tests/ml-pipeline.test.js && /opt/homebrew/bin/node --check server.js && /opt/homebrew/bin/node --check pop.js && /opt/homebrew/bin/node --check background.js && /opt/homebrew/bin/node --check page-context.js
```

Expected: PASS

- [ ] **Step 5: Commit the visual refinement**

```bash
git add index.html
git commit -m "style: emphasize body type carousel step"
```

### Task 6: Update Documentation For The Shipped Stepped Flow

**Files:**
- Modify: `docs/project-context/ui.md`
- Modify: `docs/project-context/current-status.md`
- Test: `docs/project-context/ui.md`

- [ ] **Step 1: Update the UI context file**

Replace the current body-type bullet language with shipped-state wording:

```md
- The side panel now opens with a dedicated Step 1 body-type carousel using a male/female toggle and one large model image at a time
- Age, height, and weight now live in a separate Step 2 metrics screen
- The recommendation remains Step 3 with the existing animated reveal
```

- [ ] **Step 2: Update current status**

Add a new done item:

```md
- the side panel now uses a three-step flow with a dedicated body-type carousel as Step 1, profile metrics as Step 2, and the recommendation as Step 3
```

- [ ] **Step 3: Re-read the plan coverage against the spec**

Check that:

- Step 1 is carousel-first
- gender toggle is included
- one large image is shown at a time
- Step 2 contains age/height/weight
- Step 3 remains the recommendation

If any item is missing, add the minimal missing doc change before finishing.

- [ ] **Step 4: Commit the documentation sync**

```bash
git add docs/project-context/ui.md docs/project-context/current-status.md
git commit -m "docs: record stepped carousel side panel flow"
```
