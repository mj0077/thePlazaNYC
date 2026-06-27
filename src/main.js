/* ═══════════════════════════════════════════════════
   THE PLAZA RESIDENCES — Canvas Sequence Engine
   ═══════════════════════════════════════════════════ */

const SEQ1_FRAMES = 240;
const SEQ2_FRAMES = 141;
const TOTAL_FRAMES = SEQ1_FRAMES + SEQ2_FRAMES; // 381
const PRELOAD_COUNT = 40;
const CACHE_WINDOW = 150; // Keep 150 frames in memory to prevent mobile crashes
const LERP_FACTOR = 0.25;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');

const imageCache = new Map();
const pendingLoads = new Set();
let currentFrame = 0;
let targetFrame = 0;
let scrollHeight = 0;
let isPreloaderDone = false;
let isReducedMotion = false;
let rafId = null;

// Horizontal slider state — captured once during init, read every RAF.
let sliderSection = null;
let sliderTrack = null;

function getFrameUrl(index) {
  const seq = index < SEQ1_FRAMES ? 'sequence' : 'sequence2';
  const frameNum = index < SEQ1_FRAMES ? index + 1 : index - SEQ1_FRAMES + 1;
  return `/${seq}/ezgif-frame-${String(frameNum).padStart(3, '0')}.jpg`;
}

function loadImage(index) {
  if (imageCache.has(index)) return Promise.resolve(imageCache.get(index));
  if (pendingLoads.has(index)) return Promise.resolve();

  pendingLoads.add(index);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = getFrameUrl(index);
    img.onload = () => {
      imageCache.set(index, img);
      pendingLoads.delete(index);

      // If the image just loaded is very close to where the user is looking, force a redraw
      if (Math.abs(index - Math.round(currentFrame)) < 2) {
        drawFrame(currentFrame);
      }
      resolve(img);
    };
    img.onerror = () => {
      pendingLoads.delete(index);
      reject(new Error(`Failed to load frame ${index}`));
    };
  });
}

async function runPreloader() {
  const promises = [];
  for (let i = 0; i < PRELOAD_COUNT; i++) {
    promises.push(
      loadImage(i).then(() => {
        const progress = ((i + 1) / PRELOAD_COUNT) * 100;
        if (preloaderBar) {
          preloaderBar.style.width = `${progress}%`;
          preloaderBar.parentElement.setAttribute('aria-valuenow', Math.round(progress));
        }
      }).catch(e => console.warn(e))
    );
  }
  await Promise.allSettled(promises);
}

function dismissPreloader() {
  isPreloaderDone = true;
  if (preloader) preloader.classList.add('is-done');
  drawFrame(0);
}

// ─── Priority Frame Loader ───
// Loads frames dynamically based on scroll position instead of sequential queue
let currentLoadCenter = -1;
function manageFrameLoading() {
  const center = Math.round(targetFrame);
  if (Math.abs(center - currentLoadCenter) < 5) return; // Only update window if moved by 5 frames
  currentLoadCenter = center;

  // Load a window around current position (10 behind, 30 ahead)
  const min = Math.max(0, center - 10);
  const max = Math.min(TOTAL_FRAMES - 1, center + 30);

  for (let i = min; i <= max; i++) {
    if (!imageCache.has(i) && !pendingLoads.has(i)) {
      loadImage(i);
    }
  }
}

function evictDistantFrames() {
  if (imageCache.size <= CACHE_WINDOW) return;
  const center = Math.round(currentFrame);
  const halfWindow = Math.floor(CACHE_WINDOW / 2);
  const minKeep = Math.max(0, center - halfWindow);
  const maxKeep = Math.min(TOTAL_FRAMES - 1, center + halfWindow);

  for (const key of imageCache.keys()) {
    if (key < PRELOAD_COUNT) continue; // Keep initial frames for fast scroll back
    if (key < minKeep || key > maxKeep) {
      imageCache.delete(key);
    }
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawFrame(index) {
  const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
  const img = imageCache.get(clampedIndex);
  if (!img) return; // If not loaded yet, wait for priority loader to trigger redraw

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth || 1920;
  const ih = img.naturalHeight || 1080;

  const scale = Math.max(cw / iw, ch / ih);
  const sw = iw * scale;
  const sh = ih * scale;
  const sx = (cw - sw) / 2;
  const sy = (ch - sh) / 2;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, sx, sy, sw, sh);
}

function updateTargetFrame() {
  const scrollContent = document.getElementById('scroll-content');
  if (!scrollContent) return;

  scrollHeight = scrollContent.offsetHeight - window.innerHeight;
  if (scrollHeight <= 0) return;

  const scrollY = window.scrollY;
  const scrollFraction = Math.max(0, Math.min(1, scrollY / scrollHeight));
  targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function animationLoop() {
  if (!isPreloaderDone) {
    rafId = requestAnimationFrame(animationLoop);
    return;
  }

  updateTargetFrame();
  manageFrameLoading(); // Ensure frames around target are loading

  const prev = currentFrame;
  currentFrame = lerp(currentFrame, targetFrame, LERP_FACTOR);

  if (Math.abs(currentFrame - prev) > 0.05) {
    drawFrame(currentFrame);
  }

  if (Math.round(currentFrame) % 15 === 0) {
    evictDistantFrames();
  }

  updateParallax();
  updateHorizontalSlider();
  updateHeader(); // New header scroll state
  rafId = requestAnimationFrame(animationLoop);
}

function updateParallax() {
  const sections = document.querySelectorAll('.scroll-section__inner');
  sections.forEach(section => {
    const rect = section.parentElement.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const parallaxOffset = centerOffset * 0.15;
    section.style.transform = section.classList.contains('visible')
      ? `translateY(${parallaxOffset}px)`
      : `translateY(${30 + parallaxOffset}px)`;
  });
}

// Translate the slider track horizontally as the user scrolls vertically
// through the .iconic-spaces section. Mirrors updateParallax(): one rect
// read per frame, hardware-accelerated transform only — never scroll-jacks.
function updateHorizontalSlider() {
  if (!sliderSection || !sliderTrack) return;
  const rect = sliderSection.getBoundingClientRect();

  // 0 when the section's top edge reaches viewport top;
  // 1 when the section's bottom edge reaches viewport bottom.
  const rawProgress = -rect.top / (rect.height - window.innerHeight);
  const progress = Math.max(0, Math.min(1, rawProgress));

  const travel = sliderTrack.scrollWidth - window.innerWidth;
  if (travel <= 0) return; // track fits in viewport — nothing to translate
  sliderTrack.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
}

function updateHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

function initObservers() {
  const fadeElements = document.querySelectorAll('[data-fade]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  fadeElements.forEach(el => observer.observe(el));
}

function initFormValidation() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const nameInput = document.getElementById('form-name');
    const nameError = document.getElementById('form-name-error');
    if (!nameInput.value.trim()) {
      nameError.textContent = 'Please enter your name.';
      isValid = false;
    } else { nameError.textContent = ''; }

    const emailInput = document.getElementById('form-email');
    const emailError = document.getElementById('form-email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    } else { emailError.textContent = ''; }

    if (isValid) {
      const btn = document.getElementById('form-submit-btn');
      btn.textContent = 'Thank You';
      btn.style.background = 'var(--color-green)';
      btn.style.color = 'var(--color-cream)';
      btn.disabled = true;
      form.reset();
    }
  });
}

function initTabs() {
  const tabs = document.querySelectorAll('.suite-tab');
  const panels = document.querySelectorAll('.suite-panel');

  if (tabs.length === 0 || panels.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      // Add active to clicked
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetId = tab.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

function initHorizontalSlider() {
  sliderSection = document.querySelector('.iconic-spaces');
  sliderTrack = document.querySelector('.iconic-spaces__track');
  if (!sliderSection || !sliderTrack) return;

  // Establish initial transform (no-op until the user scrolls to the section).
  updateHorizontalSlider();

  // Re-measure travel distance whenever the viewport changes.
  window.addEventListener('resize', updateHorizontalSlider, { passive: true });
}

function checkReducedMotion() {
  isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion && preloader) {
    preloader.style.display = 'none';
    isPreloaderDone = true;
    loadImage(0).then(() => drawFrame(0));
  }
}

async function init() {
  checkReducedMotion();
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); drawFrame(currentFrame); });
  initObservers();
  initFormValidation();
  initTabs();
  initHorizontalSlider();

  if (!isReducedMotion) {
    await runPreloader();
    dismissPreloader();
  }
  animationLoop();
}

init();
