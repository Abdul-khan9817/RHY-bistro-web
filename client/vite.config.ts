import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const port = Number(process.env.PORT || '5173');

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
      '@assets': path.resolve(import.meta.dirname, 'public/assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    // Enable source maps for production error tracking (separate file, not inline)
    sourcemap: false,
    // Minification settings
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Ensure hashed filenames for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          // recharts + d3 are admin-only — keep them separate (lazy-loaded)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // framer-motion used on public pages — preloaded
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Radix UI components — preloaded
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // i18n libraries
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n';
          }
          // zod — used on both client forms and server validation shape (already chunked by Vite)
          if (id.includes('node_modules/zod')) {
            return 'zod';
          }
          return undefined;
        },
        // Prevent modulepreload injection for admin-only chunks
        experimentalMinChunkSize: 1000,
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
  },
});
