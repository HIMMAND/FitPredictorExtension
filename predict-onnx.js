// predict-onnx.js — runs all 4 body-measurement models via ONNX Runtime Web
// Runs in the side panel page context (not the service worker) where WASM is supported.
// Import onnxruntime-web via esbuild bundle — do not call this file directly from a
// <script src="..."> tag without bundling first.

import * as ort from "onnxruntime-web";

const MODEL_NAMES = ["chest", "waist", "neck", "hip"];

let sessions = null;

async function loadSessions() {
  if (sessions) return sessions;

  // Point the WASM loader at dist/ where ort-wasm-simd-threaded.wasm was copied.
  ort.env.wasm.wasmPaths = chrome.runtime.getURL("/dist/");
  // Disable multi-threading — SharedArrayBuffer is not guaranteed in side panel context.
  ort.env.wasm.numThreads = 1;

  const loaded = {};
  for (const name of MODEL_NAMES) {
    const url = chrome.runtime.getURL(`models/${name}_model.onnx`);
    loaded[name] = await ort.InferenceSession.create(url, {
      executionProviders: ["wasm"],
    });
  }

  sessions = loaded;
  return sessions;
}

function floatTensor(value) {
  return new ort.Tensor("float32", new Float32Array([value]), [1, 1]);
}

function stringTensor(value) {
  return new ort.Tensor("string", [String(value)], [1, 1]);
}

/**
 * Run all 4 measurement models and return inch predictions.
 *
 * @param {object} inputs
 * @param {number} inputs.age       - age in years
 * @param {number} inputs.height    - height in centimeters (form collects cm)
 * @param {number} inputs.weight    - weight in kilograms (form collects kg)
 * @param {string} inputs.gender    - "male" or "female"
 * @param {string} inputs.bodyType  - one of the carousel body-type values
 *
 * @returns {Promise<{
 *   chest_prediction: number, waist_prediction: number,
 *   neck_prediction: number,  hip_prediction: number,
 *   chest_raw: number, waist_raw: number,
 *   neck_raw: number,  hip_raw: number
 * }|{error: string}>}
 */
/** Pre-warm: load all sessions early so the first prediction feels instant. */
export function warmup() {
  loadSessions().catch(() => {});
}

export async function predict(inputs) {
  const { age, height, weight, gender, bodyType } = inputs;

  try {
    const s = await loadSessions();

    const feeds = {
      age_years: floatTensor(age),
      height_cm: floatTensor(height),
      weight_kg: floatTensor(weight),
      gender: stringTensor(gender),
      body_type: stringTensor(bodyType),
    };

    // Run all 4 models in parallel.
    const [chestOut, waistOut, neckOut, hipOut] = await Promise.all([
      s.chest.run(feeds),
      s.waist.run(feeds),
      s.neck.run(feeds),
      s.hip.run(feeds),
    ]);

    // Model output is in centimeters.
    let chest_cm = chestOut.variable.data[0];
    let waist_cm = waistOut.variable.data[0];
    let neck_cm  = neckOut.variable.data[0];
    let hip_cm   = hipOut.variable.data[0];

    // Convert cm → inches (unrounded float, matches predict.py's "raw" values).
    const CM_TO_IN = 1 / 2.54;
    let chest_in = chest_cm * CM_TO_IN;
    let waist_in = waist_cm * CM_TO_IN;
    let neck_in  = neck_cm  * CM_TO_IN;
    let hip_in   = hip_cm   * CM_TO_IN;

    // Replicate the Male Oval body-type adjustment from predict.py (lines 161-166).
    // The adjustment (+1 inch) is applied after cm→inches conversion, same as predict.py.
    if (
      String(gender).toLowerCase() === "male" &&
      String(bodyType).toLowerCase() === "oval" &&
      waist_in <= chest_in
    ) {
      waist_in = chest_in + 1;
    }

    function roundWhole(v) { return Math.floor(v + 0.5); }

    return {
      // Rounded whole-number inches — matches predict.py chest_prediction/waist_prediction/etc.
      chest_prediction: roundWhole(chest_in),
      waist_prediction: roundWhole(waist_in),
      neck_prediction:  roundWhole(neck_in),
      hip_prediction:   roundWhole(hip_in),
      // Unrounded float inches — matches predict.py chest_raw/waist_raw/etc.
      chest_raw: chest_in,
      waist_raw: waist_in,
      neck_raw:  neck_in,
      hip_raw:   hip_in,
    };
  } catch (err) {
    console.error("[predict-onnx] inference failed:", err);
    return { error: "model_load_failed" };
  }
}
