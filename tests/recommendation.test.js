const test = require("node:test");
const assert = require("node:assert/strict");

const {
  recommendSize,
  buildRecommendationExplanation,
} = require("../recommendation");

const hmMenChart = {
  men: {
    XS: { chest: [30.7, 33.9], waist: [26, 29.1], neck: [13.4, 13.8] },
    S: { chest: [33.9, 37], waist: [29.1, 32.3], neck: [14.2, 14.6] },
    M: { chest: [37, 40.2], waist: [32.3, 35.4], neck: [15, 15.4] },
    L: { chest: [40.2, 43.3], waist: [35.4, 38.8], neck: [15.7, 16.1] },
  },
};

test("recommendSize biases toward a roomier top size when fit preference is relaxed", () => {
  const predictions = {
    chest_prediction: 36,
    waist_prediction: 32,
    neck_prediction: 14,
  };

  const slim = recommendSize(predictions, "male", hmMenChart, {
    fitPreference: "slim",
    productTitle: "Regular fit sweatshirt",
  });
  const relaxed = recommendSize(predictions, "male", hmMenChart, {
    fitPreference: "relaxed",
    productTitle: "Regular fit sweatshirt",
  });

  assert.equal(slim, "S");
  assert.equal(relaxed, "M");
});

test("recommendSize gives neckline more influence for structured tops", () => {
  const predictions = {
    chest_prediction: 37,
    waist_prediction: 31,
    neck_prediction: 15,
  };

  const casualTop = recommendSize(predictions, "male", hmMenChart, {
    fitPreference: "regular",
    productTitle: "Cotton sweatshirt",
  });
  const structuredTop = recommendSize(predictions, "male", hmMenChart, {
    fitPreference: "regular",
    productTitle: "Slim fit dress shirt",
  });

  assert.equal(casualTop, "S");
  assert.equal(structuredTop, "M");
});

test("buildRecommendationExplanation summarizes fit, category, and chart context", () => {
  const explanation = buildRecommendationExplanation({
    finalSize: "S",
    fitPreference: "regular",
    productTitle: "Cape-look Top",
    gender: "female",
    chartUsed: "hm.com women tops",
    matchedMeasurements: {
      chest: "in range",
      waist: "in range",
      hip: "near smaller size",
    },
  });

  assert.match(explanation, /Cape-look Top/i);
  assert.match(explanation, /regular fit/i);
  assert.match(explanation, /hm\.com women tops/i);
  assert.match(explanation, /S/i);
});

test("recommendSize applies a small runway alias bias for female rectangle-based fits", () => {
  const womenChart = {
    women: {
      XS: { chest: [31, 33], waist: [23, 25], hip: [33, 35] },
      S: { chest: [34, 36], waist: [26, 28], hip: [36, 38] },
      M: { chest: [37, 39], waist: [29, 31], hip: [39, 41] },
    },
  };

  const predictions = {
    chest_prediction: 33.7,
    waist_prediction: 26.1,
    hip_prediction: 35.6,
  };

  const regularRectangle = recommendSize(predictions, "female", womenChart, {
    fitPreference: "regular",
    productTitle: "Cape top",
    bodyTypeVariant: "default",
  });
  const runwayRectangle = recommendSize(predictions, "female", womenChart, {
    fitPreference: "regular",
    productTitle: "Cape top",
    bodyTypeVariant: "runway",
  });

  assert.equal(regularRectangle, "S");
  assert.equal(runwayRectangle, "XS");
});
