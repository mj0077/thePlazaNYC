# Immersive Luxury Showcase for The Plaza Residences

Initialize a premium, high-end real estate showcase web application for "The Plaza Residences" utilizing the provided 480-frame image sequences to create a seamless scroll-driven cinematic animation.

## Design Read

Reading this as: **Luxury real estate/hospitality landing page for The Plaza (a Fairmont Managed Hotel), requiring an elegant, historic, and cinematic editorial vibe.** We will use native CSS + custom canvas scroll rendering. The aesthetic must respect The Plaza's heritage: Beaux-Arts elegance, deep charcoal/black, rich gold, cream, and the iconic Plaza green (echoing its roof and awnings), using high-contrast serif typography paired with a geometric luxury sans-serif.

## Core Settings

*   **DESIGN_VARIANCE:** `7` — Asymmetrical layouts, editorial typography overlays, premium spacing
*   **MOTION_INTENSITY:** `8` — Cinematic scroll-driven image sequence scrubbing on `<canvas>` with smooth interpolations
*   **VISUAL_DENSITY:** `3` — Airy luxury editorial showcase, generous whitespace, focused text content

---

## Brand Identity & Aesthetic Alignment

### Typography
*   **Display Serif (The Voice):** **Bodoni Moda** — high-contrast, elegant, timeless. Wide letter-spacing on display headings (`letter-spacing: 0.08em` to `0.12em`) to let the typography breathe, per the `/development` spec.
*   **Functional Sans (The Function):** **Montserrat** — geometric, clean, high-legibility for navigation, micro-copy, and body.
*   **Fluid Scaling:** All typography uses `clamp()` for viewport-based sizing. Zero JavaScript overhead. Example: `font-size: clamp(2.5rem, 5vw + 1rem, 6rem)` for hero headlines.

### Color Palette
| Token | Hex | Role |
|---|---|---|
| **Onyx** | `#0a0a0a` | Primary backgrounds, deep cinematic drama |
| **Cream** | `#fbf8f1` | Primary text on dark, light section backgrounds |
| **Rich Gold** | `#c5a880` | Highlights, progress bar, accents, CTA hover states |
| **Plaza Green** | `#1e352a` | **Subtle accent only** — nav hover underlines, form focus rings, thin section dividers. Not a section background. |

> [!NOTE]
> This palette is an intentional exception to the anti-slop default palette ban. These are the literal, historic brand colors of The Plaza Hotel, derived from its gold-leaf interiors, Breccia marble, cream stone facade, and iconic green copper roof.

### Shadow Strategy
Floating UI elements (nav bar, form card, CTAs) use multi-layered, warm-tinted, heavily diffused `box-shadow`:
```css
box-shadow: 0 8px 32px rgba(10, 10, 10, 0.25),
            0 2px 8px rgba(197, 168, 128, 0.08);
```
No pure-black drop shadows. No sharp edges.

---

## Finalized Decisions

### Decision 1: Sequence Transition → Clean Cut
At the boundary between Sequence 1 (frame 240) and Sequence 2 (frame 1), we use a **direct frame swap with no transition effect**. The user has confirmed the two sequences align head-on at the boundary. The canvas simply switches from drawing Sequence 1's last frame to Sequence 2's first frame — zero compositing overhead, zero visual artifact.

### Decision 2: Luxury Preloader → Plaza Monogram + Gold Progress Bar
A theatrical, branded preloader experience:
1. Full-viewport deep onyx (`#0a0a0a`) background.
2. Centered Plaza-style monogram or "THE PLAZA" in Bodoni Moda, cream text, wide tracking.
3. Thin gold (`#c5a880`) horizontal progress bar beneath the monogram.
4. Progress bar fills as the first 40 frames of Sequence 1 are preloaded.
5. Once buffered, the preloader fades out with a smooth opacity+scale transition (1.5s ease).
6. Remaining frames load silently in the background via a priority queue.

### Decision 3: Plaza Green → Subtle Accent Only
Plaza Green (`#1e352a`) is used exclusively as:
- Nav link hover underline color
- Form input focus ring color
- Thin horizontal dividers between editorial sections
- Never as a section background. The palette stays black/cream/gold for maximum dramatic restraint.

---

## Engineering Strategy & Caveats

> [!CAUTION]
> **Mobile Memory Limits (Canvas Image Decodes):**
> Storing 480 high-res `Image` objects in memory simultaneously could consume ~1GB of decoded bitmap RAM, causing iOS Safari to crash.
> *Solution:* Implement a **rolling image cache** — keep only ~60 frames around the current scroll position in memory. Frames outside the window are released. New frames are loaded via `Image.decode()` ahead of scroll direction.

> [!IMPORTANT]
> **LCP Strategy with Luxury Preloader:**
> The preloader itself IS the LCP element. The monogram text renders instantly (it's HTML/CSS, no image dependency). Frame 1 of Sequence 1 loads behind the preloader as part of the initial batch. When the preloader fades out, the canvas is already showing the first frame — zero flash of empty content.

> [!WARNING]
> **Scroll-Driven, NOT Scroll-Jacked:**
> Per the `/development` spec: "Never hijack the native browser scrollbar." The user always controls scroll velocity. We use `requestAnimationFrame` to read `window.scrollY` and map it to a frame index via `lerp` interpolation. No `scrollTo()`, no `overflow: hidden` tricks, no momentum override.

### Parallax on Text Overlays
Text overlay sections move at `0.85×` scroll speed relative to the canvas background at `1.0×`. Implemented via CSS `transform: translateY()` driven by scroll position — hardware-accelerated, no layout thrash. Creates subtle depth without competing with the cinematic canvas.

### `prefers-reduced-motion` Fallback
When active:
- Canvas shows a static hero image (Frame 1 of Sequence 1) — no scroll animation.
- Text overlays use instant `opacity` transitions (no translateY parallax).
- Preloader is skipped entirely — static page loads immediately.

---

## Proposed Changes

### Configuration and Project Setup

#### [NEW] [package.json](file:///Users/mac/projects/propertyWeb/package.json)
Initialize npm package with Vite as the dev server and builder. No framework dependencies — vanilla HTML/CSS/JS.

#### [NEW] [vite.config.js](file:///Users/mac/projects/propertyWeb/vite.config.js)
Simple Vite config for static asset handling. The `public/` directory (containing both image sequences) is served as-is.

---

### Core Structure and Interface

#### [NEW] [index.html](file:///Users/mac/projects/propertyWeb/index.html)
Semantic HTML5 structure:
*   `<div id="preloader">` — Luxury preloader with monogram + progress bar.
*   `<canvas id="canvas">` — Fixed-position, full-viewport canvas for sequence playback.
*   `<main>` — Scroll container with editorial sections:
    *   Hero text overlay ("The Plaza Residences" headline, wide-tracked Bodoni Moda).
    *   "A Legacy of Elegance" editorial section with parallax text.
    *   "Enter The Plaza" transition moment (aligned with sequence boundary).
    *   "Residence Features" bento grid with warm-tinted shadow cards.
    *   "Private Inquiry" contact form with Plaza Green focus states.
    *   Footer with address, contact, and brand attribution.
*   Proper `<meta>` tags for SEO, viewport, and Open Graph.

#### [NEW] [src/style.css](file:///Users/mac/projects/propertyWeb/src/style.css)
*   Google Fonts import: Bodoni Moda (display) + Montserrat (functional).
*   CSS custom properties for the full color palette.
*   `clamp()`-based fluid typography scale.
*   Wide `letter-spacing` on display serif headings.
*   Multi-layered warm-tinted `box-shadow` for floating UI.
*   `prefers-reduced-motion` fallback block.
*   `prefers-color-scheme` — dark by default (the cinematic experience demands it).
*   Responsive grid for bento amenities section.
*   Form styling with Plaza Green focus rings.

#### [NEW] [src/main.js](file:///Users/mac/projects/propertyWeb/src/main.js)
*   **Preloader:** Load first 40 frames → update progress bar → fade out preloader.
*   **Rolling image cache:** ~60-frame window around current position. Background queue loads remaining frames.
*   **Canvas rendering:** `requestAnimationFrame` loop, `drawImage` with cover-fit aspect ratio math.
*   **Scroll mapping:** `window.scrollY` → frame index (0–479) via `lerp` for buttery interpolation.
*   **Sequence boundary:** Clean cut at frame 240 — direct swap from Sequence 1 to Sequence 2 array.
*   **Text parallax:** `IntersectionObserver` for visibility + scroll-driven `translateY` at 0.85× rate.
*   **Form validation:** Client-side validation with accessible error messaging.

---

### CLAUDE.md Update

#### [MODIFY] [CLAUDE.md](file:///Users/mac/projects/propertyWeb/CLAUDE.md)
Resolve contradictions:
*   Typography: Update from "Playfair Display & Inter" → "Bodoni Moda & Montserrat".
*   Preloader: Update from "preloads first 40 frames" → "luxury preloader with monogram + gold progress bar, preloads first 40 frames, then fades out theatrically."

---

## Verification Plan

### Automated Verification
*   `npm run build` — verify zero errors, clean production bundle.

### Manual Verification
*   Start dev server (`npm run dev`).
*   **Preloader test:** Verify monogram renders instantly, gold bar fills, fade-out is smooth.
*   **Scroll test:** Verify Sequence 1 plays smoothly from sky to entrance (0–240).
*   **Transition test:** Verify cross-fade at frame 240 is invisible.
*   **Sequence 2 test:** Verify lobby interior plays smoothly (241–480).
*   **Parallax test:** Verify text overlays move at 0.85× relative to canvas.
*   **Responsive test:** Verify bento grid collapses gracefully on mobile.
*   **Form test:** Verify focus rings are Plaza Green, validation works.
*   **Reduced motion test:** Toggle `prefers-reduced-motion: reduce` in DevTools, verify static fallback.
*   **Memory test:** Open Safari on iOS, scroll full page, verify no crash (rolling cache works).
