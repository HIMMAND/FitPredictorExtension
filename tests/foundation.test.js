const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");

test("manifest is side-panel-first", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "manifest.json"), "utf8")
  );

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.side_panel.default_path, "index.html");
  assert.equal(manifest.background.service_worker, "background.js");
  assert.ok(manifest.permissions.includes("sidePanel"));
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
