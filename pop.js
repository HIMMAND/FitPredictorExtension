import { getRecommendation, warmup } from "./recommendation-engine.js";

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
    pageReviews: [],
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
      pageReviews: activePageContext.pageReviews || [],
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
      recommendationExplanation.textContent =
        errorState.reviewNote || errorState.summary;
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
    warmup(); // fire-and-forget: loads WASM + 4 ONNX models while the user fills the form

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
    const normalizedGender =
      nextGender === "female" || nextGender === "male" ? nextGender : "male";
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

    activeCarouselIndex =
      ((activeCarouselIndex % options.length) + options.length) % options.length;

    const option = options[activeCarouselIndex];
    const assetUrl =
      typeof chrome !== "undefined" && chrome.runtime?.getURL
        ? chrome.runtime.getURL(option.assetPath)
        : option.assetPath;
    const imageScale =
      Number.isFinite(Number(option.imageScale)) && Number(option.imageScale) > 0
        ? Number(option.imageScale)
        : 1;

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

    activeCarouselIndex =
      (activeCarouselIndex + direction + options.length) % options.length;
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
      "hm.com", "pullandbear.com", "pull&bear.com",
      "splashfashions.com", "splash.com", "centrepoint.com", "centrepointarabia.com",
      "bershka.com", "brandsforless.com", "brands4less.com",
    ];
    const domain = activeTabUrl
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
    const isSupported = SUPPORTED_DOMAINS.some((d) => domain.includes(d));
    chartDetectStatus.textContent = isSupported
      ? `Size chart ready for ${domain}`
      : "This site isn't directly supported — predictions will use a generic global size chart. Supported brands: H&M, Pull&Bear, Splash, Bershka, Brands For Less.";
  }

  async function requestPageContext(tabId) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        type: "fitpredictor:extract-page-context",
      });

      if (response?.ok && response.context) {
        return response.context;
      }
    } catch (error) {
      // Fall through to inject-and-retry for already-open pages or missing receivers.
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["page-context.js"],
    });

    const retryResponse = await chrome.tabs.sendMessage(tabId, {
      type: "fitpredictor:extract-page-context",
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
      pageReviews: [],
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
    resultSummary.textContent =
      data.message || "Your fallback size recommendation is ready.";
    renderMeasurementSummary(buildMeasurementRows(data));
    recommendationExplanation.textContent = buildRecommendationExplanation(data);
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
      reviewNote: `The recommendation request failed: ${errorMessage || "unknown error"}`,
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

    measurementSummary.innerHTML = rows
      .map(
        (row) => `
          <div class="measurement-row">
            <span>${row.label}</span>
            <span class="measurement-values">
              <span class="primary">${formatMeasurementValue(row.inches, "in")}</span>
              <span class="secondary">${formatMeasurementValue(row.cm, "cm")}</span>
            </span>
          </div>
        `
      )
      .join("");
  }

  function buildMeasurementRows(data) {
    const labels = [
      ["chest", "Chest"],
      ["waist", "Waist"],
      ["neck", "Neck"],
      ["hip", "Hip"],
    ];

    return labels
      .map(([key, label]) => {
        const pair = extractMeasurementPair(data, key);
        if (!pair) {
          return null;
        }

        return { key, label, ...pair };
      })
      .filter(Boolean);
  }

  function extractMeasurementPair(data, measurementKey) {
    const measurementContainers = [
      data?.measurements?.[measurementKey],
      data?.measurementSummary?.[measurementKey],
      data?.predictedMeasurements?.[measurementKey],
    ];

    for (const container of measurementContainers) {
      const normalized = normalizeMeasurementContainer(container);
      if (normalized) {
        return normalized;
      }
    }

    const predictionSource =
      data?.predictions && typeof data.predictions === "object" ? data.predictions : data || {};
    const rawValue =
      numberOrNull(predictionSource[`${measurementKey}_raw`]) ??
      numberOrNull(predictionSource[`${measurementKey}_prediction`]) ??
      numberOrNull(predictionSource[measurementKey]);

    if (rawValue == null) {
      return null;
    }

    return {
      inches: rawValue,
      cm: rawValue * 2.54,
    };
  }

  function normalizeMeasurementContainer(container) {
    if (container == null) {
      return null;
    }

    if (typeof container === "number" || typeof container === "string") {
      const inchesValue = numberOrNull(container);
      if (inchesValue == null) {
        return null;
      }

      return {
        inches: inchesValue,
        cm: inchesValue * 2.54,
      };
    }

    if (typeof container !== "object") {
      return null;
    }

    const inchesValue =
      numberOrNull(container.inches) ??
      numberOrNull(container.inch) ??
      numberOrNull(container.valueInches) ??
      numberOrNull(container.inchesValue) ??
      numberOrNull(container.value) ??
      numberOrNull(container.prediction) ??
      numberOrNull(container.raw);
    const cmValue =
      numberOrNull(container.cm) ??
      numberOrNull(container.centimeters) ??
      numberOrNull(container.centimetres) ??
      numberOrNull(container.valueCm) ??
      numberOrNull(container.cmValue) ??
      numberOrNull(container.predictionCm);

    if (inchesValue == null && cmValue == null) {
      return null;
    }

    const resolvedInches = inchesValue ?? cmValue / 2.54;
    const resolvedCm = cmValue ?? resolvedInches * 2.54;

    return {
      inches: resolvedInches,
      cm: resolvedCm,
    };
  }

  function buildRecommendationExplanation(data) {
    const backendExplanation =
      data?.explanation ||
      data?.recommendationExplanation ||
      data?.reason ||
      data?.explanationText ||
      data?.sizeReason;

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

    return `${text.slice(0, maxLength - 1).trim()}…`;
  }
});
