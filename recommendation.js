const DEFAULT_TOP_PROFILE = {
  weights: {
    chest: 0.5,
    waist: 0.35,
    neck: 0.15,
  },
  insideMultiplier: 0.35,
  outsideMultiplier: 1.6,
  fitBiasScale: 1,
};

const STRUCTURED_TOP_PROFILE = {
  weights: {
    chest: 0.35,
    waist: 0.1,
    neck: 0.55,
  },
  insideMultiplier: 0.3,
  outsideMultiplier: 2.2,
  fitBiasScale: 0.4,
};

const FIT_TARGET_POSITION = {
  slim: 0.72,
  regular: 0.58,
  relaxed: 0.38,
  oversized: 0.22,
};

const FIT_SIZE_BIAS = {
  slim: 0.45,
  regular: 0,
  relaxed: -0.9,
  oversized: -1.25,
};

const BODY_TYPE_VARIANT_SIZE_BIAS = {
  runway: 0.55,
};

function normalizeFitPreference(fitPreference) {
  return FIT_TARGET_POSITION[fitPreference] ? fitPreference : "regular";
}

function normalizeBodyTypeVariant(bodyTypeVariant) {
  return BODY_TYPE_VARIANT_SIZE_BIAS[bodyTypeVariant] ? bodyTypeVariant : "default";
}

function normalizeRange(range) {
  if (!Array.isArray(range) || range.length < 2) {
    return null;
  }

  const low = Number(range[0]);
  const high = Number(range[1]);

  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    return null;
  }

  return low <= high ? [low, high] : [high, low];
}

function resolveTopProfile(productTitle = "") {
  const normalizedTitle = String(productTitle).toLowerCase();
  const structuredPattern =
    /\b(dress shirt|button-down|button down|button-up|button up|oxford|formal shirt|tailored shirt|shirt)\b/;

  if (structuredPattern.test(normalizedTitle)) {
    return STRUCTURED_TOP_PROFILE;
  }

  return DEFAULT_TOP_PROFILE;
}

function getMeasurementWeights(ranges, baseWeights) {
  const availableWeights = {};
  let totalWeight = 0;

  for (const [measurement, weight] of Object.entries(baseWeights)) {
    const predictionKey = `${measurement}_prediction`;
    if (!normalizeRange(ranges[measurement])) {
      continue;
    }

    availableWeights[measurement] = weight;
    totalWeight += weight;

    if (!predictionKey) {
      break;
    }
  }

  if (totalWeight === 0) {
    return availableWeights;
  }

  for (const measurement of Object.keys(availableWeights)) {
    availableWeights[measurement] /= totalWeight;
  }

  return availableWeights;
}

function scoreMeasurement(value, range, fitPreference, profile) {
  const [low, high] = range;
  const spread = Math.max(high - low, 0.01);
  const targetPoint = low + spread * FIT_TARGET_POSITION[fitPreference];

  if (value < low) {
    return ((low - value) / spread) * profile.outsideMultiplier;
  }

  if (value > high) {
    return ((value - high) / spread) * profile.outsideMultiplier;
  }

  return (Math.abs(value - targetPoint) / spread) * profile.insideMultiplier;
}

function getSizeRanges(chartForGender, size) {
  return chartForGender?.[size] || null;
}

function describeMeasurementMatch(value, range) {
  const normalizedRange = normalizeRange(range);

  if (!normalizedRange || !Number.isFinite(value)) {
    return "unavailable";
  }

  const [low, high] = normalizedRange;
  const spread = Math.max(high - low, 0.01);
  const edgeAllowance = spread * 0.15;

  if (value < low) {
    return low - value <= edgeAllowance ? "near smaller size" : "below range";
  }

  if (value > high) {
    return value - high <= edgeAllowance ? "near roomier size" : "above range";
  }

  return "in range";
}

function buildMatchedMeasurements(predictions, gender, selectedChart, finalSize) {
  const genderKey = gender.toLowerCase() === "male" ? "men" : "women";
  const chartForGender = selectedChart?.[genderKey];
  const ranges = getSizeRanges(chartForGender, finalSize);

  if (!ranges) {
    return {};
  }

  const matches = {};
  for (const measurement of ["chest", "waist", "neck", "hip"]) {
    const predictionValue = predictions?.[`${measurement}_prediction`];
    const range = ranges?.[measurement];

    if (!Number.isFinite(predictionValue) || !range) {
      continue;
    }

    matches[measurement] = describeMeasurementMatch(predictionValue, range);
  }

  return matches;
}

function buildRecommendationExplanation({
  finalSize,
  fitPreference = "regular",
  productTitle = "",
  gender = "",
  chartUsed = "",
  productCategory = "",
  topCategory = "",
  matchedMeasurements = {},
  chartMatchContext = null,
}) {
  const fitLabel = normalizeFitPreference(fitPreference);
  const resolvedTopCategory = topCategory || resolveTopProfile(productTitle).label;
  const categoryParts = [productCategory, resolvedTopCategory].filter(Boolean);
  const matchSource = chartMatchContext || matchedMeasurements || {};
  const readableMatches = Object.entries(matchSource)
    .map(([measurement, status]) => `${measurement} is ${status}`)
    .slice(0, 3);

  const titlePart = productTitle ? `${productTitle}` : "this item";
  const chartPart = chartUsed ? ` using ${chartUsed}` : "";
  const genderPart = gender ? ` for ${gender}` : "";
  const categoryPart = categoryParts.length ? ` (${categoryParts.join(", ")})` : "";
  const measurementPart = readableMatches.length
    ? ` ${readableMatches.join(", ")}.`
    : "";

  return `Recommended ${finalSize} for ${fitLabel} fit on ${titlePart}${genderPart}${categoryPart}${chartPart}.${measurementPart}`.trim();
}

function recommendSize(predictions, gender, selectedChart, options = {}) {
  const genderKey = gender.toLowerCase() === "male" ? "men" : "women";
  const chartForGender = selectedChart?.[genderKey];

  if (!chartForGender) {
    return "Size chart not available for given gender";
  }

  const fitPreference = normalizeFitPreference(options.fitPreference);
  const bodyTypeVariant = normalizeBodyTypeVariant(options.bodyTypeVariant);
  const topProfile = resolveTopProfile(options.productTitle);
  const entries = Object.entries(chartForGender);
  let bestSize = null;
  let bestScore = Infinity;

  for (const [size, ranges] of entries) {
    const measurementWeights = getMeasurementWeights(ranges, topProfile.weights);
    let score = 0;

    for (const [measurement, weight] of Object.entries(measurementWeights)) {
      const predictionValue = predictions?.[`${measurement}_prediction`];
      const range = normalizeRange(ranges[measurement]);

      if (!Number.isFinite(predictionValue) || !range) {
        continue;
      }

      score += scoreMeasurement(predictionValue, range, fitPreference, topProfile) * weight;
    }

    const sizeIndex = entries.findIndex(([entrySize]) => entrySize === size);
    score += FIT_SIZE_BIAS[fitPreference] * sizeIndex * topProfile.fitBiasScale;
    if (genderKey === "women" && bodyTypeVariant === "runway") {
      score += BODY_TYPE_VARIANT_SIZE_BIAS.runway * sizeIndex * topProfile.fitBiasScale;
    }

    if (score < bestScore) {
      bestScore = score;
      bestSize = size;
    }
  }

  return bestSize;
}

module.exports = {
  buildMatchedMeasurements,
  buildRecommendationExplanation,
  resolveTopProfile,
  recommendSize,
};
