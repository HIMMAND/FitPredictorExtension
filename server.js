const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// CORS Middleware
app.use(cors());

// Logger Middleware: Logs each request with timestamp, method, and URL
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ------------------------------------------------------------------
   1) Define All the Size Charts
------------------------------------------------------------------ */

// Global size chart
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

// Pull & Bear
const pullBearSizeChart = {
  men: {
    XS: { chest: [33.9, 33.3], waist: [29.0, 30], hip: [32.7, 34.3],neck: [15.2, 15.8]},
    S:  { chest: [36.7, 37], waist: [30.3, 33.7], hip: [35.0, 37.4],neck: [16, 16.5]},
    M:  { chest: [39.2, 40.6], waist: [34.5, 37.8], hip: [38.2, 40.6],neck: [16.8, 17]},
    L:  { chest: [42.3, 43.7], waist: [38.6, 41.0], hip: [41.3, 43.7],neck: [17.4, 17.9]},
    XL: { chest: [44.5, 49], waist: [42.8, 45.1], hip: [45.5, 48.9],neck: [18, 18.7] },
    XXL: { chest: [50, 52.9], waist: [45.8, 49.1], hip: [49.5,54.9],neck: [19, 19.5] },
  },
  women: {
    XS: { chest: [31.2, 32.9], waist: [24.0, 25.6], hip: [33.5, 35.0],neck: [13, 13.5] },
    S:  { chest: [33.7, 35.3], waist: [27.4, 31.0], hip: [35.8, 37.4],neck: [14, 14.7] },
    M:  { chest: [36.0, 37.4], waist: [29.7, 37.1], hip: [38.2, 40.6],neck: [15, 15.5] },
    L:  { chest: [38.2, 43.6], waist: [31.9, 41.3], hip: [44.3, 46.7],neck: [15, 16] },
    XL: { chest: [41.3, 48.7], waist: [43.0, 47.4], hip: [47.5, 53.9],neck: [16, 17] },
  }
};

// H&M
const hmSizeChart = {
  men: {
    XS: { chest: [30.7, 33.3], waist: [29.0, 30], hip: [32.7, 34.3],neck: [13, 13.8]},
    S:  { chest: [33.0, 37], waist: [30.3, 33.7], hip: [35.0, 37.4],neck: [14, 14.5]},
    M:  { chest: [37.2, 40], waist: [34.5, 37.8], hip: [38.2, 40.6],neck: [15, 15.5]},
    L:  { chest: [41, 43.7], waist: [38.6, 41.0], hip: [41, 43.7],neck: [16, 16.8]},
    XL: { chest: [45.5, 49], waist: [42.8, 45.1], hip: [45.5, 48.9],neck: [17, 17.7] },
    XXL: { chest: [50, 52.9], waist: [45.8, 49.1], hip: [49.5,54.9],neck: [18, 18.5] },
  },
  women: {
    XS: { chest: [29, 30.9], waist: [24.0, 25.6], hip: [33.5, 35.0],neck: [13, 13.5] },
    S:  { chest: [33.7, 35.3], waist: [27.4, 31.0], hip: [35.8, 37.4],neck: [14, 14.7] },
    M:  { chest: [36.0, 37.4], waist: [32.7, 37.1], hip: [38.2, 40.6],neck: [15, 15.5] },
    L:  { chest: [39.2, 43.6], waist: [39.9, 41.3], hip: [44.3, 46.7],neck: [15, 16] },
    XL: { chest: [45.3, 48.7], waist: [43.0, 47.4], hip: [47.5, 53.9],neck: [16, 17] },
  }
};

// Splash
const splashSizeChart = {
  men: {
    XS: { chest: [34.7, 34.3], waist: [28.0, 29.5], hip: [32.7, 34.3],neck: [13, 13.5]},
    S:  { chest: [36.0, 36.4], waist: [30.3, 32.7], hip: [35.0, 37.4],neck: [14, 14.5]},
    M:  { chest: [39.2, 40.6], waist: [33.5, 35.8], hip: [38.2, 40.6],neck: [15, 15.5]},
    L:  { chest: [43.3, 44.7], waist: [36.6, 39.0], hip: [41.3, 43.7],neck: [16, 16.5]},
    XL: { chest: [48.5, 48.9], waist: [39.8, 42.1], hip: [44.5, 46.9],neck: [16, 17] },
    XXL: { chest: [52.5, 52.9], waist: [43.8, 49.1], hip: [45.5, 52],neck: [17, 18] },
  },
  women: {
    XS: { chest: [30.3, 31.9], waist: [24.0, 25.6], hip: [33.5, 35.0],neck: [13, 14] },
    S:  { chest: [32.7, 34.3], waist: [26.4, 28.0], hip: [35.8, 37.4],neck: [14, 14.5] },
    M:  { chest: [35.0, 36.9], waist: [28.7, 31.1], hip: [38.2, 40.6],neck: [15, 15.5] },
    L:  { chest: [38.2, 40.6], waist: [31.9, 34.3], hip: [41.3, 43.7],neck: [15, 16] },
    XL: { chest: [42.3, 43.7], waist: [35.0, 37.4], hip: [44.5, 46.9],neck: [16, 17] },
  }
};

// Bershka
const bershkaSizeChart = {
  men: {
    XS: { chest: [34.3, 35.3], waist: [29.0, 30.5], hip: [34.7, 36.3],neck: [13, 13.5]},
    S:  { chest: [36.0, 37.4], waist: [31.3, 33.7], hip: [36.0, 37.4],neck: [14, 14.5]},
    M:  { chest: [39.2, 41.6], waist: [33.5, 35.8], hip: [39.2, 40.6],neck: [15, 15.5]},
    L:  { chest: [41.3, 44.7], waist: [36.6, 39.0], hip: [42.3, 43.7],neck: [16, 16.5]},
    XL: { chest: [44.5, 48.9], waist: [39.8, 42.1], hip: [45.5, 46.9],neck: [16, 17] },
    XL: { chest: [50.5, 52.9], waist: [39.8, 42.1], hip: [44.5, 46.9],neck: [17, 18] },
  },
  women: {
    XS: { chest: [31.3, 31.9], waist: [23.0, 25.6], hip: [34.5, 35.0],neck: [13, 14] },
    S:  { chest: [34.7, 34.3], waist: [26.4, 28.0], hip: [36.8, 37.4],neck: [14, 14.5] },
    M:  { chest: [37.0, 37.4], waist: [28.7, 31.1], hip: [39.2, 40.6],neck: [15, 15.5] },
    L:  { chest: [40.2, 40.6], waist: [31.9, 34.3], hip: [42.3, 43.7],neck: [15, 16] },
    XL: { chest: [42.3, 43.7], waist: [35.0, 37.4], hip: [44.5, 46.9],neck: [16, 17] },
  }
};

// Brands For Less
const brandsForLessSizeChartInches = {
  men: {
    XS: { chest: [32.7, 34.3], waist: [28.0, 29.5], hip: [32.7, 34.3],neck: [13, 13.5]},
    S:  { chest: [34.0, 36.4], waist: [30.3, 32.7], hip: [35.0, 37.4],neck: [14, 14.5]},
    M:  { chest: [38.2, 40.6], waist: [33.5, 35.8], hip: [38.2, 40.6],neck: [15, 15.5]},
    L:  { chest: [42.3, 44.7], waist: [36.6, 39.0], hip: [41.3, 43.7],neck: [16, 16.5]},
    XL: { chest: [46.5, 48.9], waist: [39.8, 42.1], hip: [44.5, 46.9],neck: [16, 17] },
    XL: { chest: [50.5, 52.9], waist: [39.8, 42.1], hip: [44.5, 46.9],neck: [17, 18] },
  },
  women: {
    XS: { chest: [30.3, 31.9], waist: [24.0, 25.6], hip: [33.5, 35.0],neck: [13, 14] },
    S:  { chest: [32.7, 34.3], waist: [26.4, 28.0], hip: [35.8, 37.4],neck: [14, 14.5] },
    M:  { chest: [35.0, 37.4], waist: [28.7, 31.1], hip: [38.2, 40.6],neck: [15, 15.5] },
    L:  { chest: [38.2, 40.6], waist: [31.9, 34.3], hip: [41.3, 43.7],neck: [15, 16] },
    XL: { chest: [41.3, 43.7], waist: [35.0, 37.4], hip: [44.5, 46.9],neck: [16, 17] },
  }
};


/* ------------------------------------------------------------------
   2) Map each domain to its brand-specific chart
------------------------------------------------------------------ */
const brandChartMap = {
  'pullandbear.com': pullBearSizeChart,
  'pull&bear.com': pullBearSizeChart,
  'hm.com': hmSizeChart,
  'splashfashions.com': splashSizeChart, // <--- For "splashfashions.com"
  'splash.com': splashSizeChart,
  'bershka.com': bershkaSizeChart,
  'brandsforless.com': brandsForLessSizeChartInches,
  'brands4less.com': brandsForLessSizeChartInches
};

/* ------------------------------------------------------------------
   3) Input Validation Middleware
------------------------------------------------------------------ */
function validateInput(req, res, next) {
  const { age, height, weight, gender } = req.body;

  // Validate required fields
  if (!age || !height || !weight || !gender) {
    return res.status(400).json({
      message: 'Missing required fields',
      error: 'Age, height, weight, and gender are required'
    });
  }

  // Validate age (must be a number between 1 and 120)
  const ageNum = Number(age);
  if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
    return res.status(400).json({
      message: 'Invalid age',
      error: 'Age must be a number between 1 and 120'
    });
  }

  // Validate height (must be a number, 50–250 cm)
  const heightNum = Number(height);
  if (isNaN(heightNum) || heightNum < 50 || heightNum > 250) {
    return res.status(400).json({
      message: 'Invalid height',
      error: 'Height must be a number between 50 and 250 cm'
    });
  }

  // Validate weight (must be a number, 20–300 kg)
  const weightNum = Number(weight);
  if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
    return res.status(400).json({
      message: 'Invalid weight',
      error: 'Weight must be a number between 20 and 300 kg'
    });
  }

  // Validate gender (male/female)
  const normalizedGender = gender.toLowerCase();
  if (normalizedGender !== 'male' && normalizedGender !== 'female') {
    return res.status(400).json({
      message: 'Invalid gender',
      error: 'Gender must be either "male" or "female"'
    });
  }

  next();
}

/* ------------------------------------------------------------------
   4) The recommendSize function
------------------------------------------------------------------ */
function recommendSize(predictions, gender, selectedChart) {
  // men or women
  const genderKey = gender.toLowerCase() === 'male' ? 'men' : 'women';
  const chartForGender = selectedChart[genderKey];

  if (!chartForGender) {
    return 'Size chart not available for given gender';
  }

  let bestSize = null;
  let bestError = Infinity;

  // Loop over each size (XS, S, M, L, etc.)
  for (const [size, ranges] of Object.entries(chartForGender)) {
    let error = 0;

    // Compare each measurement in the chart with the predicted value
    for (const [measurement, range] of Object.entries(ranges)) {
      // e.g. 'chest_prediction'
      const predictionKey = `${measurement}_prediction`;
      if (predictions[predictionKey] === undefined) continue;

      // The "center" if range is an array; else use range as is
      const center = Array.isArray(range) ? (range[0] + range[1]) / 2 : range;
      error += Math.abs(predictions[predictionKey] - center);
    }

    // Pick the size with the smallest total error
    if (error < bestError) {
      bestError = error;
      bestSize = size;
    }
  }

  return bestSize;
}

/* ------------------------------------------------------------------
   5) Serve static files (optional)
------------------------------------------------------------------ */
app.use(express.static(path.join(__dirname, '../static')));

/* ------------------------------------------------------------------
   6) The POST endpoint: /api/recommendation
------------------------------------------------------------------ */
app.post('/api/recommendation', validateInput, (req, res) => {
  const { age, height, weight, gender, bodyType, website } = req.body;

  console.log('Received inputs:', { age, height, weight, gender, bodyType, website });

  // Default to global size chart unless domain indicates a brand
  let selectedChart = globalSizeChart;

  // If a website URL is provided, parse the domain
  if (website) {
    let domain = website.toLowerCase();
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];

    console.log("Extracted domain:", domain);

    // Check brand map
    for (const [brandDomain, chart] of Object.entries(brandChartMap)) {
      // Using includes() or strict equality:
      if (domain.includes(brandDomain)) {
        selectedChart = chart;
        console.log(`Using size chart for: ${brandDomain}`);
        break;
      }
    }
  }

  // Determine brand name for logs
  let chartUsed;
  if (selectedChart === globalSizeChart) chartUsed = 'global';
  else if (selectedChart === pullBearSizeChart) chartUsed = 'Pull & Bear';
  else if (selectedChart === hmSizeChart) chartUsed = 'H&M';
  else if (selectedChart === splashSizeChart) chartUsed = 'Splash';
  else if (selectedChart === bershkaSizeChart) chartUsed = 'Bershka';
  else if (selectedChart === brandsForLessSizeChartInches) chartUsed = 'Brands For Less';
  else chartUsed = 'unknown';

  // Show brand + men/women
  const genderKey = gender.toLowerCase() === 'male' ? 'men' : 'women';
  console.log(`Selected size chart: ${chartUsed}, using ${genderKey} sizing`);

  // Call predict.py
  const pythonScriptPath = path.join(__dirname, 'predict.py');
  const args = [
    String(age),    // e.g. "25"
    String(height), // e.g. "175"
    String(weight), // e.g. "70"
    String(gender),
    String(bodyType || '')
  ];

  // Check if predict.py exists
  if (!fs.existsSync(pythonScriptPath)) {
    return res.status(500).json({
      message: 'Prediction model not found',
      error: 'Missing predict.py script'
    });
  }

  execFile('python', [pythonScriptPath, ...args], (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(500).json({
        message: 'Error executing prediction model',
        error: error.message
      });
    }

    if (stderr) {
      console.error(`Python script stderr: ${stderr}`);
    }

    console.log('Python script raw output:\n', stdout);

    try {
      // Parse the JSON output from Python
      const predictions = JSON.parse(stdout.trim());

      // Validate the prediction output
      if (!predictions || typeof predictions !== 'object') {
        throw new Error('Invalid prediction output format');
      }

      // Check for required fields
      const requiredFields = ['chest_prediction', 'waist_prediction'];
      const missingFields = requiredFields.filter(field => predictions[field] === undefined);

      if (missingFields.length > 0) {
        throw new Error(`Missing required prediction fields: ${missingFields.join(', ')}`);
      }

      // Determine best final size
      const finalSize = recommendSize(predictions, gender, selectedChart);

      console.log('Recommended final size:', finalSize);

      // Send JSON response to client
      res.json({
        message: 'Prediction successful',
        predictions,
        finalSize,
        chartUsed
      });
    } catch (parseError) {
      console.error(`Error parsing Python output: ${parseError}`);
      res.status(500).json({
        message: 'Error parsing prediction output',
        error: parseError.message
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
