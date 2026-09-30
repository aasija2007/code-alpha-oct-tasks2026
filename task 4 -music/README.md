# Aurora — Production-Grade Web Music Player

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Enabled-6366F1?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

**Aurora** is a production-grade, Spotify-inspired web music player built purely with **HTML5, CSS3, and ES6+ Vanilla JavaScript**. It utilizes the native `HTMLAudioElement`, the **Web Audio API** (`AudioContext`, `AnalyserNode`, `BiquadFilterNode`), and 2D Canvas rendering to deliver a rich audio streaming experience with zero external framework dependencies.

---

## ✨ Features Overview

### 1. Audio Engine & Web Audio API
- **Full Control**: Play, Pause, Next, Previous (restarts track if > 3s played).
- **Web Audio Equalizer**: 3-Band Equalizer (Bass, Mid, Treble) using `BiquadFilterNode` with presets (*Bass Boost, Vocal Boost, Treble Boost, Flat, Pop, Rock*).
- **Real-Time Visualizer**: 2D Canvas Audio Visualizer synced via `AnalyserNode` with 4 customizable modes (*Frequency Bars, Waveform Oscilloscope, Radial Circle, Neon Spectrum*).
- **Synthetic Web Audio Fallback**: Includes a fallback procedural synthesizer engine to guarantee instant audio output across all devices and sandboxed environments.
- **Media Session API**: Integrated lock-screen playback controls, metadata, and hardware media key support.

### 2. Spotify-Quality UI & Aesthetics
- **Dark Glassmorphism UI**: Dynamic ambient background glow extracting dominant colors from album covers.
- **Spinning Vinyl Disc Animation**: Rotates in sync with playback.
- **Synced Lyrics View**: Karaoke-style synchronized lyrics highlighting.
- **Seek & Volume Bars**: Drag-and-drop seeking, time tooltips (`mm:ss`), mute toggle, and volume memory.

### 3. Library & Playlist Management
- **10 Royalty-Free Sample Tracks**: Fully populated metadata (Title, Artist, Album, Genre, Duration, SVG Art, Lyrics).
- **Search & Sort**: Real-time filtering by title, artist, genre, and duration sorting.
- **Liked Songs (Favorites)**: Add/remove favorites persisted in `localStorage`.
- **Drag & Drop MP3 Files**: Users can drop their own local audio files into the player.

### 4. Keyboard Shortcuts
| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause toggle |
| <kbd>→</kbd> / <kbd>←</kbd> | Seek forward / backward 5s |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Increase / Decrease volume 10% |
| <kbd>N</kbd> | Next Track |
| <kbd>P</kbd> | Previous Track |
| <kbd>M</kbd> | Toggle Mute |
| <kbd>S</kbd> | Toggle Shuffle |
| <kbd>R</kbd> | Cycle Repeat Mode (*Off, Repeat All, Repeat One*) |
| <kbd>L</kbd> | Favorite / Like Track |
| <kbd>Shift + ?</kbd> | Show Keyboard Shortcuts Modal |

---

## 📁 Directory Structure

```text
task 4 -music/
├── index.html              # Main HTML5 UI container & modals
├── sw.js                   # Service Worker for offline PWA functionality
├── manifest.json           # PWA Web App Manifest
├── README.md               # Documentation & setup guide
├── css/
│   └── style.css           # Spotify-inspired glassmorphism styles & animations
├── js/
│   ├── data.js             # 10 sample tracks metadata, lyrics, and EQ presets
│   ├── storage.js          # LocalStorage persistence manager
│   ├── player.js           # Audio engine & Web Audio API pipeline
│   ├── visualizer.js       # Real-time Canvas visualizer renderer
│   ├── playlist.js         # Playlist model, filtering, search & drop parser
│   └── ui.js               # UI Orchestrator & Event Controller
└── assets/                 # Audio & cover art resources
```

---

## 🚀 Setup & How to Run

1. Open `index.html` directly in any modern web browser (Chrome, Firefox, Edge, Safari).
2. Alternatively, serve via a local server (e.g. `python -m http.server 8081`).
3. Click **Play** or press <kbd>Space</kbd> to start music playback.
4. Drag and drop any `.mp3` file from your device into the playlist area to play your own music!

---

## 📜 Royalty-Free Music Credits

All sample audio tracks included in Aurora are royalty-free under Creative Commons / Pixabay Music licenses or synthesized in real-time via the Web Audio API.

---

## 👩‍💻 Author
Built for **CodeAlpha Internship Submission — Task 4 (Music Player Web App)**.
