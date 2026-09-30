# LUMINA — Visual Gallery

> A production-grade, highly polished, modern web application for visual gallery browsing, real-time image editing, and media curation built with pure HTML5, CSS3, and Vanilla JavaScript.

![LUMINA Banner](https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Overview

**LUMINA — Visual Gallery** is a feature-rich, high-performance web application designed for photographers, digital artists, and visual enthusiasts. It provides an immersive experience with adaptive masonry layouts, live non-destructive CSS image filters, deep linking, slide-over detail drawers, swipe navigation, keyboard hotkeys, and persistent user media uploads.

Zero frameworks. Zero build tools. Production-ready performance.

---

## ✨ Key Features

### 🖼️ Layout & Viewing Experience
- **Adaptive Grid Modes**: Toggle seamlessly between **Masonry Layout** (waterfall), **Uniform Grid**, and **Detailed List View**.
- **Column Density Control**: Dynamic range slider allowing users to adjust grid density from 1 to 5 columns on the fly.
- **Lazy Loading & Skeleton Blur-Up**: Utilizes `IntersectionObserver` with smooth pulse skeleton loading states for high performance.
- **Error Fallback**: Automatic SVG placeholder generator for missing images or offline states.

### 🔍 Search, Filter & Curation
- **Category Filter Bar**: Filter by categories (*Nature, Architecture, People, Travel, Food, Animals, Technology*) with item counters.
- **Debounced Live Search**: Instant multi-field search across titles, photographers, categories, and tags with a `Ctrl + K` hotkey.
- **Multi-criteria Sorting**: Sort by Newest, Oldest, Most Liked, or Alphabetical (A-Z).
- **Favorites & Likes**: Heart like button with pulse animations, persisted in `localStorage` and accessible via a dedicated Favorites view tab with navbar badge counter.

### 🔬 Fullscreen Lightbox & Real-time CSS Filter Editor
- **Glassmorphism Overlay**: Dark blurred backdrop (`backdrop-filter: blur(24px)`).
- **Smooth Navigation**: Previous / Next buttons, keyboard arrow controls, thumbnail strip jump navigation, and mobile touch swipe gestures.
- **Interactive Zoom & Pan**: Mouse wheel zoom (1.0x to 3.0x), double-click zoom toggle, and drag-to-pan when zoomed in.
- **Live Non-Destructive CSS Filter Editor**:
  - Fine-tune sliders for **Brightness, Contrast, Saturation, Blur, Grayscale**, and **Sepia**.
  - 1-Click presets (*Vintage, Noir, Warm, Cool, Vivid, Normal*).
  - High-res Canvas export preserving applied filter effects upon download.
- **Photo Info Panel**: Slide-over drawer detailing photographer credits, camera resolution, ISO date, description, and interactive tag pills.
- **Autoplay Slideshow**: Play/Pause with customizable interval speeds (2s, 3s, 5s).
- **Deep Linking**: Generates unique URL hash routes (e.g. `#image-img-5`) for direct link sharing and automatic lightbox opening on page load.

### 📤 Drag & Drop Uploads & Storage Persistence
- **Custom Upload Modal**: Drag & drop zone or file browser to upload personal images.
- **IndexedDB & LocalStorage Engine**: Custom uploaded images are stored securely in IndexedDB with DataURL encoding to bypass `localStorage` size limits.

### 🎨 Theme & Accessibility
- **Dark / Light Theme Toggle**: Automatic system preference detection (`prefers-color-scheme`) with manual toggle saved in `localStorage`.
- **Keyboard Shortcuts Modal**: Press `?` anytime to view all hotkey shortcuts.
- **Full Accessibility**: ARIA roles (`role="dialog"`, `aria-modal`, `aria-label`), keyboard focus indicators, `alt` text tags, and `prefers-reduced-motion` CSS overrides.

---

## 🚀 Quick Start & Setup

No `npm install`, dependencies, or web servers are required.

1. **Clone or Download** the repository to your local computer.
2. **Open `index.html`** directly in any modern browser (Chrome, Firefox, Safari, Edge).

```bash
# Option 1: Double-click index.html or open via terminal
open index.html # macOS
start index.html # Windows
```

---

## 📁 Project Architecture & Folder Structure

```
c:/Users/kalee/Downloads/code aplha image project/
├── index.html          # Semantic HTML5 layout & modal structure
├── css/
│   └── style.css       # Design system, CSS variables, glassmorphism, responsive breakpoints
├── js/
│   ├── data.js          # Initial dataset of 24 high-res curated photography items & SVG fallback generator
│   ├── storage.js       # LocalStorage manager & IndexedDB store for custom user uploads
│   └── app.js           # Main controller module, single source of truth state, lightbox & filter editor
└── README.md           # Comprehensive documentation
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | Focus Live Search Bar |
| <kbd>Esc</kbd> | Close Lightbox / Modals |
| <kbd>→</kbd> | Next Image in Lightbox |
| <kbd>←</kbd> | Previous Image in Lightbox |
| <kbd>F</kbd> | Favorite Current Image |
| <kbd>S</kbd> | Toggle Autoplay Slideshow |
| <kbd>I</kbd> | Toggle Photo Info Drawer |
| <kbd>Z</kbd> | Toggle 2x Image Zoom |
| <kbd>?</kbd> | Show Keyboard Shortcuts Sheet |
| <kbd>F11</kbd> | Toggle Fullscreen Mode |

---

## 💻 Technical Constraints & Browser Compatibility

- **Language**: Pure HTML5, CSS3, Vanilla ES6+ JavaScript.
- **Dependencies**: FontAwesome 6.5.1 (via CDN for icon set).
- **Target Lighthouse Scores**:
  - ⚡ **Performance**: 95+
  - ♿ **Accessibility**: 100
  - 🔒 **Best Practices**: 100
- **Responsive Breakpoints**: Optimized for 320px (Mobile), 768px (Tablet), 1024px (Laptop), 1440px+ (Ultra-wide).

---

## 🔮 Future Enhancements
- EXIF metadata parser for uploaded images using raw ArrayBuffer header analysis.
- Multi-select batch downloading.
- Cloud storage integration (AWS S3 / Cloudinary).

---

## 📄 License

This project is licensed under the MIT License - free for educational and internship submission purposes.
