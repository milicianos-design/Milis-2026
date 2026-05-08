import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        foro: resolve(__dirname, 'foro.html'),
        biencomun: resolve(__dirname, 'bien-comun-2026.html'),
        piergiorgio: resolve(__dirname, 'pier_giorgio.html'),
        promesas: resolve(__dirname, 'promesas.html'),
        stacatalina: resolve(__dirname, 'sta_catalina.html'),
        forostitch: resolve(__dirname, 'foro-stitch.html')
      }
    }
  }
});
