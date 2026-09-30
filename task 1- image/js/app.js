/**
 * LUMINA — Visual Gallery Application Engine
 * Production-grade architecture with single source of truth state.
 */

(function () {
  "use strict";

  // Application State
  const state = {
    allImages: [],
    filteredImages: [],
    displayedCount: 12,
    pageSize: 12,
    activeCategory: "All",
    searchQuery: "",
    sortBy: "newest",
    viewMode: "masonry", // 'masonry' | 'uniform' | 'list'
    columnCount: 4,
    showFavoritesOnly: false,

    // Lightbox Sub-state
    lightbox: {
      isOpen: false,
      currentIndex: 0,
      isSlideshowPlaying: false,
      slideshowSpeed: 3000,
      slideshowTimer: null,
      zoomScale: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      activeDrawer: null, // 'info' | 'filter' | null
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0
      }
    },

    // Mobile Touch Gesture Tracking
    touch: {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    }
  };

  // DOM Elements Cache
  const DOM = {};

  // Debounce Utility
  function debounce(func, wait = 300) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Initialize Application
  async function init() {
    cacheDOMElements();
    applyInitialTheme();

    // Combine built-in images with user-uploaded custom images
    const customImages = await StorageManager.getCustomImages();
    state.allImages = [...customImages, ...INITIAL_IMAGES];

    setupEventListeners();
    renderCategoriesBar();
    updateStatsCounter();
    updateFavoritesBadge();
    applyFiltersAndRender();
    handleDeepLinkOnInit();

    // Check online status
    updateOnlineStatus();
  }

  // Cache All Required DOM Elements
  function cacheDOMElements() {
    DOM.body = document.body;
    DOM.html = document.documentElement;
    DOM.scrollProgressBar = document.getElementById("scrollProgressBar");
    DOM.btnThemeToggle = document.getElementById("btnThemeToggle");
    DOM.themeIcon = document.getElementById("themeIcon");

    // Stats
    DOM.statTotalPhotos = document.getElementById("statTotalPhotos");
    DOM.statCategories = document.getElementById("statCategories");
    DOM.statFavorites = document.getElementById("statFavorites");

    // Controls
    DOM.categoryContainer = document.getElementById("categoryContainer");
    DOM.searchInput = document.getElementById("searchInput");
    DOM.searchClearBtn = document.getElementById("searchClearBtn");
    DOM.sortSelect = document.getElementById("sortSelect");
    DOM.viewMasonryBtn = document.getElementById("viewMasonryBtn");
    DOM.viewUniformBtn = document.getElementById("viewUniformBtn");
    DOM.viewListBtn = document.getElementById("viewListBtn");
    DOM.columnSlider = document.getElementById("columnSlider");
    DOM.btnFavoritesFilter = document.getElementById("btnFavoritesFilter");
    DOM.favCountBadge = document.getElementById("favCountBadge");

    // Gallery
    DOM.galleryGrid = document.getElementById("galleryGrid");
    DOM.emptyState = document.getElementById("emptyState");
    DOM.resetFiltersBtn = document.getElementById("resetFiltersBtn");
    DOM.btnLoadMore = document.getElementById("btnLoadMore");
    DOM.loadMoreWrapper = document.getElementById("loadMoreWrapper");

    // Lightbox
    DOM.lightboxModal = document.getElementById("lightboxModal");
    DOM.lightboxCounter = document.getElementById("lightboxCounter");
    DOM.lightboxTitle = document.getElementById("lightboxTitle");
    DOM.lightboxStage = document.getElementById("lightboxStage");
    DOM.lightboxImageWrapper = document.getElementById("lightboxImageWrapper");
    DOM.lightboxImage = document.getElementById("lightboxImage");
    DOM.btnLightboxClose = document.getElementById("btnLightboxClose");
    DOM.btnLightboxPrev = document.getElementById("btnLightboxPrev");
    DOM.btnLightboxNext = document.getElementById("btnLightboxNext");
    DOM.btnLightboxFavorite = document.getElementById("btnLightboxFavorite");
    DOM.btnSlideshowToggle = document.getElementById("btnSlideshowToggle");
    DOM.slideshowIcon = document.getElementById("slideshowIcon");
    DOM.slideshowSpeedSelect = document.getElementById("slideshowSpeedSelect");
    DOM.btnFilterEditorToggle = document.getElementById("btnFilterEditorToggle");
    DOM.btnInfoPanelToggle = document.getElementById("btnInfoPanelToggle");
    DOM.btnDownload = document.getElementById("btnDownload");
    DOM.btnShareLink = document.getElementById("btnShareLink");
    DOM.btnFullscreenToggle = document.getElementById("btnFullscreenToggle");
    DOM.thumbnailStrip = document.getElementById("thumbnailStrip");

    // Lightbox Drawers
    DOM.infoDrawer = document.getElementById("infoDrawer");
    DOM.btnCloseInfoDrawer = document.getElementById("btnCloseInfoDrawer");
    DOM.infoTitle = document.getElementById("infoTitle");
    DOM.infoPhotographer = document.getElementById("infoPhotographer");
    DOM.infoCategory = document.getElementById("infoCategory");
    DOM.infoResolution = document.getElementById("infoResolution");
    DOM.infoDate = document.getElementById("infoDate");
    DOM.infoDescription = document.getElementById("infoDescription");
    DOM.infoTags = document.getElementById("infoTags");

    DOM.filterDrawer = document.getElementById("filterDrawer");
    DOM.btnCloseFilterDrawer = document.getElementById("btnCloseFilterDrawer");
    DOM.btnResetFilters = document.getElementById("btnResetFilters");
    DOM.filterBrightness = document.getElementById("filterBrightness");
    DOM.filterContrast = document.getElementById("filterContrast");
    DOM.filterSaturation = document.getElementById("filterSaturation");
    DOM.filterBlur = document.getElementById("filterBlur");
    DOM.filterGrayscale = document.getElementById("filterGrayscale");
    DOM.filterSepia = document.getElementById("filterSepia");

    // Upload Modal
    DOM.btnUploadModal = document.getElementById("btnUploadModal");
    DOM.uploadModal = document.getElementById("uploadModal");
    DOM.btnCloseUploadModal = document.getElementById("btnCloseUploadModal");
    DOM.btnCancelUpload = document.getElementById("btnCancelUpload");
    DOM.uploadForm = document.getElementById("uploadForm");
    DOM.dropzone = document.getElementById("dropzone");
    DOM.fileInput = document.getElementById("fileInput");
    DOM.uploadPreviewWrapper = document.getElementById("uploadPreviewWrapper");
    DOM.uploadPreviewImg = document.getElementById("uploadPreviewImg");

    // Help Modal
    DOM.btnHelpModal = document.getElementById("btnHelpModal");
    DOM.helpModal = document.getElementById("helpModal");
    DOM.btnCloseHelpModal = document.getElementById("btnCloseHelpModal");

    // Toasts & Misc
    DOM.toastContainer = document.getElementById("toastContainer");
    DOM.backToTopBtn = document.getElementById("backToTopBtn");
    DOM.offlineBanner = document.getElementById("offlineBanner");
  }

  // Theme Management
  function applyInitialTheme() {
    const theme = StorageManager.getTheme();
    DOM.html.setAttribute("data-theme", theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = DOM.html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    DOM.html.setAttribute("data-theme", next);
    StorageManager.setTheme(next);
    updateThemeIcon(next);
    showToast(`Switched to ${next} theme mode`, "info", "fa-sun");
  }

  function updateThemeIcon(theme) {
    if (theme === "dark") {
      DOM.themeIcon.className = "fa-solid fa-moon";
    } else {
      DOM.themeIcon.className = "fa-solid fa-sun";
    }
  }

  // Categories Bar Component
  function renderCategoriesBar() {
    const categories = ["All", "Nature", "Architecture", "People", "Travel", "Food", "Animals", "Technology"];
    DOM.categoryContainer.innerHTML = "";

    categories.forEach((cat) => {
      let count = 0;
      if (cat === "All") {
        count = state.allImages.length;
      } else {
        count = state.allImages.filter((img) => img.category === cat).length;
      }

      const pill = document.createElement("button");
      pill.className = `category-pill ${cat === state.activeCategory ? "active" : ""}`;
      pill.setAttribute("role", "tab");
      pill.setAttribute("aria-selected", cat === state.activeCategory ? "true" : "false");
      pill.innerHTML = `${cat} <span class="category-count">${count}</span>`;

      pill.addEventListener("click", () => {
        state.activeCategory = cat;
        state.showFavoritesOnly = false;
        DOM.btnFavoritesFilter.classList.remove("active");
        renderCategoriesBar();
        applyFiltersAndRender();
      });

      DOM.categoryContainer.appendChild(pill);
    });
  }

  // Update Animated Stats Counter
  function updateStatsCounter() {
    DOM.statTotalPhotos.textContent = state.allImages.length;
    const cats = new Set(state.allImages.map((img) => img.category));
    DOM.statCategories.textContent = cats.size;
    DOM.statFavorites.textContent = StorageManager.getFavorites().length;
  }

  function updateFavoritesBadge() {
    const count = StorageManager.getFavorites().length;
    DOM.favCountBadge.textContent = count;
    DOM.statFavorites.textContent = count;
  }

  // Filtering, Searching & Sorting Logic
  function applyFiltersAndRender() {
    let result = [...state.allImages];

    // Filter by Favorites if toggled
    if (state.showFavoritesOnly) {
      const favs = StorageManager.getFavorites();
      result = result.filter((img) => favs.includes(img.id));
    } else if (state.activeCategory !== "All") {
      result = result.filter((img) => img.category === state.activeCategory);
    }

    // Filter by Live Search Query
    if (state.searchQuery.trim() !== "") {
      const query = state.searchQuery.toLowerCase();
      result = result.filter((img) => {
        const titleMatch = img.title.toLowerCase().includes(query);
        const photographerMatch = img.photographer.toLowerCase().includes(query);
        const categoryMatch = img.category.toLowerCase().includes(query);
        const tagMatch = img.tags && img.tags.some((tag) => tag.toLowerCase().includes(query));
        return titleMatch || photographerMatch || categoryMatch || tagMatch;
      });
    }

    // Sorting
    const userLikesMap = StorageManager.getUserLikesMap();
    if (state.sortBy === "newest") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (state.sortBy === "oldest") {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (state.sortBy === "likes") {
      result.sort((a, b) => {
        const likesA = (a.likes || 0) + (userLikesMap[a.id] || 0);
        const likesB = (b.likes || 0) + (userLikesMap[b.id] || 0);
        return likesB - likesA;
      });
    } else if (state.sortBy === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    state.filteredImages = result;
    state.displayedCount = state.pageSize;
    renderGalleryGrid();
  }

  // Gallery Grid Renderer
  function renderGalleryGrid() {
    DOM.galleryGrid.innerHTML = "";

    if (state.filteredImages.length === 0) {
      DOM.emptyState.style.display = "flex";
      DOM.loadMoreWrapper.style.display = "none";
      return;
    } else {
      DOM.emptyState.style.display = "none";
    }

    const itemsToDisplay = state.filteredImages.slice(0, state.displayedCount);

    const fragment = document.createDocumentFragment();

    itemsToDisplay.forEach((imgObj, index) => {
      const card = createGalleryCardElement(imgObj, index);
      fragment.appendChild(card);
    });

    DOM.galleryGrid.appendChild(fragment);

    // Toggle Load More Button
    if (state.displayedCount < state.filteredImages.length) {
      DOM.loadMoreWrapper.style.display = "block";
      DOM.btnLoadMore.style.display = "inline-flex";
    } else {
      DOM.loadMoreWrapper.style.display = "none";
    }

    // Initialize IntersectionObserver for Lazy Loading & Blur-up
    initLazyLoading();
  }

  // Create Individual Card DOM
  function createGalleryCardElement(imgObj, index) {
    const card = document.createElement("article");
    card.className = "gallery-card fade-in-up";
    card.style.animationDelay = `${(index % 12) * 0.05}s`;
    card.dataset.id = imgObj.id;

    const isFav = StorageManager.isFavorite(imgObj.id);
    const userLikesMap = StorageManager.getUserLikesMap();
    const totalLikes = (imgObj.likes || 0) + (userLikesMap[imgObj.id] || 0);

    card.innerHTML = `
      <div class="card-media-wrapper skeleton">
        <img class="card-image lazy-img" 
             src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%231e293b'/></svg>"
             data-src="${imgObj.thumb || imgObj.url}" 
             alt="${imgObj.title}" 
             loading="lazy">
        <div class="card-overlay">
          <div class="card-top-actions">
            <span class="card-category-tag">${imgObj.category}</span>
            <button class="btn-card-action btn-like-card ${isFav ? "liked" : ""}" title="Like Photo" aria-label="Like Photo">
              <i class="fa-${isFav ? "solid" : "regular"} fa-heart"></i>
            </button>
          </div>
          <div class="card-bottom-info">
            <h3 class="card-title">${imgObj.title}</h3>
            <div class="card-photographer">
              <i class="fa-solid fa-camera"></i>
              <span>${imgObj.photographer}</span>
              <span style="margin-left: auto; display: flex; align-items: center; gap: 3px;">
                <i class="fa-solid fa-heart" style="font-size: 0.75rem; color: #ef4444;"></i> ${totalLikes}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Inline details layout for list view
    if (state.viewMode === "list") {
      const inlineDetails = document.createElement("div");
      inlineDetails.className = "card-content-inline";
      inlineDetails.innerHTML = `
        <span class="card-category-tag" style="align-self: flex-start; margin-bottom: 0.5rem;">${imgObj.category}</span>
        <h3 class="card-title" style="font-size: 1.3rem; color: var(--text-primary); margin-bottom: 0.5rem;">${imgObj.title}</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">${imgObj.description}</p>
        <div class="card-photographer" style="color: var(--text-muted);">
          <i class="fa-solid fa-camera"></i> <span>${imgObj.photographer}</span> • <span>${imgObj.resolution || "HD"}</span>
        </div>
      `;
      card.appendChild(inlineDetails);
    }

    // Card Click Opens Lightbox
    card.addEventListener("click", (e) => {
      // If clicked on like button
      if (e.target.closest(".btn-like-card")) {
        e.stopPropagation();
        toggleFavoriteCard(imgObj.id, card);
        return;
      }
      openLightboxById(imgObj.id);
    });

    return card;
  }

  // Card Favorite Toggle
  function toggleFavoriteCard(id, cardElem) {
    const isFav = StorageManager.toggleFavorite(id);
    updateFavoritesBadge();

    const likeBtn = cardElem.querySelector(".btn-like-card");
    if (likeBtn) {
      if (isFav) {
        likeBtn.classList.add("liked");
        likeBtn.querySelector("i").className = "fa-solid fa-heart";
        StorageManager.setUserLike(id, 1);
        showToast("Added to your Favorites", "success", "fa-heart");
      } else {
        likeBtn.classList.remove("liked");
        likeBtn.querySelector("i").className = "fa-regular fa-heart";
        StorageManager.setUserLike(id, -1);
        showToast("Removed from Favorites", "info", "fa-heart-crack");
      }
    }

    if (state.showFavoritesOnly) {
      applyFiltersAndRender();
    }
  }

  // Lazy Loading Observer
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll(".lazy-img");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const src = img.dataset.src;
              if (src) {
                img.src = src;
                img.onload = () => {
                  img.classList.add("loaded");
                  const wrapper = img.closest(".card-media-wrapper");
                  if (wrapper) wrapper.classList.remove("skeleton");
                };
                img.onerror = () => {
                  // SVG Fallback if image fails to load
                  const card = img.closest(".gallery-card");
                  const id = card ? card.dataset.id : "";
                  const item = state.allImages.find((x) => x.id === id);
                  img.src = getFallbackSvgUrl(item ? item.title : "LUMINA", item ? item.category : "Photo");
                  img.classList.add("loaded");
                  const wrapper = img.closest(".card-media-wrapper");
                  if (wrapper) wrapper.classList.remove("skeleton");
                };
              }
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: "100px" }
      );

      lazyImages.forEach((img) => observer.observe(img));
    } else {
      // Direct fallback for older browsers
      lazyImages.forEach((img) => {
        img.src = img.dataset.src;
        img.classList.add("loaded");
      });
    }
  }

  // Lightbox Operations
  function openLightboxById(id) {
    const index = state.filteredImages.findIndex((img) => img.id === id);
    if (index !== -1) {
      openLightboxAtIndex(index);
    }
  }

  function openLightboxAtIndex(index) {
    state.lightbox.isOpen = true;
    state.lightbox.currentIndex = index;
    resetLightboxZoomAndFilters();

    DOM.lightboxModal.classList.add("active");
    DOM.body.style.overflow = "hidden"; // Prevent background scroll

    updateLightboxContent();
    renderThumbnailStrip();

    // Update URL Hash for deep linking
    const currentImg = state.filteredImages[index];
    if (currentImg) {
      history.replaceState(null, "", `#image-${currentImg.id}`);
    }
  }

  function closeLightbox() {
    state.lightbox.isOpen = false;
    DOM.lightboxModal.classList.remove("active");
    DOM.body.style.overflow = "";

    stopSlideshow();
    closeAllDrawers();
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function navigateLightbox(delta) {
    if (!state.lightbox.isOpen || state.filteredImages.length === 0) return;

    let newIndex = state.lightbox.currentIndex + delta;
    if (newIndex < 0) {
      newIndex = state.filteredImages.length - 1;
    } else if (newIndex >= state.filteredImages.length) {
      newIndex = 0;
    }

    state.lightbox.currentIndex = newIndex;
    resetLightboxZoomAndFilters();
    updateLightboxContent();
    updateThumbnailStripHighlight();

    const currentImg = state.filteredImages[newIndex];
    if (currentImg) {
      history.replaceState(null, "", `#image-${currentImg.id}`);
    }
  }

  function updateLightboxContent() {
    const currentImg = state.filteredImages[state.lightbox.currentIndex];
    if (!currentImg) return;

    DOM.lightboxCounter.textContent = `${state.lightbox.currentIndex + 1} / ${state.filteredImages.length}`;
    DOM.lightboxTitle.textContent = currentImg.title;

    // Fade animation on image change
    DOM.lightboxImage.style.opacity = "0.3";
    DOM.lightboxImage.src = currentImg.url || currentImg.thumb;
    DOM.lightboxImage.alt = currentImg.title;

    DOM.lightboxImage.onload = () => {
      DOM.lightboxImage.style.opacity = "1";
    };

    DOM.lightboxImage.onerror = () => {
      DOM.lightboxImage.src = getFallbackSvgUrl(currentImg.title, currentImg.category);
      DOM.lightboxImage.style.opacity = "1";
    };

    // Update favorite heart state in lightbox
    const isFav = StorageManager.isFavorite(currentImg.id);
    DOM.btnLightboxFavorite.className = `btn-icon ${isFav ? "active" : ""}`;
    DOM.btnLightboxFavorite.querySelector("i").className = `fa-${isFav ? "solid" : "regular"} fa-heart`;

    // Populate Info Drawer
    DOM.infoTitle.textContent = currentImg.title;
    DOM.infoPhotographer.textContent = currentImg.photographer;
    DOM.infoCategory.textContent = currentImg.category;
    DOM.infoResolution.textContent = currentImg.resolution || "3840 x 2160";
    DOM.infoDate.textContent = currentImg.date || "2024";
    DOM.infoDescription.textContent = currentImg.description || "No description provided.";

    DOM.infoTags.innerHTML = "";
    if (currentImg.tags) {
      currentImg.tags.forEach((tag) => {
        const pill = document.createElement("span");
        pill.className = "tag-pill";
        pill.textContent = `#${tag}`;
        DOM.infoTags.appendChild(pill);
      });
    }
  }

  // Thumbnail Strip in Lightbox
  function renderThumbnailStrip() {
    DOM.thumbnailStrip.innerHTML = "";

    state.filteredImages.forEach((img, idx) => {
      const thumb = document.createElement("div");
      thumb.className = `thumb-item ${idx === state.lightbox.currentIndex ? "active" : ""}`;
      thumb.innerHTML = `<img src="${img.thumb || img.url}" alt="${img.title}">`;

      thumb.addEventListener("click", () => {
        state.lightbox.currentIndex = idx;
        resetLightboxZoomAndFilters();
        updateLightboxContent();
        updateThumbnailStripHighlight();
      });

      DOM.thumbnailStrip.appendChild(thumb);
    });

    updateThumbnailStripHighlight();
  }

  function updateThumbnailStripHighlight() {
    const thumbs = DOM.thumbnailStrip.querySelectorAll(".thumb-item");
    thumbs.forEach((t, i) => {
      if (i === state.lightbox.currentIndex) {
        t.classList.add("active");
        t.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } else {
        t.classList.remove("active");
      }
    });
  }

  // Zoom & Pan Mechanics
  function resetLightboxZoomAndFilters() {
    state.lightbox.zoomScale = 1;
    state.lightbox.panX = 0;
    state.lightbox.panY = 0;
    applyTransform();
  }

  function applyTransform() {
    const { zoomScale, panX, panY } = state.lightbox;
    DOM.lightboxImageWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
  }

  function toggleZoom() {
    if (state.lightbox.zoomScale === 1) {
      state.lightbox.zoomScale = 2;
    } else {
      resetLightboxZoomAndFilters();
    }
    applyTransform();
  }

  // Live CSS Image Filter Controls
  function applyCSSFilters() {
    const f = state.lightbox.filters;
    const filterString = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%)`;
    DOM.lightboxImage.style.filter = filterString;

    // Update numerical value labels
    document.getElementById("valBrightness").textContent = `${f.brightness}%`;
    document.getElementById("valContrast").textContent = `${f.contrast}%`;
    document.getElementById("valSaturation").textContent = `${f.saturation}%`;
    document.getElementById("valBlur").textContent = `${f.blur}px`;
    document.getElementById("valGrayscale").textContent = `${f.grayscale}%`;
    document.getElementById("valSepia").textContent = `${f.sepia}%`;
  }

  function applyPresetFilter(presetName) {
    const presets = {
      normal: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0 },
      vintage: { brightness: 90, contrast: 120, saturation: 90, blur: 0, grayscale: 0, sepia: 40 },
      noir: { brightness: 105, contrast: 140, saturation: 0, blur: 0, grayscale: 100, sepia: 0 },
      warm: { brightness: 105, contrast: 110, saturation: 130, blur: 0, grayscale: 0, sepia: 25 },
      cool: { brightness: 100, contrast: 110, saturation: 90, blur: 0, grayscale: 0, sepia: 0 },
      vivid: { brightness: 110, contrast: 130, saturation: 170, blur: 0, grayscale: 0, sepia: 0 }
    };

    const chosen = presets[presetName] || presets.normal;
    state.lightbox.filters = { ...chosen };

    // Update sliders
    DOM.filterBrightness.value = chosen.brightness;
    DOM.filterContrast.value = chosen.contrast;
    DOM.filterSaturation.value = chosen.saturation;
    DOM.filterBlur.value = chosen.blur;
    DOM.filterGrayscale.value = chosen.grayscale;
    DOM.filterSepia.value = chosen.sepia;

    applyCSSFilters();
    showToast(`Applied preset: ${presetName.toUpperCase()}`, "info", "fa-wand-magic-sparkles");
  }

  function resetCSSFilters() {
    applyPresetFilter("normal");
  }

  // Slideshow Autoplay Controller
  function toggleSlideshow() {
    if (state.lightbox.isSlideshowPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }

  function startSlideshow() {
    state.lightbox.isSlideshowPlaying = true;
    DOM.btnSlideshowToggle.classList.add("active");
    DOM.slideshowIcon.className = "fa-solid fa-pause";

    showToast("Slideshow started", "info", "fa-play");
    state.lightbox.slideshowTimer = setInterval(() => {
      navigateLightbox(1);
    }, state.lightbox.slideshowSpeed);
  }

  function stopSlideshow() {
    state.lightbox.isSlideshowPlaying = false;
    DOM.btnSlideshowToggle.classList.remove("active");
    DOM.slideshowIcon.className = "fa-solid fa-play";

    if (state.lightbox.slideshowTimer) {
      clearInterval(state.lightbox.slideshowTimer);
      state.lightbox.slideshowTimer = null;
    }
  }

  // Download Image with Canvas Non-Destructive Filter Render
  function downloadActiveImage() {
    const currentImg = state.filteredImages[state.lightbox.currentIndex];
    if (!currentImg) return;

    showToast("Preparing high-res download...", "info", "fa-download");

    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.src = currentImg.url || currentImg.thumb;

    tempImg.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = tempImg.naturalWidth || 1920;
      canvas.height = tempImg.naturalHeight || 1080;
      const ctx = canvas.getContext("2d");

      // Apply current lightbox CSS filters to canvas context
      const f = state.lightbox.filters;
      ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%)`;
      ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `LUMINA_${currentImg.title.replace(/\s+/g, "_")}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        showToast("Download started!", "success", "fa-circle-check");
      }, "image/jpeg", 0.95);
    };

    tempImg.onerror = () => {
      showToast("Download failed due to CORS restriction. Opening direct link...", "warning", "fa-triangle-exclamation");
      window.open(currentImg.url, "_blank");
    };
  }

  // Copy Deep Link
  function copyShareLink() {
    const currentImg = state.filteredImages[state.lightbox.currentIndex];
    if (!currentImg) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}#image-${currentImg.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Deep link copied to clipboard!", "success", "fa-link");
    }).catch(() => {
      showToast("Failed to copy link", "warning", "fa-triangle-exclamation");
    });
  }

  // Fullscreen Handler
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      DOM.lightboxModal.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // Drawer Toggles
  function toggleDrawer(drawerName) {
    if (state.lightbox.activeDrawer === drawerName) {
      closeAllDrawers();
    } else {
      closeAllDrawers();
      state.lightbox.activeDrawer = drawerName;
      if (drawerName === "info") {
        DOM.infoDrawer.classList.add("active");
        DOM.btnInfoPanelToggle.classList.add("active");
      } else if (drawerName === "filter") {
        DOM.filterDrawer.classList.add("active");
        DOM.btnFilterEditorToggle.classList.add("active");
      }
    }
  }

  function closeAllDrawers() {
    state.lightbox.activeDrawer = null;
    DOM.infoDrawer.classList.remove("active");
    DOM.filterDrawer.classList.remove("active");
    DOM.btnInfoPanelToggle.classList.remove("active");
    DOM.btnFilterEditorToggle.classList.remove("active");
  }

  // Drag & Drop Upload Custom Photo Handler
  function handleImageUpload(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "warning", "fa-triangle-exclamation");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      DOM.uploadPreviewImg.src = dataUrl;
      DOM.uploadPreviewWrapper.style.display = "block";
      DOM.uploadForm.dataset.imageDataUrl = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  async function saveCustomUploadedImage(e) {
    e.preventDefault();

    const dataUrl = DOM.uploadForm.dataset.imageDataUrl;
    if (!dataUrl) {
      showToast("Please choose an image file first!", "warning", "fa-triangle-exclamation");
      return;
    }

    const title = document.getElementById("uploadTitle").value.trim();
    const category = document.getElementById("uploadCategory").value;
    const photographer = document.getElementById("uploadPhotographer").value.trim() || "You";
    const description = document.getElementById("uploadDescription").value.trim() || "User uploaded custom photo.";

    const newImageObj = {
      id: `custom-img-${Date.now()}`,
      title: title,
      category: category,
      photographer: photographer,
      description: description,
      url: dataUrl,
      thumb: dataUrl,
      aspectRatio: 1.33,
      resolution: "Custom HQ",
      tags: ["Upload", category],
      likes: 1,
      date: new Date().toISOString().split("T")[0],
      custom: true
    };

    // Save to IndexedDB/Storage
    await StorageManager.saveCustomImage(newImageObj);

    state.allImages.unshift(newImageObj);
    updateStatsCounter();
    renderCategoriesBar();
    applyFiltersAndRender();

    closeUploadModal();
    showToast(`"${title}" added to gallery!`, "success", "fa-circle-check");
  }

  function openUploadModal() {
    DOM.uploadForm.reset();
    DOM.uploadPreviewWrapper.style.display = "none";
    delete DOM.uploadForm.dataset.imageDataUrl;
    DOM.uploadModal.classList.add("active");
  }

  function closeUploadModal() {
    DOM.uploadModal.classList.remove("active");
  }

  // Help Modal
  function openHelpModal() {
    DOM.helpModal.classList.add("active");
  }

  function closeHelpModal() {
    DOM.helpModal.classList.remove("active");
  }

  // Toast System
  function showToast(message, type = "info", icon = "fa-circle-info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Deep Link Initial Handler (#image-img-5)
  function handleDeepLinkOnInit() {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#image-")) {
      const id = hash.replace("#image-", "");
      setTimeout(() => {
        openLightboxById(id);
      }, 300);
    }
  }

  // Offline / Online Monitor
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      DOM.offlineBanner.style.display = "block";
      showToast("Offline mode active", "warning", "fa-wifi-slash");
    } else {
      DOM.offlineBanner.style.display = "none";
    }
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Scroll progress & Back to top
    window.addEventListener("scroll", () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      DOM.scrollProgressBar.style.width = `${scrolled}%`;

      if (winScroll > 300) {
        DOM.backToTopBtn.classList.add("visible");
      } else {
        DOM.backToTopBtn.classList.remove("visible");
      }
    });

    DOM.backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Theme toggle
    DOM.btnThemeToggle.addEventListener("click", toggleTheme);

    // Live Search input
    DOM.searchInput.addEventListener(
      "input",
      debounce((e) => {
        state.searchQuery = e.target.value;
        applyFiltersAndRender();
      }, 250)
    );

    DOM.searchClearBtn.addEventListener("click", () => {
      DOM.searchInput.value = "";
      state.searchQuery = "";
      applyFiltersAndRender();
    });

    // Sort selector
    DOM.sortSelect.addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      applyFiltersAndRender();
    });

    // View Mode switches
    DOM.viewMasonryBtn.addEventListener("click", () => setViewMode("masonry"));
    DOM.viewUniformBtn.addEventListener("click", () => setViewMode("uniform"));
    DOM.viewListBtn.addEventListener("click", () => setViewMode("list"));

    // Column Density Slider
    DOM.columnSlider.addEventListener("input", (e) => {
      const cols = e.target.value;
      state.columnCount = cols;
      DOM.html.style.setProperty("--col-count", cols);
    });

    // Favorites Filter button
    DOM.btnFavoritesFilter.addEventListener("click", () => {
      state.showFavoritesOnly = !state.showFavoritesOnly;
      DOM.btnFavoritesFilter.classList.toggle("active", state.showFavoritesOnly);
      if (state.showFavoritesOnly) {
        state.activeCategory = "All";
        renderCategoriesBar();
      }
      applyFiltersAndRender();
    });

    // Reset Filters button in Empty State
    DOM.resetFiltersBtn.addEventListener("click", () => {
      state.activeCategory = "All";
      state.searchQuery = "";
      state.showFavoritesOnly = false;
      DOM.searchInput.value = "";
      DOM.btnFavoritesFilter.classList.remove("active");
      renderCategoriesBar();
      applyFiltersAndRender();
    });

    // Load More Button
    DOM.btnLoadMore.addEventListener("click", () => {
      state.displayedCount += state.pageSize;
      renderGalleryGrid();
    });

    // Lightbox Controls
    DOM.btnLightboxClose.addEventListener("click", closeLightbox);
    DOM.btnLightboxPrev.addEventListener("click", () => navigateLightbox(-1));
    DOM.btnLightboxNext.addEventListener("click", () => navigateLightbox(1));

    DOM.btnLightboxFavorite.addEventListener("click", () => {
      const currentImg = state.filteredImages[state.lightbox.currentIndex];
      if (currentImg) {
        const isFav = StorageManager.toggleFavorite(currentImg.id);
        updateFavoritesBadge();
        DOM.btnLightboxFavorite.className = `btn-icon ${isFav ? "active" : ""}`;
        DOM.btnLightboxFavorite.querySelector("i").className = `fa-${isFav ? "solid" : "regular"} fa-heart`;
        showToast(isFav ? "Added to Favorites" : "Removed from Favorites", isFav ? "success" : "info", "fa-heart");

        // Update card in grid if visible
        const cardInGrid = document.querySelector(`.gallery-card[data-id="${currentImg.id}"]`);
        if (cardInGrid) {
          const likeBtn = cardInGrid.querySelector(".btn-like-card");
          if (likeBtn) {
            likeBtn.classList.toggle("liked", isFav);
            likeBtn.querySelector("i").className = `fa-${isFav ? "solid" : "regular"} fa-heart`;
          }
        }
      }
    });

    DOM.btnSlideshowToggle.addEventListener("click", toggleSlideshow);
    DOM.slideshowSpeedSelect.addEventListener("change", (e) => {
      state.lightbox.slideshowSpeed = parseInt(e.target.value, 10);
      if (state.lightbox.isSlideshowPlaying) {
        stopSlideshow();
        startSlideshow();
      }
    });

    DOM.btnInfoPanelToggle.addEventListener("click", () => toggleDrawer("info"));
    DOM.btnCloseInfoDrawer.addEventListener("click", closeAllDrawers);

    DOM.btnFilterEditorToggle.addEventListener("click", () => toggleDrawer("filter"));
    DOM.btnCloseFilterDrawer.addEventListener("click", closeAllDrawers);

    DOM.btnDownload.addEventListener("click", downloadActiveImage);
    DOM.btnShareLink.addEventListener("click", copyShareLink);
    DOM.btnFullscreenToggle.addEventListener("click", toggleFullscreen);

    // CSS Filter Sliders Input Events
    [
      { elem: DOM.filterBrightness, key: "brightness" },
      { elem: DOM.filterContrast, key: "contrast" },
      { elem: DOM.filterSaturation, key: "saturation" },
      { elem: DOM.filterBlur, key: "blur" },
      { elem: DOM.filterGrayscale, key: "grayscale" },
      { elem: DOM.filterSepia, key: "sepia" }
    ].forEach(({ elem, key }) => {
      elem.addEventListener("input", (e) => {
        state.lightbox.filters[key] = parseFloat(e.target.value);
        applyCSSFilters();
      });
    });

    // Filter Preset Buttons
    document.querySelectorAll(".btn-preset").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const preset = e.target.dataset.preset;
        applyPresetFilter(preset);
      });
    });

    DOM.btnResetFilters.addEventListener("click", resetCSSFilters);

    // Double Click Lightbox Image to Toggle Zoom
    DOM.lightboxImage.addEventListener("dblclick", toggleZoom);

    // Mouse Wheel Zoom
    DOM.lightboxStage.addEventListener(
      "wheel",
      (e) => {
        if (!state.lightbox.isOpen) return;
        e.preventDefault();
        if (e.deltaY < 0) {
          state.lightbox.zoomScale = Math.min(state.lightbox.zoomScale + 0.2, 3);
        } else {
          state.lightbox.zoomScale = Math.max(state.lightbox.zoomScale - 0.2, 1);
          if (state.lightbox.zoomScale === 1) {
            state.lightbox.panX = 0;
            state.lightbox.panY = 0;
          }
        }
        applyTransform();
      },
      { passive: false }
    );

    // Pan / Dragging when Zoomed
    DOM.lightboxStage.addEventListener("mousedown", (e) => {
      if (state.lightbox.zoomScale > 1) {
        state.lightbox.isDragging = true;
        state.lightbox.dragStartX = e.clientX - state.lightbox.panX;
        state.lightbox.dragStartY = e.clientY - state.lightbox.panY;
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (state.lightbox.isDragging) {
        state.lightbox.panX = e.clientX - state.lightbox.dragStartX;
        state.lightbox.panY = e.clientY - state.lightbox.dragStartY;
        applyTransform();
      }
    });

    window.addEventListener("mouseup", () => {
      state.lightbox.isDragging = false;
    });

    // Touch Gestures for Mobile (Swipe Left/Right & Down to Close)
    DOM.lightboxStage.addEventListener("touchstart", (e) => {
      state.touch.startX = e.touches[0].clientX;
      state.touch.startY = e.touches[0].clientY;
    });

    DOM.lightboxStage.addEventListener("touchend", (e) => {
      state.touch.endX = e.changedTouches[0].clientX;
      state.touch.endY = e.changedTouches[0].clientY;
      handleTouchSwipe();
    });

    function handleTouchSwipe() {
      const deltaX = state.touch.endX - state.touch.startX;
      const deltaY = state.touch.endY - state.touch.startY;

      // Horizontal Swipe
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 60) {
        if (deltaX < 0) {
          navigateLightbox(1); // Swipe left -> next
        } else {
          navigateLightbox(-1); // Swipe right -> prev
        }
      }

      // Vertical Downward Swipe to Close
      if (deltaY > 100 && Math.abs(deltaX) < 80) {
        closeLightbox();
      }
    }

    // Upload Modal Listeners
    DOM.btnUploadModal.addEventListener("click", openUploadModal);
    DOM.btnCloseUploadModal.addEventListener("click", closeUploadModal);
    DOM.btnCancelUpload.addEventListener("click", closeUploadModal);
    DOM.uploadForm.addEventListener("submit", saveCustomUploadedImage);

    // Dropzone Drag & Drop
    DOM.dropzone.addEventListener("click", () => DOM.fileInput.click());
    DOM.fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) handleImageUpload(e.target.files[0]);
    });

    DOM.dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      DOM.dropzone.classList.add("dragover");
    });

    DOM.dropzone.addEventListener("dragleave", () => DOM.dropzone.classList.remove("dragover"));

    DOM.dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      DOM.dropzone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        handleImageUpload(e.dataTransfer.files[0]);
      }
    });

    // Keyboard Help Modal
    DOM.btnHelpModal.addEventListener("click", openHelpModal);
    DOM.btnCloseHelpModal.addEventListener("click", closeHelpModal);

    // Close Modals on backdrop click
    [DOM.uploadModal, DOM.helpModal].forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    });

    // Global Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      // Avoid hotkeys when typing in form inputs
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        if (e.key === "Escape") {
          document.activeElement.blur();
        }
        return;
      }

      // Ctrl + K -> Focus search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        DOM.searchInput.focus();
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        openHelpModal();
        return;
      }

      if (e.key === "Escape") {
        if (DOM.helpModal.classList.contains("active")) closeHelpModal();
        else if (DOM.uploadModal.classList.contains("active")) closeUploadModal();
        else if (state.lightbox.isOpen) closeLightbox();
        return;
      }

      // Lightbox Specific Shortcuts
      if (state.lightbox.isOpen) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateLightbox(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          navigateLightbox(1);
        } else if (e.key.toLowerCase() === "f") {
          DOM.btnLightboxFavorite.click();
        } else if (e.key.toLowerCase() === "s") {
          toggleSlideshow();
        } else if (e.key.toLowerCase() === "i") {
          toggleDrawer("info");
        } else if (e.key.toLowerCase() === "z") {
          toggleZoom();
        }
      }
    });

    // Network offline / online events
    window.addEventListener("offline", updateOnlineStatus);
    window.addEventListener("online", updateOnlineStatus);
  }

  // Set View Mode (Masonry, Uniform, List)
  function setViewMode(mode) {
    state.viewMode = mode;
    DOM.viewMasonryBtn.classList.toggle("active", mode === "masonry");
    DOM.viewUniformBtn.classList.toggle("active", mode === "uniform");
    DOM.viewListBtn.classList.toggle("active", mode === "list");

    DOM.galleryGrid.className = `gallery-grid ${mode}-view`;
    applyFiltersAndRender();
  }

  // DOMContentLoaded Entrypoint
  document.addEventListener("DOMContentLoaded", init);
})();
