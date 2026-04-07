// predict-rf.js — pure JS RandomForest inference. No WASM, no ONNX, no dynamic imports.
// Replaces predict-onnx.js. Same input/output interface.

const MODEL_NAMES = ["chest", "waist", "neck", "hip"];

let models = null;

async function loadModels() {
  if (models) return models;

  const loaded = {};
  for (const name of MODEL_NAMES) {
    const url = chrome.runtime.getURL(`models/${name}_model.json`);
    const res = await fetch(url);
    loaded[name] = await res.json();
  }

  models = loaded;
  return models;
}

function traverseTree(nodes, features) {
  let i = 0;
  while (nodes[i].f !== -1) {
    i = features[nodes[i].f] <= nodes[i].th ? nodes[i].l : nodes[i].r;
  }
  return nodes[i].v;
}

function predictWithModel(model, features) {
  let sum = 0;
  for (const tree of model.trees) {
    sum += traverseTree(tree, features);
  }
  return sum / model.trees.length;
}

function buildFeatureVector(model, age, height_cm, weight_kg, gender, bodyType) {
  // Feature order matches ColumnTransformer:
  //   [gender OHE...] [body_type OHE...] [age_years, height_cm, weight_kg]
  const genderOhe    = model.gender_cats.map(c => c === gender ? 1 : 0);
  const bodyTypeOhe  = model.bodytype_cats.map(c => c === bodyType ? 1 : 0);
  return [...genderOhe, ...bodyTypeOhe, age, height_cm, weight_kg];
}

export function warmup() {
  loadModels().catch(() => {});
}

/**
 * @param {object} inputs
 * @param {number} inputs.age       - age in years
 * @param {number} inputs.height    - height in centimeters
 * @param {number} inputs.weight    - weight in kilograms
 * @param {string} inputs.gender    - "male" or "female"
 * @param {string} inputs.bodyType  - carousel body-type value
 */
export async function predict(inputs) {
  const { age, height, weight, gender, bodyType } = inputs;

  try {
    const m = await loadModels();

    const features = {
      chest: buildFeatureVector(m.chest, age, height, weight, gender, bodyType),
      waist: buildFeatureVector(m.waist, age, height, weight, gender, bodyType),
      neck:  buildFeatureVector(m.neck,  age, height, weight, gender, bodyType),
      hip:   buildFeatureVector(m.hip,   age, height, weight, gender, bodyType),
    };

    // Model output is in centimeters.
    const CM_TO_IN = 1 / 2.54;
    let chest_in = predictWithModel(m.chest, features.chest) * CM_TO_IN;
    let waist_in = predictWithModel(m.waist, features.waist) * CM_TO_IN;
    let neck_in  = predictWithModel(m.neck,  features.neck)  * CM_TO_IN;
    let hip_in   = predictWithModel(m.hip,   features.hip)   * CM_TO_IN;

    // Replicate Male Oval adjustment from predict.py (lines 161-166).
    if (gender.toLowerCase() === "male" && bodyType.toLowerCase() === "oval" && waist_in <= chest_in) {
      waist_in = chest_in + 1;
    }

    function roundWhole(v) { return Math.floor(v + 0.5); }

    return {
      chest_prediction: roundWhole(chest_in),
      waist_prediction: roundWhole(waist_in),
      neck_prediction:  roundWhole(neck_in),
      hip_prediction:   roundWhole(hip_in),
      chest_raw: chest_in,
      waist_raw: waist_in,
      neck_raw:  neck_in,
      hip_raw:   hip_in,
    };
  } catch (err) {
    console.error("[predict-rf] inference failed:", err);
    return { error: "model_load_failed" };
  }
}
