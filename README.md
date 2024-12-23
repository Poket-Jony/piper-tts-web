# Piper-TTS-Web
[![Latest Release](https://img.shields.io/github/release/Poket-Jony/piper-tts-web.svg?style=flat&color=blue)](https://github.com/Poket-Jony/piper-tts-web/releases/latest)
[![GitHub stars](https://img.shields.io/github/stars/Poket-Jony/piper-tts-web?style=flat&color=brightgreen)](https://github.com/Poket-Jony/piper-tts-web/stargazers)
[![Downloads](https://img.shields.io/npm/dt/piper-tts-web?color=brightgreen)](https://github.com/Poket-Jony/piper-tts-web/releases/latest)
[![Open Issues](https://img.shields.io/github/issues-raw/Poket-Jony/piper-tts-web.svg?style=flat&color=yellowgreen)](https://github.com/Poket-Jony/piper-tts-web/issues?q=is%3Aopen+is%3Aissue)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/Poket-Jony/piper-tts-web.svg?style=flat&color=brightgreen)](https://github.com/Poket-Jony/piper-tts-web/issues?q=is%3Aissue+is%3Aclosed)

> Web version of [rhasspy/piper](https://github.com/rhasspy/piper) running locally in the browser.

## Features
- Phoneme Generation
- WAV Audio Output
- Expression / Emotions Generation
- WebWorker Support

## Install
```shell
npm install piper-tts-web
```

To use PiperTTS client-side in your project, copy the neccessary files into your public directory.

If you're using Webpack, you need to install the [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) and modify your config like this:
```javascript
const nextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: 'node_modules/piper-tts-web/dist/onnx',
            to: '../public/'
          },
          {
            from: 'node_modules/piper-tts-web/dist/piper',
            to: '../public/'
          },
          {
            src: 'node_modules/piper-tts-web/dist/worker',
            dest: '../public/'
          },
        ],
      })
    );
    return config;
  },
};
```

For Vite use [vite-plugin-static-copy](https://www.npmjs.com/package/vite-plugin-static-copy) and modify your config like this:
```javascript
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/piper-tts-web/dist/onnx',
          dest: '.'
        },
        {
          src: 'node_modules/piper-tts-web/dist/piper',
          dest: '.'
        },
        {
          src: 'node_modules/piper-tts-web/dist/worker',
          dest: '.'
        },
      ]
    }),
  ],
});
```

Other build tools may require different configurations, so check which one you're using and figure out how to copy files to your public directory if you don't know how to do it.

## Usage
**Basic:**
```javascript
import { PiperWebEngine } from 'piper-tts-web';

const engine = new PiperWebEngine();

const text = 'This is a test!';
const voice = 'en_US-libritts_r-medium';
const speaker = 0;

const response = await engine.generate(text, voice, speaker);
console.log(response);

const expressions = await engine.expressions(response.phonemeData);
console.log(expressions);
```

**Basic with WebGPU:**
```javascript
import { PiperWebEngine, OnnxWebGPURuntime } from 'piper-tts-web';

const engine = new PiperWebEngine({
  onnxRuntime: new OnnxWebGPURuntime(),
});

const text = 'This is a test!';
const voice = 'en_US-libritts_r-medium';
const speaker = 0;

const response = await engine.generate(text, voice, speaker);
console.log(response);

const expressions = await engine.expressions(response.phonemeData);
console.log(expressions);
```

**Advanced with WebWorker, WebGPU and VoiceProvider:**
```javascript
import { PiperWebWorkerEngine, OnnxWebGPUWorkerRuntime, HuggingFaceVoiceProvider } from 'piper-tts-web';

const voiceProvider = new HuggingFaceVoiceProvider();
const voices = await voiceProvider.list();
console.log(voices);

const engine = new PiperWebWorkerEngine({
  onnxRuntime: new OnnxWebGPUWorkerRuntime(),
  voiceProvider,
});

const text = 'This is a test!';
const voice = 'en_US-libritts_r-medium';
const speaker = 0;

const response = await engine.generate(text, voice, speaker);
console.log(response);

const expressions = await engine.expressions(response.phonemeData);
console.log(expressions);
```

Take also a look at the [example](./index.html) for more details.

## Development
**Vite Dev Server:**
```shell
npm run dev
```

**Vite Build Distribution:**
```shell
npm run build
```

**Build Piper-Phonemize with Docker:**
```shell
npm run build:phonemize
```

## Credits
piper-tts-web:
- Jonas Plamann [[@Poket-Jony](https://github.com/Poket-Jony)]

piper-wasm:
- Jozef Chutka [[@jozefchutka](https://github.com/jozefchutka)]
- David Christ [[@DavidCks](https://github.com/DavidCks)]

vits-web:
- Konstantin Paulus [[@k9p5](https://github.com/k9p5)]

## License
MIT
