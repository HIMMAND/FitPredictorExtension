const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

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

test("predictor returns JSON for supported male and female body types", () => {
  const cases = [
    ["28", "175", "72", "male", "rectangle"],
    ["28", "165", "60", "female", "pear (triangle)"],
  ];

  for (const args of cases) {
    const output = execFileSync("python3", ["predict.py", ...args], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    const parsed = JSON.parse(output);

    assert.equal(typeof parsed.chest_prediction, "number");
    assert.equal(typeof parsed.waist_prediction, "number");
    assert.equal(typeof parsed.neck_prediction, "number");
    assert.equal(typeof parsed.hip_prediction, "number");
  }
});
