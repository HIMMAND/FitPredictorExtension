document.addEventListener('DOMContentLoaded', function () {
  // Elements for recommendation UI
  const productImage = document.getElementById('product-image');
  const imageLoading = document.getElementById('image-loading');
  const maleBtn = document.getElementById('male-btn');
  const femaleBtn = document.getElementById('female-btn');
  const maleBodyTypes = document.getElementById('male-body-types');
  const femaleBodyTypes = document.getElementById('female-body-types');
  const bodyTypeCards = document.querySelectorAll('.body-type-card');
  const recommendButton = document.getElementById('recommend-button');
  const recommendationResult = document.getElementById('recommendation-result');
  const sizeRecommendation = document.getElementById('size-recommendation');
  const recommendationText = document.getElementById('recommendation-text');
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const ageInput = document.getElementById('age');
  
  // Create a container for parsed images below the product image
  const productSection = document.querySelector('.product-section');
  const imagesContainer = document.createElement('div');
  imagesContainer.id = 'parsed-images-container';
  imagesContainer.style.maxHeight = '200px';
  imagesContainer.style.overflowY = 'auto';
  imagesContainer.style.marginTop = '15px';
  imagesContainer.style.display = 'grid';
  imagesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
  imagesContainer.style.gap = '8px';
  productSection.appendChild(imagesContainer);
  
  // Add a container specifically for high-resolution images at the top
  const highResContainer = document.createElement('div');
  highResContainer.id = 'high-res-images';
  highResContainer.style.display = 'grid';
  highResContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
  highResContainer.style.gap = '10px';
  highResContainer.style.marginBottom = '15px';
  highResContainer.style.padding = '8px';
  highResContainer.style.backgroundColor = '#f8f9fa';
  highResContainer.style.borderRadius = '5px';
  
  // Add a title for the high-res section
  const highResTitle = document.createElement('h4');
  highResTitle.textContent = 'Best product images found:';
  highResTitle.style.marginTop = '15px';
  highResTitle.style.marginBottom = '5px';
  highResTitle.style.gridColumn = '1 / span 2';
  highResContainer.appendChild(highResTitle);
  
  // Add the high-res container before the regular images container
  productSection.insertBefore(highResContainer, imagesContainer);
  
  // Add a title for the thumbnails section
  const thumbnailsTitle = document.createElement('h4');
  thumbnailsTitle.style.marginTop = '15px';
  thumbnailsTitle.style.marginBottom = '5px';
  productSection.insertBefore(thumbnailsTitle, imagesContainer);

  // State variables
  let selectedBodyType = null;
  let gender = 'male'; // Default gender
  let parsedImages = [];
  let websiteURL = ''; // We'll store the active tab's URL here

  // 1) Get the active tab's URL so we can pass it to the server if needed
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url) {
      websiteURL = tabs[0].url;
    }
  });

  // Parse images as soon as the extension is activated
  parseImagesFromActivePage();

  // --- Image Parsing Functions ---
  
  // Main function to parse images from the active webpage
  function parseImagesFromActivePage() {
    imageLoading.style.display = 'flex';
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: getAllImagesFromPage
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error('Error parsing images:', chrome.runtime.lastError);
            imageLoading.style.display = 'none';
            return;
          }
          
          if (results && results[0] && results[0].result) {
            parsedImages = results[0].result;
            displayParsedImages(parsedImages);
          }
          
          imageLoading.style.display = 'none';
        });
      }
    });
  }
  
  // This function will be injected into the active tab to get all images
  function getAllImagesFromPage() {
    // Get all image elements
    const imgElements = Array.from(document.querySelectorAll('img'));
    
    // Filter out tiny images (likely icons) and get details
    const images = imgElements
      .filter(img => {
        // Filter out very small images (icons, bullets, etc.)
        return img.naturalWidth > 50 && img.naturalHeight > 50;
      })
      .map(img => {
        // Calculate resolution (total pixels)
        const resolution = img.naturalWidth * img.naturalHeight;
        
        // Calculate aspect ratio
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        // Check if image is likely a product image based on various factors
        const isLikelyProduct = 
          // Text-based detection
          (img.alt && /product|item|clothing|apparel|wear|model/i.test(img.alt)) || 
          (img.src && /product|pdp|item|detail|zoom|large|full/i.test(img.src)) ||
          // Size-based detection (most product images are relatively square)
          (resolution > 40000 && aspectRatio > 0.5 && aspectRatio < 2.0) ||
          // Position-based detection (often in center sections)
          (img.getBoundingClientRect().top > 100 && 
           img.getBoundingClientRect().left > window.innerWidth * 0.2 &&
           img.getBoundingClientRect().right < window.innerWidth * 0.8);
        
        // Get important attributes
        return {
          src: img.src,
          alt: img.alt || '',
          width: img.naturalWidth,
          height: img.naturalHeight,
          resolution: resolution,
          aspectRatio: aspectRatio,
          isPotentialProduct: isLikelyProduct
        };
      })
      // Sort by product likelihood first, then by resolution
      .sort((a, b) => {
        if (a.isPotentialProduct !== b.isPotentialProduct) {
          return a.isPotentialProduct ? -1 : 1;
        }
        return b.resolution - a.resolution;
      });
    
    return images;
  }
  
  // Function to display the parsed images in the extension popup
  function displayParsedImages(images) {
    highResContainer.innerHTML = '';
    
    // Add title back to high-res container
    const highResTitle = document.createElement('h4');
    highResTitle.textContent = 'Best product images found:';
    highResTitle.style.marginTop = '0';
    highResTitle.style.marginBottom = '5px';
    highResTitle.style.gridColumn = '1 / span 2';
    highResContainer.appendChild(highResTitle);
    
    if (images.length === 0) {
      const noImages = document.createElement('p');
      noImages.textContent = 'No suitable images found on this page.';
      noImages.style.gridColumn = '1 / span 2';
      noImages.style.textAlign = 'center';
      highResContainer.appendChild(noImages);
      return;
    }
    
    // Get the top two likely product images with highest resolution
    const highResImages = images
      .filter(img => img.isPotentialProduct)
      .slice(0, 2);
    
    // If we don't have two product images, get the highest resolution ones regardless
    if (highResImages.length < 2) {
      const additionalHighResImages = images
        .filter(img => !highResImages.some(highRes => highRes.src === img.src))
        .slice(0, 2 - highResImages.length);
      
      highResImages.push(...additionalHighResImages);
    }
    
    // Display the high-resolution images
    highResImages.forEach((image, index) => {
      const imgWrapper = document.createElement('div');
      imgWrapper.style.position = 'relative';
      imgWrapper.style.border = '1px solid #ddd';
      imgWrapper.style.borderRadius = '4px';
      imgWrapper.style.padding = '5px';
      imgWrapper.style.backgroundColor = 'white';
      
      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt || 'Product image';
      img.style.width = '100%';
      img.style.height = '120px';
      img.style.objectFit = 'contain';
      img.style.cursor = 'pointer';
      
      // Add click handler to select this image
      img.addEventListener('click', function() {
        productImage.src = image.src;
        // Highlight selected image and remove highlight from others
        document.querySelectorAll('#high-res-images img, #parsed-images-container img').forEach(i => {
          i.parentElement.style.boxShadow = 'none';
        });
        imgWrapper.style.boxShadow = '0 0 0 2px #3366ff';
      });
      
      // Add image details
      const details = document.createElement('div');
      details.style.fontSize = '11px';
      details.style.marginTop = '4px';
      details.style.textAlign = 'center';
      details.innerHTML = `<strong>${image.width}×${image.height}</strong>`;
      
      // Add "likely product" badge if applicable
      if (image.isPotentialProduct) {
        const badge = document.createElement('div');
        badge.textContent = 'Product';
        badge.style.position = 'absolute';
        badge.style.top = '8px';
        badge.style.right = '8px';
        badge.style.backgroundColor = '#28a745';
        badge.style.color = 'white';
        badge.style.padding = '2px 6px';
        badge.style.borderRadius = '3px';
        badge.style.fontSize = '10px';
        imgWrapper.appendChild(badge);
      }
      
      imgWrapper.appendChild(img);
      imgWrapper.appendChild(details);
      highResContainer.appendChild(imgWrapper);
    });
    
    // Select the first high-res image by default
    if (highResImages.length > 0) {
      productImage.src = highResImages[0].src;
      // Highlight the first image
      const firstImgWrapper = highResContainer.querySelector('div');
      if (firstImgWrapper) {
        firstImgWrapper.style.boxShadow = '0 0 0 2px #3366ff';
      }
    }
  }

  // --- Recommendation Logic ---
  // Toggle between male and female body types using the new buttons
  maleBtn.addEventListener('click', function () {
    gender = 'male';
    maleBtn.classList.add('active');
    femaleBtn.classList.remove('active');
    maleBodyTypes.classList.remove('hidden');
    femaleBodyTypes.classList.add('hidden');
    resetBodyTypeSelection();
  });

  femaleBtn.addEventListener('click', function () {
    gender = 'female';
    femaleBtn.classList.add('active');
    maleBtn.classList.remove('active');
    femaleBodyTypes.classList.remove('hidden');
    maleBodyTypes.classList.add('hidden');
    resetBodyTypeSelection();
  });

  // Body type selection
  bodyTypeCards.forEach(card => {
    card.addEventListener('click', function () {
      const currentCards = gender === 'female' ?
        femaleBodyTypes.querySelectorAll('.body-type-card') :
        maleBodyTypes.querySelectorAll('.body-type-card');
      currentCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      selectedBodyType = this.getAttribute('data-type');
    });
  });

  // Final "Recommend" process
  recommendButton.addEventListener('click', async function () {
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    const age = parseInt(ageInput.value);
    const selectedImageSrc = productImage.src;

    if (isNaN(height) || isNaN(weight) || isNaN(age) || !selectedBodyType) {
      alert('Please enter your height, weight, age, and select a body type.');
      return;
    }
    
    if (!selectedImageSrc || selectedImageSrc === '') {
      alert('Please select a product image first.');
      return;
    }

    // Show loader: add blur + custom spinner overlay
    document.body.classList.add('blurred');
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.zIndex = '9999';

    // Insert your custom spinner HTML
    loadingOverlay.innerHTML = `
      <!-- From Uiverse.io by JkHuger --> 
      <div class="loader">
        <div class="square" id="sq1"></div>
        <div class="square" id="sq2"></div>
        <div class="square" id="sq3"></div>
        <div class="square" id="sq4"></div>
        <div class="square" id="sq5"></div>
        <div class="square" id="sq6"></div>
        <div class="square" id="sq7"></div>
        <div class="square" id="sq8"></div>
        <div class="square" id="sq9"></div>
      </div>
      <!-- End Uiverse.io spinner -->
    `;
    document.body.appendChild(loadingOverlay);

    // Build the final payload (no productImage, includes websiteURL if you want brand-based sizing)
    const payload = {
      height,
      weight,
      age,
      bodyType: selectedBodyType,
      gender,
      // We'll also include the site URL for brand-based size charts, if needed:
      website: websiteURL 
    };

    // Console log what we send
    console.log('Sending data to server:', payload);

    // POST to the recommendation API (without productImage)
    fetch('http://localhost:3000/api/recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Remove loading overlay and blur effect
        document.body.classList.remove('blurred');
        if (document.getElementById('loading-overlay')) {
          document.getElementById('loading-overlay').remove();
        }
        
        console.log('API Response:', data);
        // Update UI with the final size from the backend
        sizeRecommendation.textContent = data.finalSize || "M";
        recommendationText.textContent = `Based on your measurements, we recommend size: ${data.finalSize}`;
        recommendationResult.classList.remove('hidden');
      })
      .catch(error => {
        document.body.classList.remove('blurred');
        if (document.getElementById('loading-overlay')) {
          document.getElementById('loading-overlay').remove();
        }
        console.error('Error:', error);
        alert('There was an error getting your recommendation. Please try again.');
      });
  });

  // Utility function to reset body type selection
  function resetBodyTypeSelection() {
    bodyTypeCards.forEach(card => card.classList.remove('active'));
    selectedBodyType = null;
    recommendationResult.classList.add('hidden');
  }
});
