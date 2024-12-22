import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    commonjs(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: 'onnx'
        },
        {
          src: 'build/piper_phonemize.wasm',
          dest: 'piper'
        },
        {
          src: 'build/piper_phonemize.data',
          dest: 'piper'
        },
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'piper-tts-web',
    },
  },
})
