(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // charts.js
  var require_charts = __commonJS({
    "charts.js"(exports, module) {
      function inches(cm) {
        return Math.round(cm / 2.54 * 10) / 10;
      }
      function buildRangesFromAnchors(rows, measurementKeys) {
        const output = {};
        for (let index = 0; index < rows.length; index += 1) {
          const row = rows[index];
          const previousRow = rows[index - 1] || null;
          const nextRow = rows[index + 1] || null;
          const resolvedMeasurements = {};
          for (const measurement of measurementKeys) {
            const currentValue = row[measurement];
            if (!Number.isFinite(currentValue)) continue;
            const previousValue = previousRow?.[measurement];
            const nextValue = nextRow?.[measurement];
            let low = currentValue;
            let high = currentValue;
            if (Number.isFinite(previousValue)) {
              low = (previousValue + currentValue) / 2;
            } else if (Number.isFinite(nextValue)) {
              low = currentValue - (nextValue - currentValue) / 2;
            }
            if (Number.isFinite(nextValue)) {
              high = (currentValue + nextValue) / 2;
            } else if (Number.isFinite(previousValue)) {
              high = currentValue + (currentValue - previousValue) / 2;
            }
            resolvedMeasurements[measurement] = [inches(low), inches(high)];
          }
          output[row.size] = resolvedMeasurements;
        }
        return output;
      }
      var globalSizeChart = {
        men: {
          XS: { chest: [33, 35], waist: [27, 29], neck: [13, 14], hip: [33, 35] },
          S: { chest: [36, 38], waist: [30, 32], neck: [15, 16], hip: [36, 38] },
          M: { chest: [39, 41], waist: [33, 35], neck: [17, 18], hip: [39, 41] },
          L: { chest: [42, 44], waist: [36, 38], neck: [19, 20], hip: [42, 44] },
          XL: { chest: [45, 47], waist: [39, 41], neck: [21, 22], hip: [45, 47] }
        },
        women: {
          XS: { chest: [31, 33], waist: [23, 25], hip: [33, 35] },
          S: { chest: [34, 36], waist: [26, 28], hip: [36, 38] },
          M: { chest: [37, 39], waist: [29, 31], hip: [39, 41] },
          L: { chest: [40, 42], waist: [32, 34], hip: [42, 44] },
          XL: { chest: [43, 45], waist: [35, 37], hip: [45, 47] }
        }
      };
      var pullBearSizeChart = {
        men: {
          XS: { chest: [33.9, 33.3], waist: [29, 30], hip: [32.7, 34.3], neck: [15.2, 15.8] },
          S: { chest: [36.7, 37], waist: [30.3, 33.7], hip: [35, 37.4], neck: [16, 16.5] },
          M: { chest: [39.2, 40.6], waist: [34.5, 37.8], hip: [38.2, 40.6], neck: [16.8, 17] },
          L: { chest: [42.3, 43.7], waist: [38.6, 41], hip: [41.3, 43.7], neck: [17.4, 17.9] },
          XL: { chest: [44.5, 49], waist: [42.8, 45.1], hip: [45.5, 48.9], neck: [18, 18.7] },
          XXL: { chest: [50, 52.9], waist: [45.8, 49.1], hip: [49.5, 54.9], neck: [19, 19.5] }
        },
        women: {
          XS: { chest: [31.2, 32.9], waist: [24, 25.6], hip: [33.5, 35], neck: [13, 13.5] },
          S: { chest: [33.7, 35.3], waist: [27.4, 31], hip: [35.8, 37.4], neck: [14, 14.7] },
          M: { chest: [36, 37.4], waist: [29.7, 37.1], hip: [38.2, 40.6], neck: [15, 15.5] },
          L: { chest: [38.2, 43.6], waist: [31.9, 41.3], hip: [44.3, 46.7], neck: [15, 16] },
          XL: { chest: [41.3, 48.7], waist: [43, 47.4], hip: [47.5, 53.9], neck: [16, 17] }
        }
      };
      var pullBearMenTopsSizeChart = buildRangesFromAnchors(
        [
          { size: "XS", chest: 56 },
          { size: "S", chest: 59 },
          { size: "M", chest: 62 },
          { size: "L", chest: 64 },
          { size: "XL", chest: 67 }
        ],
        ["chest"]
      );
      var pullBearWomenTopsSizeChart = buildRangesFromAnchors(
        [
          { size: "XS", chest: 40.8, waist: 34, hip: 44 },
          { size: "S", chest: 43.8, waist: 37, hip: 47 },
          { size: "M", chest: 46.8, waist: 40, hip: 50 },
          { size: "L", chest: 49.8, waist: 43, hip: 53 }
        ],
        ["chest", "waist", "hip"]
      );
      var pullBearSizeCharts = {
        tops: { men: pullBearMenTopsSizeChart, women: pullBearWomenTopsSizeChart }
      };
      var hmMenTopsSizeChart = {
        XS: { chest: [30.7, 33.9], waist: [26, 29.1], neck: [13.4, 13.8] },
        S: { chest: [33.9, 37], waist: [29.1, 32.3], neck: [14.2, 14.6] },
        M: { chest: [37, 40.2], waist: [32.3, 35.4], neck: [15, 15.4] },
        L: { chest: [40.2, 43.3], waist: [35.4, 38.8], neck: [15.7, 16.1] },
        XL: { chest: [43.3, 46.5], waist: [38.8, 42.3], neck: [16.5, 16.9] },
        XXL: { chest: [46.5, 49.6], waist: [42.3, 45.9], neck: [17.3, 17.7] },
        "3XL": { chest: [49.6, 52.8], waist: [45.9, 49.4], neck: [18.1, 18.5] }
      };
      var hmWomenTopsSizeChart = {
        XXS: { chest: [inches(74), inches(78)], waist: [inches(58), inches(62)], hip: [inches(82), inches(86)] },
        XS: { chest: [inches(78), inches(82)], waist: [inches(62), inches(66)], hip: [inches(86), inches(90)] },
        S: { chest: [inches(82), inches(90)], waist: [inches(66), inches(74)], hip: [inches(90), inches(97.5)] },
        M: { chest: [inches(90), inches(98)], waist: [inches(74), inches(82.5)], hip: [inches(97.5), inches(103.5)] },
        L: { chest: [inches(98), inches(107)], waist: [inches(82.5), inches(93)], hip: [inches(103.5), inches(110.5)] },
        XL: { chest: [inches(107), inches(119)], waist: [inches(93), inches(105)], hip: [inches(110.5), inches(120.5)] },
        XXL: { chest: [inches(119), inches(131)], waist: [inches(105.5), inches(117.5)], hip: [inches(120.5), inches(131)] },
        "3XL": { chest: [inches(131), inches(143)], waist: [inches(117.5), inches(131.5)], hip: [inches(131), inches(143)] },
        "4XL": { chest: [inches(143), inches(155)], waist: [inches(131.5), inches(145.5)], hip: [inches(143), inches(155)] }
      };
      var hmWomenTrousersSizeChart = {
        XS: { chest: [29, 30.9], waist: [24, 25.6], hip: [33.5, 35], neck: [13, 13.5] },
        S: { chest: [33.7, 35.3], waist: [27.4, 31], hip: [35.8, 37.4], neck: [14, 14.7] },
        M: { chest: [36, 37.4], waist: [32.7, 37.1], hip: [38.2, 40.6], neck: [15, 15.5] },
        L: { chest: [39.2, 43.6], waist: [39.9, 41.3], hip: [44.3, 46.7], neck: [15, 16] },
        XL: { chest: [45.3, 48.7], waist: [43, 47.4], hip: [47.5, 53.9], neck: [16, 17] }
      };
      var hmSizeCharts = {
        tops: { men: hmMenTopsSizeChart, women: hmWomenTopsSizeChart },
        trousers: { men: globalSizeChart.men, women: hmWomenTrousersSizeChart }
      };
      var splashSizeChart = {
        men: {
          XS: { chest: [34.7, 34.3], waist: [28, 29.5], hip: [32.7, 34.3], neck: [13, 13.5] },
          S: { chest: [36, 36.4], waist: [30.3, 32.7], hip: [35, 37.4], neck: [14, 14.5] },
          M: { chest: [39.2, 40.6], waist: [33.5, 35.8], hip: [38.2, 40.6], neck: [15, 15.5] },
          L: { chest: [43.3, 44.7], waist: [36.6, 39], hip: [41.3, 43.7], neck: [16, 16.5] },
          XL: { chest: [48.5, 48.9], waist: [39.8, 42.1], hip: [44.5, 46.9], neck: [16, 17] },
          XXL: { chest: [52.5, 52.9], waist: [43.8, 49.1], hip: [45.5, 52], neck: [17, 18] }
        },
        women: {
          XS: { chest: [30.3, 31.9], waist: [24, 25.6], hip: [33.5, 35], neck: [13, 14] },
          S: { chest: [32.7, 34.3], waist: [26.4, 28], hip: [35.8, 37.4], neck: [14, 14.5] },
          M: { chest: [35, 36.9], waist: [28.7, 31.1], hip: [38.2, 40.6], neck: [15, 15.5] },
          L: { chest: [38.2, 40.6], waist: [31.9, 34.3], hip: [41.3, 43.7], neck: [15, 16] },
          XL: { chest: [42.3, 43.7], waist: [35, 37.4], hip: [44.5, 46.9], neck: [16, 17] }
        }
      };
      var bershkaSizeChart = {
        men: {
          XS: { chest: [34.3, 35.3], waist: [29, 30.5], hip: [34.7, 36.3], neck: [13, 13.5] },
          S: { chest: [36, 37.4], waist: [31.3, 33.7], hip: [36, 37.4], neck: [14, 14.5] },
          M: { chest: [39.2, 41.6], waist: [33.5, 35.8], hip: [39.2, 40.6], neck: [15, 15.5] },
          L: { chest: [41.3, 44.7], waist: [36.6, 39], hip: [42.3, 43.7], neck: [16, 16.5] },
          XL: { chest: [50.5, 52.9], waist: [39.8, 42.1], hip: [44.5, 46.9], neck: [17, 18] }
        },
        women: {
          XS: { chest: [31.3, 31.9], waist: [23, 25.6], hip: [34.5, 35], neck: [13, 14] },
          S: { chest: [34.7, 34.3], waist: [26.4, 28], hip: [36.8, 37.4], neck: [14, 14.5] },
          M: { chest: [37, 37.4], waist: [28.7, 31.1], hip: [39.2, 40.6], neck: [15, 15.5] },
          L: { chest: [40.2, 40.6], waist: [31.9, 34.3], hip: [42.3, 43.7], neck: [15, 16] },
          XL: { chest: [42.3, 43.7], waist: [35, 37.4], hip: [44.5, 46.9], neck: [16, 17] }
        }
      };
      var brandsForLessSizeChart = {
        men: {
          XS: { chest: [32.7, 34.3], waist: [28, 29.5], hip: [32.7, 34.3], neck: [13, 13.5] },
          S: { chest: [34, 36.4], waist: [30.3, 32.7], hip: [35, 37.4], neck: [14, 14.5] },
          M: { chest: [38.2, 40.6], waist: [33.5, 35.8], hip: [38.2, 40.6], neck: [15, 15.5] },
          L: { chest: [42.3, 44.7], waist: [36.6, 39], hip: [41.3, 43.7], neck: [16, 16.5] },
          XL: { chest: [50.5, 52.9], waist: [39.8, 42.1], hip: [44.5, 46.9], neck: [17, 18] }
        },
        women: {
          XS: { chest: [30.3, 31.9], waist: [24, 25.6], hip: [33.5, 35], neck: [13, 14] },
          S: { chest: [32.7, 34.3], waist: [26.4, 28], hip: [35.8, 37.4], neck: [14, 14.5] },
          M: { chest: [35, 37.4], waist: [28.7, 31.1], hip: [38.2, 40.6], neck: [15, 15.5] },
          L: { chest: [38.2, 40.6], waist: [31.9, 34.3], hip: [41.3, 43.7], neck: [15, 16] },
          XL: { chest: [41.3, 43.7], waist: [35, 37.4], hip: [44.5, 46.9], neck: [16, 17] }
        }
      };
      var centrepointMenTopsSizeChart = buildRangesFromAnchors(
        [
          { size: "XS", chest: 86.4, waist: 69.8, neck: 34.6 },
          { size: "S", chest: 91.4, waist: 74.9, neck: 36.5 },
          { size: "M", chest: 101.6, waist: 85.1, neck: 39 },
          { size: "L", chest: 111.8, waist: 95.9, neck: 41.6 },
          { size: "XL", chest: 121.9, waist: 108.6, neck: 44.1 },
          { size: "2XL", chest: 132.1, waist: 121.3, neck: 46.3 }
        ],
        ["chest", "waist", "neck"]
      );
      var centrepointWomenTopsSizeChart = buildRangesFromAnchors(
        [
          { size: "XS", chest: 86.4, waist: 69.8, neck: 34.6 },
          { size: "S", chest: 91.4, waist: 74.9, neck: 36.5 },
          { size: "M", chest: 101.6, waist: 85.1, neck: 39 },
          { size: "L", chest: 111.8, waist: 95.9, neck: 41.6 },
          { size: "XL", chest: 121.9, waist: 108.6, neck: 44.1 },
          { size: "2XL", chest: 132.1, waist: 121.3, neck: 46.3 }
        ],
        ["chest", "waist", "neck"]
      );
      var centrepointSizeChart = {
        men: centrepointMenTopsSizeChart,
        women: centrepointWomenTopsSizeChart
      };
      var brandChartMap = {
        "pullandbear.com": pullBearSizeChart,
        "pull&bear.com": pullBearSizeChart,
        "splashfashions.com": splashSizeChart,
        "splash.com": splashSizeChart,
        "centrepoint.com": centrepointSizeChart,
        "centrepointarabia.com": centrepointSizeChart,
        "centrepointstores.com": centrepointSizeChart,
        "bershka.com": bershkaSizeChart,
        "brandsforless.com": brandsForLessSizeChart,
        "brands4less.com": brandsForLessSizeChart
      };
      function resolveProductCategory2(productTitle) {
        const t = String(productTitle || "").toLowerCase();
        if (/\b(trouser|trousers|pant|pants|jean|jeans|short|shorts|legging|leggings|skirt|bottom|bottoms)\b/.test(t)) {
          return "trousers";
        }
        return "tops";
      }
      function resolveHmChart(gender, productTitle) {
        const genderKey = gender.toLowerCase() === "female" ? "women" : "men";
        const category = resolveProductCategory2(productTitle);
        const categoryCharts = hmSizeCharts[category] || hmSizeCharts.tops;
        return {
          chart: { men: categoryCharts.men, women: categoryCharts.women },
          chartUsed: `hm.com ${genderKey} ${category}`
        };
      }
      function resolvePullBearChart(gender, productTitle) {
        const genderKey = gender.toLowerCase() === "female" ? "women" : "men";
        const category = resolveProductCategory2(productTitle);
        const categoryCharts = pullBearSizeCharts[category];
        if (!categoryCharts) {
          return { chart: pullBearSizeChart, chartUsed: "pullandbear.com legacy" };
        }
        return {
          chart: { men: categoryCharts.men, women: categoryCharts.women },
          chartUsed: `pullandbear.com ${genderKey} ${category}`
        };
      }
      function resolveChartSignal2(website, gender, productTitle) {
        let selectedChart = globalSizeChart;
        let chartUsed = "global";
        if (website) {
          let domain = website.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
          if (domain.includes("hm.com")) {
            const s = resolveHmChart(gender || "male", productTitle || "");
            return { chartStatus: "fallback", chart: s.chart, chartUsed: s.chartUsed };
          }
          if (domain.includes("pullandbear.com") || domain.includes("pull&bear.com")) {
            const s = resolvePullBearChart(gender || "male", productTitle || "");
            return { chartStatus: "fallback", chart: s.chart, chartUsed: s.chartUsed };
          }
          for (const [brandDomain, chart] of Object.entries(brandChartMap)) {
            if (domain.includes(brandDomain)) {
              selectedChart = chart;
              chartUsed = brandDomain;
              break;
            }
          }
        }
        return { chartStatus: "fallback", chart: selectedChart, chartUsed };
      }
      function resolveReviewSignal2(pageReviews) {
        if (!Array.isArray(pageReviews) || pageReviews.length === 0) {
          return { reviewStatus: "unavailable", reviewNote: "No reviews available" };
        }
        return { reviewStatus: "present", reviewNote: null };
      }
      module.exports = {
        resolveChartSignal: resolveChartSignal2,
        resolveReviewSignal: resolveReviewSignal2,
        resolveProductCategory: resolveProductCategory2,
        globalSizeChart
      };
    }
  });

  // recommendation.js
  var require_recommendation = __commonJS({
    "recommendation.js"(exports, module) {
      var DEFAULT_TOP_PROFILE = {
        weights: {
          chest: 0.5,
          waist: 0.35,
          neck: 0.15
        },
        insideMultiplier: 0.35,
        outsideMultiplier: 1.6,
        fitBiasScale: 1
      };
      var STRUCTURED_TOP_PROFILE = {
        weights: {
          chest: 0.35,
          waist: 0.1,
          neck: 0.55
        },
        insideMultiplier: 0.3,
        outsideMultiplier: 2.2,
        fitBiasScale: 0.4
      };
      var FIT_TARGET_POSITION = {
        slim: 0.72,
        regular: 0.58,
        relaxed: 0.38,
        oversized: 0.22
      };
      var FIT_SIZE_BIAS = {
        slim: 0.45,
        regular: 0,
        relaxed: -0.9,
        oversized: -1.25
      };
      var BODY_TYPE_VARIANT_SIZE_BIAS = {
        runway: 0.55
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
      function resolveTopProfile2(productTitle = "") {
        const normalizedTitle = String(productTitle).toLowerCase();
        const structuredPattern = /\b(dress shirt|button-down|button down|button-up|button up|oxford|formal shirt|tailored shirt|shirt)\b/;
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
          return (low - value) / spread * profile.outsideMultiplier;
        }
        if (value > high) {
          return (value - high) / spread * profile.outsideMultiplier;
        }
        return Math.abs(value - targetPoint) / spread * profile.insideMultiplier;
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
      function buildMatchedMeasurements2(predictions, gender, selectedChart, finalSize) {
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
      function buildRecommendationExplanation2({
        finalSize,
        fitPreference = "regular",
        productTitle = "",
        gender = "",
        chartUsed = "",
        productCategory = "",
        topCategory = "",
        matchedMeasurements = {},
        chartMatchContext = null
      }) {
        const fitLabel = normalizeFitPreference(fitPreference);
        const resolvedTopCategory = topCategory || resolveTopProfile2(productTitle).label;
        const categoryParts = [productCategory, resolvedTopCategory].filter(Boolean);
        const matchSource = chartMatchContext || matchedMeasurements || {};
        const readableMatches = Object.entries(matchSource).map(([measurement, status]) => `${measurement} is ${status}`).slice(0, 3);
        const titlePart = productTitle ? `${productTitle}` : "this item";
        const chartPart = chartUsed ? ` using ${chartUsed}` : "";
        const genderPart = gender ? ` for ${gender}` : "";
        const categoryPart = categoryParts.length ? ` (${categoryParts.join(", ")})` : "";
        const measurementPart = readableMatches.length ? ` ${readableMatches.join(", ")}.` : "";
        return `Recommended ${finalSize} for ${fitLabel} fit on ${titlePart}${genderPart}${categoryPart}${chartPart}.${measurementPart}`.trim();
      }
      function recommendSize2(predictions, gender, selectedChart, options = {}) {
        const genderKey = gender.toLowerCase() === "male" ? "men" : "women";
        const chartForGender = selectedChart?.[genderKey];
        if (!chartForGender) {
          return "Size chart not available for given gender";
        }
        const fitPreference = normalizeFitPreference(options.fitPreference);
        const bodyTypeVariant = normalizeBodyTypeVariant(options.bodyTypeVariant);
        const topProfile = resolveTopProfile2(options.productTitle);
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
        buildMatchedMeasurements: buildMatchedMeasurements2,
        buildRecommendationExplanation: buildRecommendationExplanation2,
        resolveTopProfile: resolveTopProfile2,
        recommendSize: recommendSize2
      };
    }
  });

  // predict-rf.js
  var MODEL_NAMES = ["chest", "waist", "neck", "hip"];
  var models = null;
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
    const genderOhe = model.gender_cats.map((c) => c === gender ? 1 : 0);
    const bodyTypeOhe = model.bodytype_cats.map((c) => c === bodyType ? 1 : 0);
    return [...genderOhe, ...bodyTypeOhe, age, height_cm, weight_kg];
  }
  function warmup() {
    loadModels().catch(() => {
    });
  }
  async function predict(inputs) {
    const { age, height, weight, gender, bodyType } = inputs;
    try {
      let roundWhole = function(v) {
        return Math.floor(v + 0.5);
      };
      const m = await loadModels();
      const features = {
        chest: buildFeatureVector(m.chest, age, height, weight, gender, bodyType),
        waist: buildFeatureVector(m.waist, age, height, weight, gender, bodyType),
        neck: buildFeatureVector(m.neck, age, height, weight, gender, bodyType),
        hip: buildFeatureVector(m.hip, age, height, weight, gender, bodyType)
      };
      const CM_TO_IN = 1 / 2.54;
      let chest_in = predictWithModel(m.chest, features.chest) * CM_TO_IN;
      let waist_in = predictWithModel(m.waist, features.waist) * CM_TO_IN;
      let neck_in = predictWithModel(m.neck, features.neck) * CM_TO_IN;
      let hip_in = predictWithModel(m.hip, features.hip) * CM_TO_IN;
      if (gender.toLowerCase() === "male" && bodyType.toLowerCase() === "oval" && waist_in <= chest_in) {
        waist_in = chest_in + 1;
      }
      return {
        chest_prediction: roundWhole(chest_in),
        waist_prediction: roundWhole(waist_in),
        neck_prediction: roundWhole(neck_in),
        hip_prediction: roundWhole(hip_in),
        chest_raw: chest_in,
        waist_raw: waist_in,
        neck_raw: neck_in,
        hip_raw: hip_in
      };
    } catch (err) {
      console.error("[predict-rf] inference failed:", err);
      return { error: "model_load_failed" };
    }
  }

  // recommendation-engine.js
  var import_charts = __toESM(require_charts());
  var import_recommendation = __toESM(require_recommendation());
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
      const inchesValue = Number.isFinite(predictions?.[rawKey]) ? roundToTenths(predictions[rawKey]) : Number.isFinite(predictions?.[roundedKey]) ? roundToTenths(predictions[roundedKey]) : null;
      if (!Number.isFinite(inchesValue)) continue;
      summary[measurement] = {
        inches: inchesValue,
        cm: inchesToCm(inchesValue)
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
    productTitle
  }) {
    const matchedMeasurements = (0, import_recommendation.buildMatchedMeasurements)(
      predictions,
      gender,
      selectedChart,
      finalSize
    );
    const measurements = buildMeasurementSummary(predictions);
    const topCategory = (0, import_recommendation.resolveTopProfile)(productTitle || "").label;
    const productCategory = (0, import_charts.resolveProductCategory)(productTitle || "");
    const explanation = (0, import_recommendation.buildRecommendationExplanation)({
      finalSize,
      fitPreference,
      productTitle,
      gender,
      productCategory,
      topCategory,
      chartUsed: chartSignal.chartUsed,
      matchedMeasurements,
      chartMatchContext: matchedMeasurements
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
      bodyTypeVariant: bodyTypeVariant || "default"
    };
  }
  async function getRecommendation(payload) {
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
      pageReviews = []
    } = payload;
    const predictions = await predict({ age, height, weight, gender, bodyType });
    if (predictions.error) {
      throw new Error(predictions.error);
    }
    const chartSignal = (0, import_charts.resolveChartSignal)(website, gender, productTitle);
    const reviewSignal = (0, import_charts.resolveReviewSignal)(pageReviews);
    const selectedChart = chartSignal.chart;
    const finalSize = (0, import_recommendation.recommendSize)(predictions, gender, selectedChart, {
      bodyTypeVariant,
      fitPreference,
      productTitle
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
      productTitle
    });
  }

  // pop.js
  document.addEventListener("DOMContentLoaded", () => {
    const extractor = window.FitPredictorPageContext;
    const productImage = document.getElementById("product-image");
    const productTitle = document.getElementById("product-title");
    const pageStatus = document.getElementById("page-status");
    const imageStatus = document.getElementById("image-status");
    const chartDetectStatus = document.getElementById("chart-detect-status");
    const form = document.getElementById("profile-form");
    const recommendButton = document.getElementById("recommend-button");
    const stepBodyType = document.getElementById("step-body-type");
    const stepProfileMetrics = document.getElementById("step-profile-metrics");
    const stepResult = document.getElementById("step-result");
    const sizeRecommendation = document.getElementById("size-recommendation");
    const resultSummary = document.getElementById("result-summary");
    const recommendationExplanation = document.getElementById("recommendation-explanation");
    const measurementSummary = document.getElementById("measurement-summary");
    const chartStatus = document.getElementById("chart-status");
    const reviewStatus = document.getElementById("review-status");
    const reviewNote = document.getElementById("review-note");
    const websiteInput = document.getElementById("website");
    const fitPreferenceInput = document.getElementById("fit-preference");
    const genderToggle = document.getElementById("gender-toggle");
    const genderInput = document.getElementById("gender");
    const bodyTypeInput = document.getElementById("body-type");
    const bodyTypeVariantInput = document.getElementById("body-type-variant");
    const bodyTypeCarousel = document.getElementById("body-type-carousel");
    const step1NextButton = document.getElementById("step-1-next");
    const step2BackButton = document.getElementById("step-2-back");
    const step3BackButton = document.getElementById("step-3-back");
    let activeTabId = null;
    let activeTabUrl = "";
    let activeStep = 1;
    let activeCarouselIndex = 0;
    let activePageContext = {
      pageChart: null,
      pageChartMeta: { source: "disabled", label: null },
      pageReviews: []
    };
    if (!extractor || typeof extractor.getBodyTypeOptions !== "function") {
      console.error("FitPredictor page context helper failed to load");
      pageStatus.textContent = "Extension helper failed to initialize.";
      imageStatus.textContent = "Reload the extension and refresh the tab";
      chartDetectStatus.textContent = "";
      recommendButton.disabled = true;
      return;
    }
    const genderButtons = Array.from(genderToggle?.querySelectorAll("[data-gender]") || []);
    for (const button of genderButtons) {
      button.addEventListener("click", () => {
        syncGenderToggle(button.dataset.gender);
      });
    }
    step1NextButton?.addEventListener("click", () => {
      goToStep(2);
    });
    step2BackButton?.addEventListener("click", () => {
      goToStep(1);
    });
    step3BackButton?.addEventListener("click", () => {
      goToStep(2);
    });
    syncGenderToggle();
    renderBodyTypeCarousel();
    goToStep(1);
    initializePanel().catch((error) => {
      console.error("Failed to initialize panel", error);
      pageStatus.textContent = "Unable to read the active page context.";
      imageStatus.textContent = "Image scan unavailable";
      chartDetectStatus.textContent = "";
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!bodyTypeInput.value) {
        bodyTypeCarousel.querySelector("button")?.focus();
        return;
      }
      recommendButton.disabled = true;
      recommendButton.textContent = "Analyzing fallback chart and profile...";
      const payload = {
        age: Number(document.getElementById("age").value),
        height: Number(document.getElementById("height").value),
        weight: Number(document.getElementById("weight").value),
        gender: genderInput.value,
        bodyType: bodyTypeInput.value,
        bodyTypeVariant: bodyTypeVariantInput?.value || "default",
        fitPreference: document.getElementById("fit-preference").value,
        website: activeTabUrl,
        productTitle: activePageContext.title || "",
        pageReviews: activePageContext.pageReviews || []
      };
      try {
        const data = await getRecommendation(payload);
        renderResult(data);
      } catch (error) {
        console.error("Recommendation error", error);
        goToStep(3);
        stepResult.classList.remove("result-ready");
        sizeRecommendation.classList.remove("is-highlighted");
        void stepResult.offsetWidth;
        void sizeRecommendation.offsetWidth;
        stepResult.classList.add("result-ready");
        sizeRecommendation.textContent = "-";
        const errorState = getRecommendationErrorState(error);
        resultSummary.textContent = errorState.summary;
        renderMeasurementSummary([]);
        recommendationExplanation.textContent = errorState.reviewNote || errorState.summary;
        chartStatus.textContent = errorState.chartStatus;
        reviewStatus.textContent = errorState.reviewStatus;
        reviewNote.textContent = errorState.reviewNote;
        stepResult.scrollIntoView({ behavior: "smooth", block: "start" });
      } finally {
        recommendButton.disabled = false;
        recommendButton.textContent = "Get Recommendation";
      }
    });
    async function initializePanel() {
      warmup();
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      activeTabId = tab?.id ?? null;
      activeTabUrl = tab?.url || "";
      websiteInput.value = activeTabUrl;
      if (activeTabUrl) {
        pageStatus.textContent = `Connected to ${new URL(activeTabUrl).hostname}`;
      } else {
        pageStatus.textContent = "No active product page detected.";
      }
      if (!activeTabId || !/^https?:/i.test(activeTabUrl)) {
        imageStatus.textContent = "Open a shopping page to scan imagery";
        chartDetectStatus.textContent = "Open a shopping page so brand fallback sizing can attach to the store";
        return;
      }
      const context = await requestPageContext(activeTabId);
      activePageContext = context;
      renderPageContext(context);
    }
    function getCarouselOptions() {
      return extractor.getBodyTypeOptions(genderInput.value);
    }
    function goToStep(stepNumber) {
      activeStep = stepNumber;
      stepBodyType.hidden = activeStep !== 1;
      stepProfileMetrics.hidden = activeStep !== 2;
      stepResult.hidden = activeStep !== 3;
    }
    function syncGenderToggle(nextGender = genderInput.value) {
      const normalizedGender = nextGender === "female" || nextGender === "male" ? nextGender : "male";
      const options = extractor.getBodyTypeOptions(normalizedGender);
      genderInput.value = normalizedGender;
      activeCarouselIndex = 0;
      bodyTypeInput.value = options[0]?.value || "";
      if (bodyTypeVariantInput) {
        bodyTypeVariantInput.value = options[0]?.variant || "default";
      }
      for (const button of genderButtons) {
        const isActive = button.dataset.gender === normalizedGender;
        button.setAttribute("aria-pressed", String(isActive));
        button.classList.toggle("is-active", isActive);
      }
      renderBodyTypeCarousel();
    }
    function renderBodyTypeCarousel(focusDirection = null) {
      const options = getCarouselOptions();
      if (!options.length) {
        bodyTypeInput.value = "";
        bodyTypeCarousel.innerHTML = `
        <div class="carousel-empty-state">
          <div class="carousel-image-fallback">
            <strong>No body types available</strong>
            <span>Please try another selection.</span>
          </div>
        </div>
      `;
        return;
      }
      activeCarouselIndex = (activeCarouselIndex % options.length + options.length) % options.length;
      const option = options[activeCarouselIndex];
      const assetUrl = typeof chrome !== "undefined" && chrome.runtime?.getURL ? chrome.runtime.getURL(option.assetPath) : option.assetPath;
      const imageScale = Number.isFinite(Number(option.imageScale)) && Number(option.imageScale) > 0 ? Number(option.imageScale) : 1;
      bodyTypeInput.value = option.value;
      if (bodyTypeVariantInput) {
        bodyTypeVariantInput.value = option.variant || "default";
      }
      bodyTypeCarousel.innerHTML = `
      <div class="body-type-carousel-card" data-body-type="${option.assetSlug}" data-carousel-motion="${focusDirection || "idle"}">
          <div class="carousel-card-content">
            <div class="carousel-model-frame">
            <img class="carousel-model-image" style="--carousel-image-scale: ${imageScale};" src="${assetUrl}" alt="${option.assetAlt}" loading="eager">
            <div class="carousel-image-fallback" hidden>
              <strong>${option.label}</strong>
              <span>Preview unavailable</span>
            </div>
          </div>
          <div class="carousel-copy">
            <div class="carousel-body-type-name">${option.label}</div>
            <div class="carousel-body-type-description">${option.description}</div>
          </div>
          <div class="carousel-controls-row" aria-label="Body type carousel controls">
            <button type="button" class="carousel-nav carousel-nav-previous" data-carousel-direction="previous" aria-label="Previous body type">
              Previous
            </button>
            <button type="button" class="carousel-nav carousel-nav-next" data-carousel-direction="next" aria-label="Next body type">
              Next
            </button>
          </div>
        </div>
      </div>
    `;
      const previousButton = bodyTypeCarousel.querySelector('[data-carousel-direction="previous"]');
      const nextButton = bodyTypeCarousel.querySelector('[data-carousel-direction="next"]');
      const image = bodyTypeCarousel.querySelector(".carousel-model-image");
      const fallback = bodyTypeCarousel.querySelector(".carousel-image-fallback");
      previousButton?.addEventListener("click", () => {
        moveCarousel(-1, "previous");
      });
      nextButton?.addEventListener("click", () => {
        moveCarousel(1, "next");
      });
      image?.addEventListener("load", () => {
        image.hidden = false;
        fallback.hidden = true;
      });
      image?.addEventListener("error", () => {
        image.hidden = true;
        fallback.hidden = false;
      });
      if (image?.complete && image.naturalWidth === 0) {
        image.hidden = true;
        fallback.hidden = false;
      }
      if (focusDirection === "previous") {
        previousButton?.focus();
      }
      if (focusDirection === "next") {
        nextButton?.focus();
      }
    }
    function moveCarousel(direction, focusDirection = null) {
      const options = getCarouselOptions();
      if (!options.length) {
        return;
      }
      activeCarouselIndex = (activeCarouselIndex + direction + options.length) % options.length;
      renderBodyTypeCarousel(focusDirection);
    }
    function renderPageContext(context) {
      if (context.title) {
        productTitle.textContent = truncateText(context.title, 80);
      }
      if (context.bestImage) {
        productImage.src = context.bestImage;
        imageStatus.textContent = "Product image found on the page";
      } else {
        productImage.removeAttribute("src");
        productImage.alt = "No product image found";
        imageStatus.textContent = "No large product image found";
      }
      const SUPPORTED_DOMAINS = [
        "hm.com",
        "pullandbear.com",
        "pull&bear.com",
        "splashfashions.com",
        "splash.com",
        "centrepoint.com",
        "centrepointarabia.com",
        "bershka.com",
        "brandsforless.com",
        "brands4less.com"
      ];
      const domain = activeTabUrl.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
      const isSupported = SUPPORTED_DOMAINS.some((d) => domain.includes(d));
      chartDetectStatus.textContent = isSupported ? `Size chart ready for ${domain}` : "This site isn't directly supported \u2014 predictions will use a generic global size chart. Supported brands: H&M, Pull&Bear, Splash, Bershka, Brands For Less.";
    }
    async function requestPageContext(tabId) {
      try {
        const response = await chrome.tabs.sendMessage(tabId, {
          type: "fitpredictor:extract-page-context"
        });
        if (response?.ok && response.context) {
          return response.context;
        }
      } catch (error) {
      }
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["page-context.js"]
      });
      const retryResponse = await chrome.tabs.sendMessage(tabId, {
        type: "fitpredictor:extract-page-context"
      });
      if (retryResponse?.ok && retryResponse.context) {
        return retryResponse.context;
      }
      if (retryResponse?.error) {
        throw new Error(retryResponse.error);
      }
      return {
        title: "",
        bestImage: null,
        pageChart: null,
        pageChartMeta: { source: "disabled", label: null },
        pageReviews: []
      };
    }
    function renderResult(data) {
      goToStep(3);
      stepResult.classList.remove("result-ready");
      sizeRecommendation.classList.remove("is-highlighted");
      void stepResult.offsetWidth;
      void sizeRecommendation.offsetWidth;
      stepResult.classList.add("result-ready");
      sizeRecommendation.classList.add("is-highlighted");
      sizeRecommendation.textContent = data.finalSize || "-";
      resultSummary.textContent = data.message || "Your fallback size recommendation is ready.";
      renderMeasurementSummary(buildMeasurementRows(data));
      recommendationExplanation.textContent = buildRecommendationExplanation2(data);
      chartStatus.textContent = formatChartStatus(data);
      reviewStatus.textContent = data.reviewStatus || "unavailable";
      reviewNote.textContent = data.reviewNote || "No reviews available";
      stepResult.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function formatChartStatus(data) {
      if (data.chartUsed) {
        return `${data.chartStatus || "unknown"} (${data.chartUsed})`;
      }
      return data.chartStatus || "unknown";
    }
    function getRecommendationErrorState(error) {
      const errorMessage = String(error?.message || "");
      return {
        summary: "We could not generate a recommendation yet.",
        chartStatus: "Unavailable",
        reviewStatus: "Unavailable",
        reviewNote: `The recommendation request failed: ${errorMessage || "unknown error"}`
      };
    }
    function renderMeasurementSummary(rows) {
      if (!measurementSummary) {
        return;
      }
      if (!rows.length) {
        measurementSummary.innerHTML = `
        <span class="muted">Predicted measurement breakdown unavailable.</span>
      `;
        return;
      }
      measurementSummary.innerHTML = rows.map(
        (row) => `
          <div class="measurement-row">
            <span>${row.label}</span>
            <span class="measurement-values">
              <span class="primary">${formatMeasurementValue(row.inches, "in")}</span>
              <span class="secondary">${formatMeasurementValue(row.cm, "cm")}</span>
            </span>
          </div>
        `
      ).join("");
    }
    function buildMeasurementRows(data) {
      const labels = [
        ["chest", "Chest"],
        ["waist", "Waist"],
        ["neck", "Neck"],
        ["hip", "Hip"]
      ];
      return labels.map(([key, label]) => {
        const pair = extractMeasurementPair(data, key);
        if (!pair) {
          return null;
        }
        return { key, label, ...pair };
      }).filter(Boolean);
    }
    function extractMeasurementPair(data, measurementKey) {
      const measurementContainers = [
        data?.measurements?.[measurementKey],
        data?.measurementSummary?.[measurementKey],
        data?.predictedMeasurements?.[measurementKey]
      ];
      for (const container of measurementContainers) {
        const normalized = normalizeMeasurementContainer(container);
        if (normalized) {
          return normalized;
        }
      }
      const predictionSource = data?.predictions && typeof data.predictions === "object" ? data.predictions : data || {};
      const rawValue = numberOrNull(predictionSource[`${measurementKey}_raw`]) ?? numberOrNull(predictionSource[`${measurementKey}_prediction`]) ?? numberOrNull(predictionSource[measurementKey]);
      if (rawValue == null) {
        return null;
      }
      return {
        inches: rawValue,
        cm: rawValue * 2.54
      };
    }
    function normalizeMeasurementContainer(container) {
      if (container == null) {
        return null;
      }
      if (typeof container === "number" || typeof container === "string") {
        const inchesValue2 = numberOrNull(container);
        if (inchesValue2 == null) {
          return null;
        }
        return {
          inches: inchesValue2,
          cm: inchesValue2 * 2.54
        };
      }
      if (typeof container !== "object") {
        return null;
      }
      const inchesValue = numberOrNull(container.inches) ?? numberOrNull(container.inch) ?? numberOrNull(container.valueInches) ?? numberOrNull(container.inchesValue) ?? numberOrNull(container.value) ?? numberOrNull(container.prediction) ?? numberOrNull(container.raw);
      const cmValue = numberOrNull(container.cm) ?? numberOrNull(container.centimeters) ?? numberOrNull(container.centimetres) ?? numberOrNull(container.valueCm) ?? numberOrNull(container.cmValue) ?? numberOrNull(container.predictionCm);
      if (inchesValue == null && cmValue == null) {
        return null;
      }
      const resolvedInches = inchesValue ?? cmValue / 2.54;
      const resolvedCm = cmValue ?? resolvedInches * 2.54;
      return {
        inches: resolvedInches,
        cm: resolvedCm
      };
    }
    function buildRecommendationExplanation2(data) {
      const backendExplanation = data?.explanation || data?.recommendationExplanation || data?.reason || data?.explanationText || data?.sizeReason;
      if (backendExplanation) {
        return String(backendExplanation).trim();
      }
      const measurementRows = buildMeasurementRows(data);
      if (!measurementRows.length) {
        return "No measurement breakdown is available yet.";
      }
      const labels = measurementRows.map((row) => row.label.toLowerCase()).join(", ");
      const finalSize = data?.finalSize ? ` ${data.finalSize}` : "";
      const chartLabel = data?.chartUsed ? `the ${data.chartUsed} fallback chart` : "the fallback chart";
      return `FitPredictor used ${chartLabel} to compare your ${labels} predictions and chose${finalSize || " the suggested size"}.`;
    }
    function formatMeasurementValue(value, unit) {
      const numeric = numberOrNull(value);
      if (numeric == null) {
        return "n/a";
      }
      const rounded = Math.round(numeric * 10) / 10;
      const displayValue = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
      return `${displayValue} ${unit}`;
    }
    function numberOrNull(value) {
      if (value == null || value === "") {
        return null;
      }
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : null;
    }
    function truncateText(value, maxLength) {
      if (!value) {
        return "";
      }
      const text = String(value).replace(/\s+/g, " ").trim();
      if (text.length <= maxLength) {
        return text;
      }
      return `${text.slice(0, maxLength - 1).trim()}\u2026`;
    }
  });
})();
