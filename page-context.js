(function (root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.FitPredictorPageContext = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const runtimeRoot =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof self !== "undefined"
        ? self
        : typeof window !== "undefined"
          ? window
          : {};

  const BODY_TYPE_OPTIONS = {
    male: [
      {
        value: "rectangle",
        label: "Rectangle",
        description: "Straight balanced torso",
        imageKey: "male-rectangle",
      },
      {
        value: "inverted triangle",
        label: "Inverted Triangle",
        description: "Broad upper body taper",
        imageKey: "male-inverted-triangle",
      },
      {
        value: "trapezoid",
        label: "Trapezoid",
        description: "Balanced athletic taper",
        imageKey: "male-trapezoid",
      },
      {
        value: "triangle",
        label: "Triangle",
        description: "Wider through waist and hips",
        imageKey: "male-triangle",
      },
      {
        value: "oval",
        label: "Oval",
        description: "Fuller through the midsection",
        imageKey: "male-oval",
      },
    ],
    female: [
      {
        value: "rectangle",
        variant: "default",
        label: "Rectangle",
        description: "Balanced straight silhouette",
        imageKey: "female-rectangle",
      },
      {
        value: "rectangle",
        variant: "runway",
        label: "Runway",
        description: "Long lean editorial silhouette",
        imageKey: "female-runway",
        imageScale: 2.4,
      },
      {
        value: "hourglass",
        variant: "default",
        label: "Hourglass",
        description: "Balanced bust and hips",
        imageKey: "female-hourglass",
      },
      {
        value: "inverted triangle",
        variant: "default",
        label: "Inverted Triangle",
        description: "Broader shoulders than hips",
        imageKey: "female-inverted-triangle",
      },
      {
        value: "pear (triangle)",
        variant: "default",
        label: "Pear (Triangle)",
        description: "Hips wider than shoulders",
        imageKey: "female-pear-triangle",
      },
      {
        value: "apple",
        variant: "default",
        label: "Apple",
        description: "Fuller through the midsection",
        imageKey: "female-apple",
      },
    ],
  };

  function normalizeWhitespace(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function slugify(value) {
    return normalizeWhitespace(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function getBodyTypeOptions(gender) {
    return (BODY_TYPE_OPTIONS[gender] || []).map((option) => ({
      ...option,
      variant: option.variant || "default",
      imageScale: Number(option.imageScale) > 0 ? Number(option.imageScale) : 1,
      assetPath: `assets/body-types/${option.imageKey}.png`,
      assetAlt: `${option.label} 3D body type model`,
      assetSlug: slugify(option.imageKey),
    }));
  }

  function readString(value) {
    return typeof value === "string" ? value : "";
  }

  function getClassText(value) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value.baseVal === "string") {
      return value.baseVal;
    }

    return "";
  }

  function collectImageSignals(img) {
    return normalizeWhitespace(
      [
        readString(img?.currentSrc),
        readString(img?.src),
        readString(img?.alt),
        readString(img?.getAttribute?.("aria-label")),
        readString(img?.id),
        getClassText(img?.className),
      ].join(" ")
    ).toLowerCase();
  }

  function collectContainerSignals(img) {
    const selectors = [
      "[data-testid*='product']",
      "[data-testid*='gallery']",
      "[data-testid*='media']",
      "[class*='product']",
      "[class*='gallery']",
      "[class*='media']",
      "[class*='pdp']",
      "[class*='detail']",
      "[class*='lookbook']",
      "main",
    ];

    const matchedSignals = selectors
      .map((selector) => img?.closest?.(selector))
      .filter(Boolean)
      .map((element) =>
        normalizeWhitespace(
          [
            readString(element?.getAttribute?.("data-testid")),
            readString(element?.id),
            getClassText(element?.className),
            readString(element?.getAttribute?.("aria-label")),
          ].join(" ")
        ).toLowerCase()
      );

    return matchedSignals.join(" ");
  }

  function scoreImageCandidate(img) {
    const width = img?.naturalWidth || img?.width || 0;
    const height = img?.naturalHeight || img?.height || 0;
    const area = width * height;
    const ratio = width > 0 ? height / width : 0;
    const imageSignals = collectImageSignals(img);
    const containerSignals = collectContainerSignals(img);
    let score = area / 10000;

    if (/logo|brandmark|wordmark|icon|sprite|favicon/.test(imageSignals)) {
      score -= 500;
    }

    if (/product|gallery|media|look|detail|editorial|pdp/.test(containerSignals)) {
      score += 140;
    }

    if (/thumbnail|thumb|swatch|mini/.test(imageSignals + " " + containerSignals)) {
      score -= 60;
    }

    if (ratio >= 1.15) {
      score += 45;
    } else if (ratio >= 0.85) {
      score += 12;
    } else if (ratio <= 0.45) {
      score -= 40;
    }

    if (/product|dress|shirt|top|blouse|jacket|jeans|trouser|hoodie|sweater|coat/.test(imageSignals)) {
      score += 24;
    }

    return { src: img?.currentSrc || img?.src || null, area, score };
  }

  function getVisibleProductImage(document) {
    return Array.from(document.querySelectorAll("img"))
      .map((img) => scoreImageCandidate(img))
      .filter((img) => img.src && img.area > 10000)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return right.area - left.area;
      })[0]?.src || null;
  }

  function isReasonableProductTitle(value) {
    const text = normalizeWhitespace(value);

    if (!text || text.length > 140) {
      return false;
    }

    if (text.split(" ").length > 18) {
      return false;
    }

    if (
      /click.?collect|membership|how it works|redeem rewards|delivery options|corporate info|help|size guide|how to measure/i.test(
        text
      )
    ) {
      return false;
    }

    return true;
  }

  function extractProductTitleFromDocument(document) {
    const selectorCandidates = [
      "h1",
      "[data-testid*='product-title']",
      "[class*='product-title']",
      "[class*='product-name']",
      "[property='og:title']",
      "meta[property='og:title']",
    ];

    for (const selector of selectorCandidates) {
      const element = document.querySelector?.(selector);

      if (!element) {
        continue;
      }

      const candidate =
        selector.startsWith("meta") || selector === "[property='og:title']"
          ? element.getAttribute?.("content")
          : element.textContent;

      if (isReasonableProductTitle(candidate)) {
        return normalizeWhitespace(candidate);
      }
    }

    const titleParts = normalizeWhitespace(document.title)
      .split("|")
      .map((part) => normalizeWhitespace(part))
      .filter(Boolean);

    for (const part of titleParts) {
      if (isReasonableProductTitle(part)) {
        return part;
      }
    }

    return "Current product page";
  }

  function delay(milliseconds) {
    return new Promise((resolve) => runtimeRoot.setTimeout(resolve, milliseconds));
  }

  function hasProductSignals(document) {
    const title = normalizeWhitespace(document.title);
    const bodyText = normalizeWhitespace(document.body?.innerText || "");

    if (
      /page not found|metadata/i.test(title) ||
      /page not found|sorry, we couldn't find the page/i.test(bodyText)
    ) {
      return false;
    }

    return document.querySelectorAll("img").length > 0 || /select size|add to basket|add to cart/i.test(bodyText);
  }

  async function waitForHydratedProductDocument(document) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      if (hasProductSignals(document)) {
        return;
      }

      await delay(500);
    }
  }

  async function extractPageContextFromDocument(document) {
    await waitForHydratedProductDocument(document);

    return {
      title: extractProductTitleFromDocument(document),
      bestImage: getVisibleProductImage(document),
      pageChart: null,
      pageChartMeta: { source: "disabled", label: null },
      pageReviews: [],
    };
  }

  function registerRuntimeListener() {
    if (
      typeof chrome === "undefined" ||
      !chrome.runtime ||
      !chrome.runtime.onMessage ||
      runtimeRoot.__FIT_PREDICTOR_CONTEXT_LISTENER__
    ) {
      return;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || message.type !== "fitpredictor:extract-page-context") {
        return false;
      }

      extractPageContextFromDocument(document)
        .then((context) => sendResponse({ ok: true, context }))
        .catch((error) =>
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          })
        );

      return true;
    });

    runtimeRoot.__FIT_PREDICTOR_CONTEXT_LISTENER__ = true;
  }

  if (typeof document !== "undefined") {
    registerRuntimeListener();
  }

  return {
    extractPageContextFromDocument,
    extractProductTitleFromDocument,
    getBodyTypeOptions,
    slugify,
  };
});
