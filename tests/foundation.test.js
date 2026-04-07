const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test("manifest is side-panel-first", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "manifest.json"), "utf8")
  );

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.side_panel.default_path, "index.html");
  assert.equal(manifest.background.service_worker, "background.js");
  assert.ok(manifest.permissions.includes("sidePanel"));
  assert.ok(Array.isArray(manifest.content_scripts));
  assert.ok(
    manifest.content_scripts.some((entry) =>
      Array.isArray(entry.js) && entry.js.includes("page-context.js")
    )
  );
});

test("extension icon assets are wired and exported at expected sizes", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "manifest.json"), "utf8")
  );
  const indexSource = fs.readFileSync(
    path.join(repoRoot, "index.html"),
    "utf8"
  );

  const expectedIcons = {
    16: "assets/icons/icon-16.png",
    32: "assets/icons/icon-32.png",
    48: "assets/icons/icon-48.png",
    128: "assets/icons/icon-128.png",
  };

  assert.deepEqual(manifest.icons, expectedIcons);
  assert.deepEqual(manifest.action.default_icon, expectedIcons);
  assert.match(
    indexSource,
    /<link rel="icon" type="image\/png" sizes="16x16" href="assets\/icons\/icon-16\.png">/
  );
  assert.match(
    indexSource,
    /<link rel="icon" type="image\/png" sizes="32x32" href="assets\/icons\/icon-32\.png">/
  );

  assert.equal(
    fs.existsSync(path.join(repoRoot, "assets/icons/fitpredictor-slice-mark.svg")),
    true
  );

  for (const [size, relativePath] of Object.entries(expectedIcons)) {
    const absolutePath = path.join(repoRoot, relativePath);
    assert.equal(fs.existsSync(absolutePath), true, `${relativePath} should exist`);
    assert.deepEqual(readPngSize(absolutePath), {
      width: Number(size),
      height: Number(size),
    });
  }
});

test("project context docs required by AGENTS exist", () => {
  const requiredFiles = [
    "AGENTS.md",
    "docs/project-context/current-status.md",
    "docs/project-context/session-rules.md",
    "docs/project-context/ui.md",
    "docs/project-context/ml.md",
  ];

  for (const relativePath of requiredFiles) {
    assert.equal(
      fs.existsSync(path.join(repoRoot, relativePath)),
      true,
      `${relativePath} should exist`
    );
  }
});

test("H&M fallback chart aligns with the captured UAE mens tops size guide for XS-3XL", () => {
  const chartsSource = fs.readFileSync(path.join(repoRoot, "charts.js"), "utf8");

  assert.match(
    chartsSource,
    /XS:\s*\{\s*chest:\s*\[30\.7,\s*33\.9\],\s*waist:\s*\[26,\s*29\.1\],\s*neck:\s*\[13\.4,\s*13\.8\]\s*\}/,
    "Expected H&M XS fallback values to match the captured size guide"
  );
  assert.match(
    chartsSource,
    /S:\s*\{\s*chest:\s*\[33\.9,\s*37\],\s*waist:\s*\[29\.1,\s*32\.3\],\s*neck:\s*\[14\.2,\s*14\.6\]\s*\}/,
    "Expected H&M S fallback values to match the captured size guide"
  );
  assert.match(
    chartsSource,
    /M:\s*\{\s*chest:\s*\[37,\s*40\.2\],\s*waist:\s*\[32\.3,\s*35\.4\],\s*neck:\s*\[15,\s*15\.4\]\s*\}/,
    "Expected H&M M fallback values to match the captured size guide"
  );
  assert.match(
    chartsSource,
    /L:\s*\{\s*chest:\s*\[40\.2,\s*43\.3\],\s*waist:\s*\[35\.4,\s*38\.8\],\s*neck:\s*\[15\.7,\s*16\.1\]\s*\}/,
    "Expected H&M L fallback values to match the captured size guide"
  );
  assert.match(
    chartsSource,
    /XL:\s*\{\s*chest:\s*\[43\.3,\s*46\.5\],\s*waist:\s*\[38\.8,\s*42\.3\],\s*neck:\s*\[16\.5,\s*16\.9\]\s*\}/,
    "Expected H&M XL fallback values to match the captured size guide"
  );
  assert.match(
    chartsSource,
    /XXL:\s*\{\s*chest:\s*\[46\.5,\s*49\.6\],\s*waist:\s*\[42\.3,\s*45\.9\],\s*neck:\s*\[17\.3,\s*17\.7\]\s*\}/,
    "Expected H&M XXL fallback values to match the captured size guide"
  );
  assert.match(
    chartsSource,
    /'3XL':\s*\{\s*chest:\s*\[49\.6,\s*52\.8\],\s*waist:\s*\[45\.9,\s*49\.4\],\s*neck:\s*\[18\.1,\s*18\.5\]\s*\}/,
    "Expected H&M 3XL fallback values to match the captured size guide"
  );
});

test("H&M women tops routing aligns the captured UAE tops values and uses product category", () => {
  const { resolveChartSignal } = require("../charts");

  const topsSignal = resolveChartSignal(
    "https://ae.hm.com/en/buy-women-tops",
    "female",
    "Loose fit printed polo shirt"
  );
  const trousersSignal = resolveChartSignal(
    "https://ae.hm.com/en/buy-women-trousers",
    "female",
    "Women trousers"
  );

  assert.equal(topsSignal.chartUsed, "hm.com women tops");
  assert.equal(trousersSignal.chartUsed, "hm.com women trousers");
  assert.deepEqual(topsSignal.chart.women.XXS.chest, [29.1, 30.7]);
  assert.deepEqual(topsSignal.chart.women.XXS.waist, [22.8, 24.4]);
  assert.deepEqual(topsSignal.chart.women.S.hip, [35.4, 38.4]);
  assert.deepEqual(topsSignal.chart.women.M.chest, [35.4, 38.6]);
  assert.deepEqual(topsSignal.chart.women.XL.waist, [36.6, 41.3]);
  assert.deepEqual(topsSignal.chart.women["4XL"].hip, [56.3, 61]);
});

test("Pull&Bear tops routing uses the captured tops anchors as range-aware body bands", () => {
  const { resolveChartSignal } = require("../charts");

  const menSignal = resolveChartSignal(
    "https://www.pullandbear.com/ae/man/black-top-c123.html",
    "male",
    "Relaxed fit top"
  );
  const womenSignal = resolveChartSignal(
    "https://www.pullandbear.com/ae/woman/cape-top-c456.html",
    "female",
    "Cape look top"
  );

  assert.equal(menSignal.chartUsed, "pullandbear.com men tops");
  assert.equal(womenSignal.chartUsed, "pullandbear.com women tops");
  assert.deepEqual(menSignal.chart.men.XS.chest, [21.5, 22.6]);
  assert.deepEqual(menSignal.chart.men.L.chest, [24.8, 25.8]);
  assert.deepEqual(womenSignal.chart.women.XS.chest, [15.5, 16.7]);
  assert.deepEqual(womenSignal.chart.women.S.waist, [14, 15.2]);
  assert.deepEqual(womenSignal.chart.women.M.hip, [19.1, 20.3]);
  assert.deepEqual(womenSignal.chart.women.L.chest, [19, 20.2]);
});

test("Pull&Bear tops stay on the standard body-measurement scoring path", () => {
  const { resolveChartSignal } = require("../charts");

  const pullBearSignal = resolveChartSignal(
    "https://www.pullandbear.com/us/man/tops",
    "male",
    "regular fit t-shirt"
  );

  assert.equal(pullBearSignal.chartStatus, "fallback");
  assert.equal(pullBearSignal.chartUsed, "pullandbear.com men tops");
  assert.ok(Array.isArray(pullBearSignal.chart.men.XS.chest));
  assert.equal(pullBearSignal.chart.men.XS.waist, undefined);
  assert.equal(pullBearSignal.chart.men.XS.hip, undefined);
  assert.equal(pullBearSignal.chart.men.XS.neck, undefined);
  assert.ok(Array.isArray(pullBearSignal.chart.women.XS.chest));
  assert.ok(Array.isArray(pullBearSignal.chart.women.XS.waist));
  assert.ok(Array.isArray(pullBearSignal.chart.women.XS.hip));
});

test("chart routing is fallback-only and ignores live page charts", () => {
  const chartsSource = fs.readFileSync(path.join(repoRoot, "charts.js"), "utf8");

  assert.match(
    chartsSource,
    /function resolveChartSignal\(website,\s*gender,\s*productTitle\)/,
    "Expected resolveChartSignal to route by website, gender, and product title"
  );
  assert.doesNotMatch(
    chartsSource,
    /chartStatus:\s*'page'/,
    "Live page-chart resolution should not be in charts.js"
  );
});

test("body type carousel renders real extension image assets instead of placeholder-only slots", () => {
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");

  assert.match(
    popSource,
    /chrome\.runtime\.getURL\(option\.assetPath\)/,
    "Expected the carousel to resolve extension asset URLs for images"
  );
  assert.match(
    popSource,
    /<img[^`]+class="carousel-model-image"/,
    "Expected the carousel to render a real image element"
  );
  assert.doesNotMatch(
    popSource,
    /Add later at <code>\$\{option\.assetPath\}<\/code>/,
    "Expected placeholder-only body type copy to be removed from the carousel"
  );
});

test("female runway alias stays female-only and maps to rectangle with the runway asset", () => {
  const { getBodyTypeOptions } = require("../page-context");

  const femaleOptions = getBodyTypeOptions("female");
  const runwayOption = femaleOptions.find((option) => option.label === "Runway");
  const maleOptions = getBodyTypeOptions("male");

  assert.deepEqual(
    runwayOption && {
      value: runwayOption.value,
      variant: runwayOption.variant,
      imageKey: runwayOption.imageKey,
      assetPath: runwayOption.assetPath,
      assetSlug: runwayOption.assetSlug,
    },
    {
      value: "rectangle",
      variant: "runway",
      imageKey: "female-runway",
      assetPath: "assets/body-types/female-runway.png",
      assetSlug: "female-runway",
    }
  );
  assert.ok(
    !maleOptions.some((option) => option.label === "Runway"),
    "Expected the Runway alias to remain female-only"
  );
});

test("carousel-first side panel contract exposes the expected step ids and helpers", () => {
  const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");

  for (const id of [
    "step-body-type",
    "step-profile-metrics",
    "step-result",
    "body-type-carousel",
    "gender-toggle",
    "fit-preference",
    "step-3-back",
    "recommendation-explanation",
    "measurement-summary",
  ]) {
    assert.match(
      indexSource,
      new RegExp(`id="${id}"`),
      `Expected index.html to include #${id}`
    );
  }

  const helperContracts = [
    "renderBodyTypeCarousel",
    "goToStep",
    "renderMeasurementSummary",
    "buildMeasurementRows",
    "buildRecommendationExplanation",
  ];

  for (const helperName of helperContracts) {
    assert.match(
      popSource,
      new RegExp(
        String.raw`(?:function\s+${helperName}\b|(?:const|let|var)\s+${helperName}\s*=\s*(?:async\s*)?(?:function\b|\([^=]*=>|[a-zA-Z_$][\w$]*\s*=>))`
      ),
      `Expected pop.js to expose ${helperName}`
    );
  }
});

test("carousel-first active body type card renders asset-backed image, label, and descriptor copy", () => {
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");

  assert.match(
    popSource,
    /<img[^>]+class="carousel-model-image"[^>]+>[\s\S]*?<[^>]+class="carousel-body-type-name"[^>]*>[\s\S]*?<[^>]+class="carousel-body-type-description"[^>]*>/,
    "Expected a single carousel card template to include the image, label, and description classes"
  );
  assert.match(
    popSource,
    /option\.assetPath|assetUrl/,
    "Expected carousel image markup to be backed by an asset path"
  );
  assert.match(
    popSource,
    /option\.label/,
    "Expected carousel label copy to come from the body-type option"
  );
  assert.match(
    popSource,
    /option\.description/,
    "Expected carousel descriptor copy to come from the body-type option"
  );
});

test("result step renders compact measurement and explanation hooks", () => {
  const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");

  assert.match(
    indexSource,
    /id="recommendation-explanation"/,
    "Expected Step 3 to include an explanation block"
  );
  assert.match(
    indexSource,
    /id="measurement-summary"/,
    "Expected Step 3 to include a measurement summary block"
  );
  assert.match(
    popSource,
    /renderMeasurementSummary\(buildMeasurementRows\(data\)\)/,
    "Expected renderResult to populate the measurement summary from the backend payload"
  );
  assert.match(
    popSource,
    /recommendationExplanation\.textContent\s*=\s*buildRecommendationExplanation\(data\)/,
    "Expected renderResult to populate the explanation block from the backend payload"
  );
});

test("fit preference is wired through the panel payload", () => {
  const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");

  assert.match(
    indexSource,
    /id="fit-preference"/,
    "Expected Step 2 to include a fit preference input"
  );
  assert.match(
    popSource,
    /fitPreference:\s*document\.getElementById\("fit-preference"\)\.value/,
    "Expected the panel payload to send fitPreference"
  );
  assert.doesNotMatch(
    popSource,
    /Live size chart extraction is disabled; brand fallback will be used/,
    "Expected the old live-chart-disabled copy to be removed"
  );
});

test("female Runway alias keeps the rectangle model value but sends a variant flag", () => {
  const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");
  const pageContextSource = fs.readFileSync(
    path.join(repoRoot, "page-context.js"),
    "utf8"
  );

  assert.match(indexSource, /id="body-type-variant"/);
  assert.match(pageContextSource, /label:\s*"Runway"/);
  assert.match(pageContextSource, /variant:\s*"runway"/);
  assert.match(pageContextSource, /imageScale:\s*2\.4/);
  assert.match(pageContextSource, /value:\s*"rectangle"[\s\S]*label:\s*"Runway"/);
  assert.match(popSource, /bodyTypeVariant:\s*bodyTypeVariantInput\?\.value \|\| "default"/);
  assert.match(popSource, /--carousel-image-scale:\s*\$\{imageScale\}/);
  assert.match(indexSource, /transform:\s*scale\(var\(--carousel-image-scale,\s*1\)\)/);
});

test("selected gender is forwarded from the panel and used to choose the chart slice", () => {
  const popSource = fs.readFileSync(path.join(repoRoot, "pop.js"), "utf8");
  const recommendationSource = fs.readFileSync(
    path.join(repoRoot, "recommendation.js"),
    "utf8"
  );
  const chartsSource = fs.readFileSync(path.join(repoRoot, "charts.js"), "utf8");

  assert.match(
    popSource,
    /gender:\s*genderInput\.value/,
    "Expected the panel payload to send the currently selected gender"
  );
  assert.match(
    chartsSource,
    /genderKey.*female.*women|women.*female/,
    "Expected chart routing to normalize the incoming gender into the chart key"
  );
  assert.match(
    recommendationSource,
    /const genderKey = gender\.toLowerCase\(\) === "male" \? "men" : "women";/,
    "Expected final size scoring to choose the chart slice from the submitted gender"
  );
});
