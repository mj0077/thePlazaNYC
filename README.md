# The Plaza Residences — Interactive Web Experience

> **New York’s most legendary address, reimagined for private living.**
> An immersive, high-end interactive scroll-driven digital showcase for the residences of The Plaza (A Fairmont Managed Hotel) at Fifth Avenue & Central Park South.

[![Live Experience](https://img.shields.io/badge/Experience-Live-gold.svg?style=flat-square)](#) 
[![Tech Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20CSS3%20%7C%20HTML5%20Canvas-black.svg?style=flat-square)](#)
[![Vite](https://img.shields.io/badge/Tooling-Vite%208-blue.svg?style=flat-square)](#)

---

## 🏛️ Project Overview

This repository houses the source code for **The Plaza Residences** immersive web experience. Acting as a digital concierge, the site translates the architectural presence, historical weight, and interior luxury of The Plaza into a seamless, scroll-linked digital journey. 

Using native, hardware-accelerated scroll interactions, users embark on a cinematic transition—starting from the golden-hour Beaux-Arts exterior facade, moving fluidly through the iconic revolving doors, and stepping into the warm, chandelier-lit grand lobby.

---

## ✨ Key Features

### 1. Cinematic Scroll-Linked Canvas Engine
* **Double-Sequence Orchestration:** Blends two distinct image sequences (381 high-quality frames in total) seamlessly.
* **Proximity-Based Priority Loading:** Rather than loading a massive sequential queue, the engine dynamically loads frames within a moving window relative to the user's active scroll viewport (10 frames behind, 30 frames ahead).
* **Smart Memory Eviction:** Keeps a maximum of 150 frames in memory to prevent browser crashes, memory leaks, and performance degradation—particularly optimized for mobile devices.
* **Linear Interpolation (`lerp`):** Computes frame targets with smooth easing on scroll release (`LERP_FACTOR = 0.25`), creating a silky, responsive animation instead of standard step-wise transitions.

### 2. Luxury Branded Preloader
* Preloads the initial frame buffer dynamically with a styled progress bar reflecting the hotel's founding history (`Est. 1907`).
* Automatically fades out and triggers the main canvas transition as soon as the priority threshold is met.

### 3. High-End Editorial Layouts
* **Culinary Signatures:** Interactive gallery showcasing The Palm Court under its legendary stained-glass dome, The Champagne Bar, and The Rose Club.
* **The Private Collection (Interactive Suites):** A tabbed showcase highlighting premium layouts (The Royal Plaza Suite, The Fitzgerald Suite, and the Park View Penthouse) with smooth visual filters.
* **Wellness Sanctuary:** Spotlight on the Guerlain Spa at The Plaza featuring Parisian skin therapies.
* **Heritage Timeline:** A vertical timeline tracking key milestones in The Plaza's history (1907 Opening, 1925 Fitzgerald era, 1966 Black and White Ball).
* **Bento Grid Amenities:** A structural grid showing amenities (White Glove Service, Spa, Culinary, Fitness, Legacy).

### 4. Typography & Brand Guidelines
* **Color Palette:** Pure luxury. Deep onyx black background (`#0a0a0a`), warm cream (`#f5f2eb`), refined gold accents (`#d4af37`), and a deep, historic Plaza green (`#1a3325`).
* **Typography Pairing:** High-contrast display pairing utilizing **Bodoni Moda** (display serif with tracked-wide letters) and **Montserrat** (geometric sans-serif for legible interface elements).
* **Fluid Layouts:** Responsive typography scaled dynamically via CSS variables and `clamp()`, ensuring readability across mobile, tablet, and ultra-wide screens without resizing scripts.

### 5. Accessibility & Motion Fallbacks
* **WCAG 2.1 AA Compliant:** High color contrast ratios, clear interactive states, and proper ARIA role mapping.
* **Prefers-Reduced-Motion Support:** Detects user motion preferences and automatically bypasses the intensive canvas rendering in favor of a clean, fade-based static layout.

---

## 🛠️ Tech Stack & Tooling

To ensure maximum performance, pixel precision, and minimal bundle sizes, this project uses a bespoke, framework-less architecture:

* **Core Logic:** Vanilla JavaScript (ES6 Modules)
* **Rendering:** HTML5 Canvas API with hardware-accelerated 2D context
* **Styles:** Native Vanilla CSS with CSS Custom Properties and Flexbox/Grid layouts
* **Build System & Dev Server:** Vite 8.x for instant hot-module reloading and optimized static asset packaging

---

## 📂 Project Structure

```bash
├── public/                 # Static assets directory
│   ├── favicon.svg         # Site logo favicon
│   ├── icons.svg           # Scalable vector graphics icons
│   ├── images/             # Premium editorial photos (Suites, Palm Court, Spa)
│   ├── sequence/           # Frames 1-240 (Golden hour exterior -> revolving doors)
│   └── sequence2/          # Frames 241-381 (Entering the Grand Lobby interior)
├── src/
│   ├── main.js             # Canvas engine, observers, tabs, form validation
│   └── style.css           # Typography system, components, bento layout, animations
├── index.html              # Main page markup with structured SEO metadata
├── vite.config.js          # Vite config module
├── package.json            # Scripts and dev dependencies
└── README.md               # Repository documentation
```

---

## 🚀 Getting Started

Follow these steps to run the experience locally:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mj0077/thePlazaNYC.git
   cd thePlazaNYC
   ```

2. Install the dev dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the Vite development server:
```bash
npm run dev
```
Open the printed local URL (typically `http://localhost:5173`) in your web browser.

### Building for Production
To bundle and optimize the files:
```bash
npm run build
```
This outputs a fully static production bundle into the `/dist` directory.

### Preview Production Build
To preview the generated production build locally:
```bash
npm run preview
```

---

## 🔒 Private Inquiry Validation
The inquiry form contains native validation logic. It checks for full-name, email formats using regex, and alerts users via localized UI messages. Upon successful submission, the button shifts to a gold-gilded "Thank You" message and resets the form input fields safely.
