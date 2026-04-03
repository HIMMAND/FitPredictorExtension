document.addEventListener("DOMContentLoaded", () => {
  const productImage = document.getElementById("product-image");
  const productTitle = document.getElementById("product-title");
  const pageStatus = document.getElementById("page-status");
  const imageStatus = document.getElementById("image-status");
  const form = document.getElementById("profile-form");
  const recommendButton = document.getElementById("recommend-button");
  const stepResult = document.getElementById("step-result");
  const sizeRecommendation = document.getElementById("size-recommendation");
  const resultSummary = document.getElementById("result-summary");
  const chartStatus = document.getElementById("chart-status");
  const reviewStatus = document.getElementById("review-status");
  const reviewNote = document.getElementById("review-note");
  const websiteInput = document.getElementById("website");
  const genderInput = document.getElementById("gender");
  const bodyTypeInput = document.getElementById("body-type");
  const bodyTypeOptions = {
    male: [
      { value: "rectangle", label: "Rectangle" },
      { value: "inverted triangle", label: "Inverted Triangle" },
      { value: "trapezoid", label: "Trapezoid" },
      { value: "triangle", label: "Triangle" },
      { value: "oval", label: "Oval" },
    ],
    female: [
      { value: "rectangle", label: "Rectangle" },
      { value: "hourglass", label: "Hourglass" },
      { value: "inverted triangle", label: "Inverted Triangle" },
      { value: "pear (triangle)", label: "Pear (Triangle)" },
      { value: "apple", label: "Apple" },
    ],
  };

  let activeTabUrl = "";
  syncBodyTypeOptions();

  initializePanel().catch((error) => {
    console.error("Failed to initialize panel", error);
    pageStatus.textContent = "Unable to read the active page context.";
    imageStatus.textContent = "Image scan unavailable";
  });

  genderInput.addEventListener("change", () => {
    syncBodyTypeOptions();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!bodyTypeInput.value) {
      bodyTypeInput.focus();
      return;
    }

    recommendButton.disabled = true;
    recommendButton.textContent = "Preparing recommendation...";

    const payload = {
      age: Number(document.getElementById("age").value),
      height: Number(document.getElementById("height").value),
      weight: Number(document.getElementById("weight").value),
      gender: document.getElementById("gender").value,
      bodyType: bodyTypeInput.value,
      website: activeTabUrl,
      pageChart: null,
      pageReviews: [],
    };

    try {
      const response = await fetch("http://localhost:3000/api/recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Recommendation request failed with ${response.status}`);
      }

      const data = await response.json();
      renderResult(data);
    } catch (error) {
      console.error("Recommendation error", error);
      stepResult.hidden = false;
      sizeRecommendation.textContent = "-";
      resultSummary.textContent = "We could not generate a recommendation yet.";
      chartStatus.textContent = "Unavailable";
      reviewStatus.textContent = "Unavailable";
      reviewNote.textContent = "There was an error contacting the recommendation service.";
    } finally {
      recommendButton.disabled = false;
      recommendButton.textContent = "Get Recommendation";
    }
  });

  async function initializePanel() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTabUrl = tab?.url || "";
    websiteInput.value = activeTabUrl;

    if (activeTabUrl) {
      pageStatus.textContent = `Connected to ${new URL(activeTabUrl).hostname}`;
    } else {
      pageStatus.textContent = "No active product page detected.";
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageContext,
    });

    if (result?.title) {
      productTitle.textContent = result.title;
    }

    if (result?.bestImage) {
      productImage.src = result.bestImage;
      imageStatus.textContent = "Product image found on the page";
    } else {
      productImage.alt = "No product image found";
      imageStatus.textContent = "No large product image found";
    }
  }

  function renderResult(data) {
    stepResult.hidden = false;
    sizeRecommendation.textContent = data.finalSize || "-";
    resultSummary.textContent = data.message || "Prediction successful";
    chartStatus.textContent = `${data.chartStatus || "unknown"}${data.chartUsed ? ` (${data.chartUsed})` : ""}`;
    reviewStatus.textContent = data.reviewStatus || "unavailable";
    reviewNote.textContent = data.reviewNote || "No reviews available";
  }

  function syncBodyTypeOptions() {
    const gender = genderInput.value;
    const options = bodyTypeOptions[gender] || [];
    bodyTypeInput.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select body type";
    bodyTypeInput.appendChild(placeholder);

    for (const option of options) {
      const element = document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      bodyTypeInput.appendChild(element);
    }
  }
});

function extractPageContext() {
  const candidates = Array.from(document.querySelectorAll("img"))
    .map((img) => ({
      src: img.currentSrc || img.src,
      area: img.naturalWidth * img.naturalHeight,
    }))
    .filter((img) => img.src && img.area > 10000)
    .sort((left, right) => right.area - left.area);

  return {
    title: document.title,
    bestImage: candidates[0]?.src || null,
  };
}
