const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function runPython(code) {
  return execFileSync("python3", ["-c", code], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
}

test("ANSUR prep infers stable body-type labels from measurement ratios", () => {
  const output = runPython(`
import json
from training.data_prep.ansur import infer_body_type

cases = {
  "male_trapezoid": infer_body_type("male", 108, 90, 100),
  "male_oval": infer_body_type("male", 110, 118, 108),
  "female_hourglass": infer_body_type("female", 96, 72, 98),
  "female_pear": infer_body_type("female", 88, 74, 104),
}

print(json.dumps(cases))
  `);

  assert.deepEqual(JSON.parse(output), {
    male_trapezoid: "trapezoid",
    male_oval: "oval",
    female_hourglass: "hourglass",
    female_pear: "pear (triangle)",
  });
});

test("training pipeline includes body_type as a modeled feature", () => {
  const output = runPython(`
import json
from training.train.train_measurement_models import FEATURES
print(json.dumps(FEATURES))
  `);

  const features = JSON.parse(output);
  assert.ok(features.includes("body_type"));
});
