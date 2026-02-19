// vite.config.js
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    // Bundle analysis visualization
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './js'),
      '@core': path.resolve(__dirname, './js/core'),
      '@screens': path.resolve(__dirname, './js/screens'),
      '@data': path.resolve(__dirname, './js/data'),
      '@utils': path.resolve(__dirname, './js/utils'),
    },
  },

  server: {
    open: true, // Automatically open in browser
  },

  build: {
    outDir: 'dist',
    sourcemap: mode === 'production' ? 'hidden' : true,

    // Chunk size warning limit
    chunkSizeWarningLimit: 500,

    // Minification configuration
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },

    // Rollup options for code splitting and asset organization
    rollupOptions: {
      output: {
        // Manual chunks for code splitting
        manualChunks(id) {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }

          // Game core chunk for game logic modules
          if (id.includes('/js/core/game/')) {
            return 'game-core';
          }

          // Don't manually chunk screens - let dynamic imports create their own chunks
          // UI utilities chunk
          if (id.includes('/js/utils/ui.js')) {
            return 'ui';
          }
        },

        // Asset file naming and organization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Inline assets smaller than 4KB
    assetsInlineLimit: 4096,
  },
}));
