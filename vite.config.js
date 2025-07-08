import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    commonjs(),
    crossOriginIsolation(),
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
    plugins: () => [commonjs()],
    rollupOptions: {
      output: {
        entryFileNames: 'worker/[name].js',
      },
    },
  },
  build: {
    lib: {
      formats: ['es'],
      entry: 'src/index.js',
      name: 'piper-tts-web',
    },
  },
})
