import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(async ({ mode }) => {
  const plugins = [react({ fastRefresh: true }), tailwindcss()];

  try {
    const { visualizer } = await import('rollup-plugin-visualizer');
    if (mode === 'analyze') {
      plugins.push(
        visualizer({
          filename: './dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          template: 'treemap'
        })
      );
    }
  } catch {
    // Optional dependency: rollup-plugin-visualizer
  }

  try {
    const module = await import('vite-plugin-compression');
    const viteCompression = module.default;
    plugins.push(
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz'
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br'
      })
    );
  } catch {
    // Optional dependency: vite-plugin-compression
  }

  return {
    plugins,
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
            return undefined;
          }
        }
      }
    },
    server: {
      port: 3000,
      hmr: { overlay: false },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    }
  };
});
