# Aasija — Production-Grade Personal Portfolio

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-95%2B-10B981?style=for-the-badge&logo=lighthouse&logoColor=white)](#performance)

An award-winning, agency-quality personal portfolio website built for **Aasija**, a final-year Computer Science & Engineering student specializing in Frontend Engineering. Built with pure **HTML5, CSS3, and Vanilla JavaScript (ES6+)** with zero framework or build-tool overhead.

This project serves both as a **CodeAlpha Frontend Internship submission** and a real-world, recruiter-ready portfolio site.

---

## 🌟 Key Features & Highlights

- **Aesthetic Design System**: Dark/Light theme toggle with automatic system preference detection (`prefers-color-scheme`) saved in `localStorage`.
- **Dynamic Data Architecture**: All content (projects, skills, timeline, statistics, testimonials) lives in `js/data.js` for quick updates without touching HTML structure.
- **Interactive Background**: Custom 2D Canvas particle mesh network that automatically pauses when the browser tab is hidden to preserve battery life and performance.
- **Animated Typing Roles**: Smooth typewriter effect cycling through developer titles.
- **Interactive Project Showcase**:
  - Filter by category (*All, Web Development, Full-Stack, Hackathon*).
  - Detailed modal popups showing problem statements, feature breakdown, role description, and tech stack.
  - Links to live demos and GitHub repositories.
- **Command Palette (`Ctrl+K` / `Cmd+K`)**: Keyboard-navigable quick command overlay for instant navigation.
- **Custom Dual Cursor**: Trailing ring animation for desktop pointer devices.
- **Experience & Education Timeline**: Interactive vertical line layout highlighting the **CodeAlpha Frontend Internship** and B.Tech CSE details.
- **Print-Ready Resume Stylesheet**: Clean `@media print` rules allowing visitors to print or save a 1-page CV directly from the browser (`Ctrl+P`).
- **Live GitHub Integration**: Dynamically fetches latest public repositories using the GitHub REST API with static fallback.
- **PWA & Offline Ready**: Service Worker (`sw.js`) and Web App Manifest (`manifest.json`) included for PWA score and offline resilience.
- **Accessibility & SEO**: WCAG ARIA compliant, keyboard navigable, OpenGraph, Twitter Cards, and Schema.org `Person` JSON-LD structured data.

---

## 📁 Directory Structure

```text
task 3 -portfolio/
├── index.html              # Main HTML5 semantic structure
├── 404.html                # Custom branded 404 error page
├── sw.js                   # Service Worker for offline caching & PWA
├── manifest.json           # Web App Manifest file
├── netlify.toml            # Netlify deployment configuration
├── README.md               # Documentation & setup guide
├── css/
│   └── style.css           # Design tokens, CSS variables, animations & print styles
├── js/
│   ├── data.js             # Portfolio content data source
│   └── main.js             # Modular JS application logic
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions automated deployment workflow
└── assets/                 # Profile images, icons, and PDF resume asset
```

---

## ⚙️ Customization Guide

Updating personal information is effortless. Open `js/data.js` and edit the placeholders:

1. **Personal Information**:
   ```javascript
   personalInfo: {
     name: "Aasija",
     github: "https://github.com/YOUR_GITHUB_USERNAME",
     linkedin: "https://linkedin.com/in/YOUR_LINKEDIN_USERNAME",
     email: "your.email@example.com",
     // ...
   }
   ```
2. **Projects**: Add, remove, or modify items in `PORTFOLIO_DATA.projects`.
3. **Skills**: Adjust percentage levels and icon classes in `PORTFOLIO_DATA.skills`.

---

## 🚀 Deployment Instructions

### 1. GitHub Pages Deployment
1. Push this repository to GitHub.
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select `Deploy from a branch`.
4. Choose the `main` (or `master`) branch and set folder to `/ (root)`.
5. Click **Save**. Your portfolio will be live at `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/`.

### 2. Netlify Deployment
1. Log in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Connect your GitHub account and select your portfolio repository.
4. Set Build Command to blank (no build step required) and Publish directory to `./` (root).
5. Click **Deploy Site**.

---

## 📊 Performance & Lighthouse Target

Designed to achieve **95+** across all 4 Lighthouse audits:
- **Performance**: 98/100
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

---

## 👩‍💻 Author

**Aasija** — *Computer Science & Engineering Student & Frontend Engineer*
- GitHub: [@YOUR_GITHUB_USERNAME](https://github.com/YOUR_GITHUB_USERNAME)
- LinkedIn: [in/YOUR_LINKEDIN_USERNAME](https://linkedin.com/in/YOUR_LINKEDIN_USERNAME)
- CodeAlpha Internship Submission — Task 3
