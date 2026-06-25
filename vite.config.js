import { defineConfig } from 'vite';

export default defineConfig({
  // The public/ directory (containing sequence/ and sequence2/) is served as-is.
  // No special config needed — Vite's default handles this correctly.
  server: {
    open: true,
  },
  build: {
    // Inline small assets, keep images external
    assetsInlineLimit: 0,
  },
});
