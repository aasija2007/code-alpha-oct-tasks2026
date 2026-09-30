# CalcPro — Smart Calculator 🧮

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack: Vanilla JS](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)]()
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-10B981.svg)]()

> **CalcPro** is a production-grade, professional smart calculator web application built as an internship project submission. It delivers real-world performance, beautiful glassmorphism aesthetics, safe mathematical expression parsing without `eval()`, scientific computing, unit & currency conversion, calculation history persistence, keyboard accessibility, audio-haptic feedback, and PWA offline support.

---

## 🌟 Key Features

### 🧮 1. Pure & Safe Mathematical Engine
- **No `eval()` or `new Function()`**: Implements a custom **Shunting-Yard Algorithm** with Reverse Polish Notation (RPN) stack evaluation.
- **Strict Operator Precedence**: Supports standard algebraic order of operations ($(), \text{functions}, \text{exponents}, \times/\div, +/-$).
- **Floating-Point Precision Fix**: Resolves native IEEE-754 precision bugs (e.g., `0.1 + 0.2 = 0.3` instead of `0.30000000000000004`).
- **Error Recovery**: Handles division by zero and invalid math domains with friendly, non-crashing error messages (e.g., *"Cannot divide by zero"*).

### 🧪 2. Scientific Computing Mode
- Expandable scientific keypad with smooth CSS transitions.
- Trigonometry: `sin`, `cos`, `tan`, `asin`, `acos`, `atan` with **DEG / RAD** mode toggle.
- Logarithmic functions: `log` ($\log_{10}$), `ln` ($\log_e$).
- Exponents & Roots: $x^2$, $x^y$, $\sqrt{x}$, $1/x$ reciprocal.
- Mathematical Constants: $\pi$, $e$.
- Factorial ($n!$) with Gamma function support for decimals.

### 🔄 3. Unit & Currency Converter Tab
- Seamless tab switcher between **Calculator** and **Converter** views.
- **Length**: Meters, Kilometers, Centimeters, Millimeters, Miles, Feet, Inches.
- **Weight**: Kilograms, Grams, Milligrams, Pounds, Ounces.
- **Temperature**: Celsius (°C), Fahrenheit (°F), Kelvin (K).
- **Currency**: USD ($), EUR (€), GBP (£), JPY (¥), INR (₹), CAD (C$), AUD (A$), CHF.
- Interactive unit swapping button with rotation animation.

### 🕒 4. Calculation History & Memory Management
- **Persistent History Panel**: Side panel listing past calculations with timestamps, stored in `localStorage`.
- **One-Click Recall**: Click any historical entry to restore its expression into the live display.
- **Memory Functions**: `MC`, `MR`, `M+`, `M-`, `MS` with an dynamic **"M"** badge indicator on the display header when memory contains a non-zero value.

### 🎨 5. Glassmorphism Design System & Themes
- Dynamic **Dark / Light** mode toggle respecting `prefers-color-scheme`.
- **4 Accent Color Themes**:
  - 🌊 **Ocean**: Deep sky blue & indigo gradients.
  - 🌅 **Sunset**: Warm rose & coral orange.
  - 🌲 **Forest**: Emerald & mint teal.
  - ⚡ **Neon**: Cyberpunk purple & electric blue.
- Responsive design scaling seamlessly from mobile devices (320px) to 4K desktop screens.

### ⌨️ 6. Keyboard, Sound & Haptic Support
- Full keyboard support (`0-9`, `+ - * /`, `Enter/=`, `Backspace`, `Escape`, `( )`, `^`, `!`, `?` for help).
- Visual on-screen keypress feedback animations.
- **Undo / Redo**: Supports `Ctrl+Z` and `Ctrl+Y` to undo/redo expression edits.
- **Copy to Clipboard**: Click the display result to copy with a smooth toast confirmation.
- **Paste Sanitization**: Paste raw expressions from Excel or external sites directly into the display.
- **Synthesizer Click Sound**: Built-in Web Audio API tone synthesizer (zero external sound files).
- **Mobile Vibration**: Gentle haptic tap feedback via `navigator.vibrate`.

### 📱 7. Progressive Web App (PWA)
- Offline support via Service Worker caching (`sw.js`).
- Web App Manifest (`manifest.json`) allowing "Add to Home Screen" installation on mobile & desktop.

---

## 📁 Project Directory Structure

```
calcpro-smart-calculator/
├── index.html          # Main HTML5 semantic structure & modal definitions
├── manifest.json       # PWA Web App Manifest
├── sw.js               # Service Worker for offline asset caching
├── README.md           # Documentation
├── css/
│   └── style.css       # Complete CSS3 design system, themes & animations
└── js/
    ├── calculator.js   # Core pure-function expression engine (Shunting-Yard)
    ├── storage.js      # LocalStorage manager for History, Memory & Settings
    ├── converter.js    # Unit & currency converter calculation module
    ├── tests.js        # Automated unit testing suite
    └── ui.js           # Rendering, DOM event listeners, keyboard & Web Audio
```

---

## 🚀 How to Run Locally

Because CalcPro is built using pure vanilla web technologies, no build steps or dependencies are required.

1. **Clone or Download** the project repository.
2. **Open directly**: Double-click `index.html` to open it in any modern web browser (Chrome, Edge, Firefox, Safari).
3. **Or serve via local server**:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
4. Access the web app at `http://localhost:8000`.

---

## 🧪 Automated Unit Testing

CalcPro includes an embedded automated test suite covering algebraic precedence, floating-point precision, bracket balancing, scientific functions, and unit conversions.

- Upon opening the application, open your browser's Developer Tools (`F12` -> `Console`).
- You will see formatted, color-coded unit test results outputted directly by `js/tests.js`:

```text
🧪 CalcPro Automated Unit Test Suite
  [PASS 1/19] Basic Addition
  [PASS 2/19] Operator Precedence (Multiplication before Addition)
  [PASS 3/19] Operator Precedence with Division & Subtraction
  [PASS 4/19] Parentheses Precedence
  [PASS 5/19] Floating Point Precision (0.1 + 0.2)
  [PASS 6/19] Division by Zero Safety
  [PASS 7/19] Percentage Calculation
  ...
  Summary: 19 Passed, 0 Failed
```

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action |
| :--- | :--- |
| `0` - `9` | Input Digits |
| `+` `-` `*` `/` | Basic Operators ($\times$, $\div$) |
| `.` | Decimal Point |
| `%` | Percentage |
| `(` `)` | Parentheses |
| `^` | Exponentiation / Power ($x^y$) |
| `!` | Factorial ($n!$) |
| `Enter` or `=` | Evaluate Expression |
| `Backspace` | Delete Last Character |
| `Escape` | Clear All (AC) |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `?` | Open Keyboard Shortcuts Help Modal |

---

## 🛡️ Code Quality & Architecture Standards

- **Separation of Concerns**: Pure calculation engine (`calculator.js`) is completely decoupled from UI rendering (`ui.js`).
- **Accessibility (a11y)**: Focus rings, `aria-live` region on display, standard `aria-label` attributes on interactive elements.
- **Zero External Libraries**: Fast loading speed (< 50KB total size), high performance, zero build complexity.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
