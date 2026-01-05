import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'NodeGraph',
      fileName: 'nodegraph'
    },
    rollupOptions: {
      output: {
        assetFileNames: 'nodegraph.[ext]'
      }
    }
  },
  server: {
    open: true
  }
});
