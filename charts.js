// charts.js — browser-compatible chart data and resolution logic
// Extracted from server.js for use in the extension bundle.

function inches(cm) {
  return Math.round((cm / 2.54) * 10) / 10;
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

const globalSizeChart = {
  men: {
    XS: { chest: [33, 35], waist: [27, 29], neck: [13, 14], hip: [33, 35] },
    S:  { chest: [36, 38], waist: [30, 32], neck: [15, 16], hip: [36, 38] },
    M:  { chest: [39, 41], waist: [33, 35], neck: [17, 18], hip: [39, 41] },
    L:  { chest: [42, 44], waist: [36, 38], neck: [19, 20], hip: [42, 44] },
    XL: { chest: [45, 47], waist: [39, 41], neck: [21, 22], hip: [45, 47] },
  },
  women: {
    XS: { chest: [31, 33], waist: [23, 25], hip: [33, 35] },
    S:  { chest: [34, 36], waist: [26, 28], hip: [36, 38] },
    M:  { chest: [37, 39], waist: [29, 31], hip: [39, 41] },
    L:  { chest: [40, 42], waist: [32, 34], hip: [42, 44] },
    XL: { chest: [43, 45], waist: [35, 37], hip: [45, 47] },
  }
};

const pullBearSizeChart = {
  men: {
    XS:  { chest: [33.9, 33.3], waist: [29.0, 30],    hip: [32.7, 34.3], neck: [15.2, 15.8] },
    S:   { chest: [36.7, 37],   waist: [30.3, 33.7],   hip: [35.0, 37.4], neck: [16, 16.5] },
    M:   { chest: [39.2, 40.6], waist: [34.5, 37.8],   hip: [38.2, 40.6], neck: [16.8, 17] },
    L:   { chest: [42.3, 43.7], waist: [38.6, 41.0],   hip: [41.3, 43.7], neck: [17.4, 17.9] },
    XL:  { chest: [44.5, 49],   waist: [42.8, 45.1],   hip: [45.5, 48.9], neck: [18, 18.7] },
    XXL: { chest: [50, 52.9],   waist: [45.8, 49.1],   hip: [49.5, 54.9], neck: [19, 19.5] },
  },
  women: {
    XS: { chest: [31.2, 32.9], waist: [24.0, 25.6], hip: [33.5, 35.0], neck: [13, 13.5] },
    S:  { chest: [33.7, 35.3], waist: [27.4, 31.0], hip: [35.8, 37.4], neck: [14, 14.7] },
    M:  { chest: [36.0, 37.4], waist: [29.7, 37.1], hip: [38.2, 40.6], neck: [15, 15.5] },
    L:  { chest: [38.2, 43.6], waist: [31.9, 41.3], hip: [44.3, 46.7], neck: [15, 16] },
    XL: { chest: [41.3, 48.7], waist: [43.0, 47.4], hip: [47.5, 53.9], neck: [16, 17] },
  }
};

const pullBearMenTopsSizeChart = buildRangesFromAnchors(
  [
    { size: 'XS', chest: 56.0 },
    { size: 'S',  chest: 59.0 },
    { size: 'M',  chest: 62.0 },
    { size: 'L',  chest: 64.0 },
    { size: 'XL', chest: 67.0 },
  ],
  ['chest']
);

const pullBearWomenTopsSizeChart = buildRangesFromAnchors(
  [
    { size: 'XS', chest: 40.8, waist: 34.0, hip: 44.0 },
    { size: 'S',  chest: 43.8, waist: 37.0, hip: 47.0 },
    { size: 'M',  chest: 46.8, waist: 40.0, hip: 50.0 },
    { size: 'L',  chest: 49.8, waist: 43.0, hip: 53.0 },
  ],
  ['chest', 'waist', 'hip']
);

const pullBearSizeCharts = {
  tops: { men: pullBearMenTopsSizeChart, women: pullBearWomenTopsSizeChart },
};

const hmMenTopsSizeChart = {
  XS:   { chest: [30.7, 33.9], waist: [26, 29.1],   neck: [13.4, 13.8] },
  S:    { chest: [33.9, 37],   waist: [29.1, 32.3],  neck: [14.2, 14.6] },
  M:    { chest: [37, 40.2],   waist: [32.3, 35.4],  neck: [15, 15.4] },
  L:    { chest: [40.2, 43.3], waist: [35.4, 38.8],  neck: [15.7, 16.1] },
  XL:   { chest: [43.3, 46.5], waist: [38.8, 42.3],  neck: [16.5, 16.9] },
  XXL:  { chest: [46.5, 49.6], waist: [42.3, 45.9],  neck: [17.3, 17.7] },
  '3XL':{ chest: [49.6, 52.8], waist: [45.9, 49.4],  neck: [18.1, 18.5] },
};

const hmWomenTopsSizeChart = {
  XXS: { chest: [inches(74), inches(78)],   waist: [inches(58), inches(62)],   hip: [inches(82), inches(86)] },
  XS:  { chest: [inches(78), inches(82)],   waist: [inches(62), inches(66)],   hip: [inches(86), inches(90)] },
  S:   { chest: [inches(82), inches(90)],   waist: [inches(66), inches(74)],   hip: [inches(90), inches(97.5)] },
  M:   { chest: [inches(90), inches(98)],   waist: [inches(74), inches(82.5)], hip: [inches(97.5), inches(103.5)] },
  L:   { chest: [inches(98), inches(107)],  waist: [inches(82.5), inches(93)], hip: [inches(103.5), inches(110.5)] },
  XL:  { chest: [inches(107), inches(119)], waist: [inches(93), inches(105)],  hip: [inches(110.5), inches(120.5)] },
  XXL: { chest: [inches(119), inches(131)], waist: [inches(105.5), inches(117.5)], hip: [inches(120.5), inches(131)] },
  '3XL':{ chest: [inches(131), inches(143)], waist: [inches(117.5), inches(131.5)], hip: [inches(131), inches(143)] },
  '4XL':{ chest: [inches(143), inches(155)], waist: [inches(131.5), inches(145.5)], hip: [inches(143), inches(155)] },
};

const hmWomenTrousersSizeChart = {
  XS: { chest: [29, 30.9],   waist: [24.0, 25.6], hip: [33.5, 35.0], neck: [13, 13.5] },
  S:  { chest: [33.7, 35.3], waist: [27.4, 31.0], hip: [35.8, 37.4], neck: [14, 14.7] },
  M:  { chest: [36.0, 37.4], waist: [32.7, 37.1], hip: [38.2, 40.6], neck: [15, 15.5] },
  L:  { chest: [39.2, 43.6], waist: [39.9, 41.3], hip: [44.3, 46.7], neck: [15, 16] },
  XL: { chest: [45.3, 48.7], waist: [43.0, 47.4], hip: [47.5, 53.9], neck: [16, 17] },
};

const hmSizeCharts = {
  tops:     { men: hmMenTopsSizeChart,    women: hmWomenTopsSizeChart },
  trousers: { men: globalSizeChart.men,   women: hmWomenTrousersSizeChart },
};

const splashSizeChart = {
  men: {
    XS:  { chest: [34.7, 34.3], waist: [28.0, 29.5], hip: [32.7, 34.3], neck: [13, 13.5] },
    S:   { chest: [36.0, 36.4], waist: [30.3, 32.7], hip: [35.0, 37.4], neck: [14, 14.5] },
    M:   { chest: [39.2, 40.6], waist: [33.5, 35.8], hip: [38.2, 40.6], neck: [15, 15.5] },
    L:   { chest: [43.3, 44.7], waist: [36.6, 39.0], hip: [41.3, 43.7], neck: [16, 16.5] },
    XL:  { chest: [48.5, 48.9], waist: [39.8, 42.1], hip: [44.5, 46.9], neck: [16, 17] },
    XXL: { chest: [52.5, 52.9], waist: [43.8, 49.1], hip: [45.5, 52],   neck: [17, 18] },
  },
  women: {
    XS: { chest: [30.3, 31.9], waist: [24.0, 25.6], hip: [33.5, 35.0], neck: [13, 14] },
    S:  { chest: [32.7, 34.3], waist: [26.4, 28.0], hip: [35.8, 37.4], neck: [14, 14.5] },
    M:  { chest: [35.0, 36.9], waist: [28.7, 31.1], hip: [38.2, 40.6], neck: [15, 15.5] },
    L:  { chest: [38.2, 40.6], waist: [31.9, 34.3], hip: [41.3, 43.7], neck: [15, 16] },
    XL: { chest: [42.3, 43.7], waist: [35.0, 37.4], hip: [44.5, 46.9], neck: [16, 17] },
  }
};

const bershkaSizeChart = {
  men: {
    XS: { chest: [34.3, 35.3], waist: [29.0, 30.5], hip: [34.7, 36.3], neck: [13, 13.5] },
    S:  { chest: [36.0, 37.4], waist: [31.3, 33.7], hip: [36.0, 37.4], neck: [14, 14.5] },
    M:  { chest: [39.2, 41.6], waist: [33.5, 35.8], hip: [39.2, 40.6], neck: [15, 15.5] },
    L:  { chest: [41.3, 44.7], waist: [36.6, 39.0], hip: [42.3, 43.7], neck: [16, 16.5] },
    XL: { chest: [50.5, 52.9], waist: [39.8, 42.1], hip: [44.5, 46.9], neck: [17, 18] },
  },
  women: {
    XS: { chest: [31.3, 31.9], waist: [23.0, 25.6], hip: [34.5, 35.0], neck: [13, 14] },
    S:  { chest: [34.7, 34.3], waist: [26.4, 28.0], hip: [36.8, 37.4], neck: [14, 14.5] },
    M:  { chest: [37.0, 37.4], waist: [28.7, 31.1], hip: [39.2, 40.6], neck: [15, 15.5] },
    L:  { chest: [40.2, 40.6], waist: [31.9, 34.3], hip: [42.3, 43.7], neck: [15, 16] },
    XL: { chest: [42.3, 43.7], waist: [35.0, 37.4], hip: [44.5, 46.9], neck: [16, 17] },
  }
};

const brandsForLessSizeChart = {
  men: {
    XS: { chest: [32.7, 34.3], waist: [28.0, 29.5], hip: [32.7, 34.3], neck: [13, 13.5] },
    S:  { chest: [34.0, 36.4], waist: [30.3, 32.7], hip: [35.0, 37.4], neck: [14, 14.5] },
    M:  { chest: [38.2, 40.6], waist: [33.5, 35.8], hip: [38.2, 40.6], neck: [15, 15.5] },
    L:  { chest: [42.3, 44.7], waist: [36.6, 39.0], hip: [41.3, 43.7], neck: [16, 16.5] },
    XL: { chest: [50.5, 52.9], waist: [39.8, 42.1], hip: [44.5, 46.9], neck: [17, 18] },
  },
  women: {
    XS: { chest: [30.3, 31.9], waist: [24.0, 25.6], hip: [33.5, 35.0], neck: [13, 14] },
    S:  { chest: [32.7, 34.3], waist: [26.4, 28.0], hip: [35.8, 37.4], neck: [14, 14.5] },
    M:  { chest: [35.0, 37.4], waist: [28.7, 31.1], hip: [38.2, 40.6], neck: [15, 15.5] },
    L:  { chest: [38.2, 40.6], waist: [31.9, 34.3], hip: [41.3, 43.7], neck: [15, 16] },
    XL: { chest: [41.3, 43.7], waist: [35.0, 37.4], hip: [44.5, 46.9], neck: [16, 17] },
  }
};

// Centrepoint men's tops — body measurements from the CM-M size guide screenshot.
// Shoulder column omitted (predictor doesn't use it). Hip not provided — falls back to global.
const centrepointMenTopsSizeChart = buildRangesFromAnchors(
  [
    { size: 'XS',  chest: 86.4,  waist: 69.8,  neck: 34.6 },
    { size: 'S',   chest: 91.4,  waist: 74.9,  neck: 36.5 },
    { size: 'M',   chest: 101.6, waist: 85.1,  neck: 39.0 },
    { size: 'L',   chest: 111.8, waist: 95.9,  neck: 41.6 },
    { size: 'XL',  chest: 121.9, waist: 108.6, neck: 44.1 },
    { size: '2XL', chest: 132.1, waist: 121.3, neck: 46.3 },
  ],
  ['chest', 'waist', 'neck']
);

const centrepointWomenTopsSizeChart = buildRangesFromAnchors(
  [
    { size: 'XS',  chest: 86.4,  waist: 69.8,  neck: 34.6 },
    { size: 'S',   chest: 91.4,  waist: 74.9,  neck: 36.5 },
    { size: 'M',   chest: 101.6, waist: 85.1,  neck: 39.0 },
    { size: 'L',   chest: 111.8, waist: 95.9,  neck: 41.6 },
    { size: 'XL',  chest: 121.9, waist: 108.6, neck: 44.1 },
    { size: '2XL', chest: 132.1, waist: 121.3, neck: 46.3 },
  ],
  ['chest', 'waist', 'neck']
);

const centrepointSizeChart = {
  men:   centrepointMenTopsSizeChart,
  women: centrepointWomenTopsSizeChart,
};

const brandChartMap = {
  'pullandbear.com':      pullBearSizeChart,
  'pull&bear.com':        pullBearSizeChart,
  'splashfashions.com':   splashSizeChart,
  'splash.com':           splashSizeChart,
  'centrepoint.com':       centrepointSizeChart,
  'centrepointarabia.com': centrepointSizeChart,
  'centrepointstores.com': centrepointSizeChart,
  'bershka.com':          bershkaSizeChart,
  'brandsforless.com':    brandsForLessSizeChart,
  'brands4less.com':      brandsForLessSizeChart,
};

function resolveProductCategory(productTitle) {
  const t = String(productTitle || '').toLowerCase();
  if (/\b(trouser|trousers|pant|pants|jean|jeans|short|shorts|legging|leggings|skirt|bottom|bottoms)\b/.test(t)) {
    return 'trousers';
  }
  return 'tops';
}

function resolveHmChart(gender, productTitle) {
  const genderKey = gender.toLowerCase() === 'female' ? 'women' : 'men';
  const category = resolveProductCategory(productTitle);
  const categoryCharts = hmSizeCharts[category] || hmSizeCharts.tops;
  return {
    chart: { men: categoryCharts.men, women: categoryCharts.women },
    chartUsed: `hm.com ${genderKey} ${category}`,
  };
}

function resolvePullBearChart(gender, productTitle) {
  const genderKey = gender.toLowerCase() === 'female' ? 'women' : 'men';
  const category = resolveProductCategory(productTitle);
  const categoryCharts = pullBearSizeCharts[category];
  if (!categoryCharts) {
    return { chart: pullBearSizeChart, chartUsed: 'pullandbear.com legacy' };
  }
  return {
    chart: { men: categoryCharts.men, women: categoryCharts.women },
    chartUsed: `pullandbear.com ${genderKey} ${category}`,
  };
}

function resolveChartSignal(website, gender, productTitle) {
  let selectedChart = globalSizeChart;
  let chartUsed = 'global';

  if (website) {
    let domain = website.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    if (domain.includes('hm.com')) {
      const s = resolveHmChart(gender || 'male', productTitle || '');
      return { chartStatus: 'fallback', chart: s.chart, chartUsed: s.chartUsed };
    }
    if (domain.includes('pullandbear.com') || domain.includes('pull&bear.com')) {
      const s = resolvePullBearChart(gender || 'male', productTitle || '');
      return { chartStatus: 'fallback', chart: s.chart, chartUsed: s.chartUsed };
    }
    for (const [brandDomain, chart] of Object.entries(brandChartMap)) {
      if (domain.includes(brandDomain)) {
        selectedChart = chart;
        chartUsed = brandDomain;
        break;
      }
    }
  }

  return { chartStatus: 'fallback', chart: selectedChart, chartUsed };
}

function resolveReviewSignal(pageReviews) {
  if (!Array.isArray(pageReviews) || pageReviews.length === 0) {
    return { reviewStatus: 'unavailable', reviewNote: 'No reviews available' };
  }
  return { reviewStatus: 'present', reviewNote: null };
}

module.exports = {
  resolveChartSignal,
  resolveReviewSignal,
  resolveProductCategory,
  globalSizeChart,
};
