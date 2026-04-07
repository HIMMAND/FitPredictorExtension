// recommendation-engine.js — self-contained recommendation pipeline for in-browser use.
// Replaces the fetch("http://localhost:3000/api/recommendation") call in pop.js.
// Bundled by esbuild, which handles CJS interop for recommendation.js and charts.js.

import { predict, warmup } from "./predict-rf.js";

export { warmup };
import {
  resolveChartSignal,
  resolveReviewSignal,
  resolveProductCategory,
} from "./charts.js";
import {
  recommendSize,
  buildMatchedMeasurements,
  buildRecommendationExplanation,
  resolveTopProfile,
} from "./recommendation.js";

function roundToTenths(value) {
  return Math.round(Number(value) * 10) / 10;
}

function inchesToCm(value) {
  return roundToTenths(Number(value) * 2.54);
}

function buildMeasurementSummary(predictions) {
  const summary = {};
  for (const measurement of ["chest", "waist", "neck", "hip"]) {
    const rawKey = `${measurement}_raw`;
    const roundedKey = `${measurement}_prediction`;
    const inchesValue = Number.isFinite(predictions?.[rawKey])
      ? roundToTenths(predictions[rawKey])
      : Number.isFinite(predictions?.[roundedKey])
        ? roundToTenths(predictions[roundedKey])
        : null;

    if (!Number.isFinite(inchesValue)) continue;

    summary[measurement] = {
      inches: inchesValue,
      cm: inchesToCm(inchesValue),
    };
  }
  return summary;
}

function buildRecommendationResponse({
  predictions,
  gender,
  selectedChart,
  chartSignal,
  reviewSignal,
  finalSize,
  fitPreference,
  bodyTypeVariant,
  productTitle,
}) {
  const matchedMeasurements = buildMatchedMeasurements(
    predictions,
    gender,
    selectedChart,
    finalSize
  );
  const measurements = buildMeasurementSummary(predictions);
  const topCategory = resolveTopProfile(productTitle || "").label;
  const productCategory = resolveProductCategory(productTitle || "");
  const explanation = buildRecommendationExplanation({
    finalSize,
    fitPreference,
    productTitle,
    gender,
    productCategory,
    topCategory,
    chartUsed: chartSignal.chartUsed,
    matchedMeasurements,
    chartMatchContext: matchedMeasurements,
  });

  return {
    message: "Prediction successful",
    predictions,
    measurements,
    measurementSummary: measurements,
    predictedMeasurements: measurements,
    explanation,
    recommendationExplanation: explanation,
    sizeReason: explanation,
    matchedMeasurements,
    chartMatchContext: matchedMeasurements,
    finalSize,
    chartUsed: chartSignal.chartUsed,
    chartStatus: chartSignal.chartStatus,
    reviewStatus: reviewSignal.reviewStatus,
    reviewNote: reviewSignal.reviewNote,
    productCategory,
    topCategory,
    fitPreference: fitPreference || "regular",
    bodyTypeVariant: bodyTypeVariant || "default",
  };
}

/**
 * Main entry point. Drop-in replacement for the /api/recommendation server call.
 *
 * @param {object} payload - same shape as what pop.js POSTs to the server
 * @param {number} payload.age
 * @param {number} payload.height    - centimeters
 * @param {number} payload.weight    - kilograms
 * @param {string} payload.gender    - "male" | "female"
 * @param {string} payload.bodyType
 * @param {string} [payload.bodyTypeVariant]
 * @param {string} [payload.fitPreference]
 * @param {string} [payload.website]
 * @param {string} [payload.productTitle]
 * @param {Array}  [payload.pageReviews]
 *
 * @returns {Promise<object>} recommendation response (same shape as server JSON)
 */
export async function getRecommendation(payload) {
  const {
    age,
    height,
    weight,
    gender,
    bodyType,
    bodyTypeVariant = "default",
    fitPreference = "regular",
    website = "",
    productTitle = "",
    pageReviews = [],
  } = payload;

  const predictions = await predict({ age, height, weight, gender, bodyType });

  if (predictions.error) {
    throw new Error(predictions.error);
  }

  const chartSignal = resolveChartSignal(website, gender, productTitle);
  const reviewSignal = resolveReviewSignal(pageReviews);
  const selectedChart = chartSignal.chart;

  const finalSize = recommendSize(predictions, gender, selectedChart, {
    bodyTypeVariant,
    fitPreference,
    productTitle,
  });

  return buildRecommendationResponse({
    predictions,
    gender,
    selectedChart,
    chartSignal,
    reviewSignal,
    finalSize,
    fitPreference,
    bodyTypeVariant,
    productTitle,
  });
}
