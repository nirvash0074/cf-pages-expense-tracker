import { defineConfig } from 'vite';

// Minimal Vite config (ESM) to avoid @cloudflare/vite-plugin auto-config issues during Pages build.
// This file intentionally does not import @cloudflare/vite-plugin.
export default defineConfig({
  build: {
    outDir: 'dist'
  }
});
