const test = require("node:test");
const assert = require("node:assert/strict");

const {
  extractPageContextFromDocument,
  extractProductTitleFromDocument,
  getBodyTypeOptions,
} = require("../page-context");

test("extractPageContextFromDocument keeps title and image but disables live chart extraction", async () => {
  const fakeImage = {
    currentSrc: "https://cdn.example.com/product.jpg",
    naturalWidth: 600,
    naturalHeight: 900,
  };

  const fakeDocument = {
    title: "Loose Fit Printed Polo Shirt | H&M UAE",
    body: {
      innerText:
        "Loose Fit Printed Polo Shirt SELECT SIZE SIZE GUIDE Chest cm 78-86 Waist cm 66-74",
    },
    querySelector(selector) {
      if (selector === "h1") {
        return { textContent: "Loose Fit Printed Polo Shirt" };
      }

      return null;
    },
    querySelectorAll(selector) {
      if (selector === "img") {
        return [fakeImage];
      }

      if (selector === "table") {
        return [
          {
            textContent: "Size chart table should be ignored",
          },
        ];
      }

      return [];
    },
  };

  const result = await extractPageContextFromDocument(fakeDocument);

  assert.equal(result.title, "Loose Fit Printed Polo Shirt");
  assert.equal(result.bestImage, "https://cdn.example.com/product.jpg");
  assert.equal(result.pageChart, null);
  assert.deepEqual(result.pageChartMeta, { source: "disabled", label: null });
});

test("extractPageContextFromDocument prefers gallery imagery over logos and brand marks", async () => {
  const galleryImage = {
    currentSrc: "https://cdn.example.com/gallery-hero.jpg",
    naturalWidth: 1200,
    naturalHeight: 1600,
  };

  const brandMark = {
    currentSrc: "https://cdn.example.com/logo.png",
    naturalWidth: 120,
    naturalHeight: 80,
  };

  const fakeDocument = {
    title: "Short Smocked Denim Dress | Pull&Bear",
    body: {
      innerText: "Short smocked denim dress SELECT SIZE Add to basket",
    },
    querySelector(selector) {
      if (selector === "h1") {
        return { textContent: "Short Smocked Denim Dress" };
      }

      return null;
    },
    querySelectorAll(selector) {
      if (selector === "img") {
        return [brandMark, galleryImage];
      }

      return [];
    },
  };

  const result = await extractPageContextFromDocument(fakeDocument);

  assert.equal(result.title, "Short Smocked Denim Dress");
  assert.equal(result.bestImage, "https://cdn.example.com/gallery-hero.jpg");
});

test("extractPageContextFromDocument does not depend on an undefined root binding", async () => {
  const fakeDocument = {
    title: "Metadata | Store",
    body: { innerText: "Page not found" },
    querySelectorAll() {
      return [];
    },
  };

  const result = await extractPageContextFromDocument(fakeDocument);

  assert.equal(result.title, "Metadata");
  assert.equal(result.bestImage, null);
  assert.equal(result.pageChart, null);
  assert.deepEqual(result.pageChartMeta, { source: "disabled", label: null });
});

test("extractProductTitleFromDocument prefers stable product text over noisy page text", () => {
  const fakeDocument = {
    title:
      "Click & Collect Membership Info How it works Collection points Redeem Rewards SIZE GUIDE Product Details Delivery Options",
    querySelector(selector) {
      if (selector === "h1") {
        return { textContent: "Loose fit printed polo shirt" };
      }

      return null;
    },
  };

  assert.equal(
    extractProductTitleFromDocument(fakeDocument),
    "Loose fit printed polo shirt"
  );
});

test("female body type options expose Runway as a rectangle-backed alias", () => {
  const femaleOptions = getBodyTypeOptions("female");
  const runwayOption = femaleOptions.find((option) => option.label === "Runway");

  assert.ok(runwayOption, "Expected a female Runway option");
  assert.equal(runwayOption.value, "rectangle");
  assert.equal(runwayOption.variant, "runway");
  assert.equal(runwayOption.imageKey, "female-runway");
  assert.equal(runwayOption.imageScale, 2.4);
});

test("extractPageContextFromDocument prefers product-gallery imagery over larger logo assets", async () => {
  const logoImage = {
    currentSrc: "https://cdn.example.com/assets/pullandbear-logo.png",
    src: "https://cdn.example.com/assets/pullandbear-logo.png",
    alt: "Pull&Bear logo",
    naturalWidth: 900,
    naturalHeight: 900,
    className: "site-logo-mark",
    id: "brand-logo",
    getAttribute(name) {
      return name === "aria-label" ? "Pull&Bear logo" : null;
    },
    closest() {
      return null;
    },
  };

  const heroContainer = {
    className: "product-gallery main-media",
    id: "pdp-gallery",
    getAttribute(name) {
      return name === "data-testid" ? "product-gallery" : null;
    },
  };

  const heroImage = {
    currentSrc: "https://cdn.example.com/products/dress-hero.jpg",
    src: "https://cdn.example.com/products/dress-hero.jpg",
    alt: "Short smocked denim dress",
    naturalWidth: 900,
    naturalHeight: 1350,
    className: "product-image hero-image",
    id: "hero-image",
    getAttribute(name) {
      return name === "aria-label" ? "Product image" : null;
    },
    closest(selector) {
      if (
        selector === "[data-testid*='product']" ||
        selector === "[data-testid*='gallery']" ||
        selector === "[class*='product']" ||
        selector === "[class*='gallery']" ||
        selector === "[class*='media']" ||
        selector === "[class*='pdp']" ||
        selector === "[class*='detail']" ||
        selector === "main"
      ) {
        return heroContainer;
      }

      return null;
    },
  };

  const fakeDocument = {
    title: "Short smocked denim dress | Pull&Bear United Arab Emirates",
    body: {
      innerText: "Short smocked denim dress Select a size Add to my basket",
    },
    querySelector(selector) {
      if (selector === "h1") {
        return { textContent: "Short smocked denim dress" };
      }

      return null;
    },
    querySelectorAll(selector) {
      if (selector === "img") {
        return [logoImage, heroImage];
      }

      return [];
    },
  };

  const result = await extractPageContextFromDocument(fakeDocument);

  assert.equal(result.title, "Short smocked denim dress");
  assert.equal(result.bestImage, "https://cdn.example.com/products/dress-hero.jpg");
});
