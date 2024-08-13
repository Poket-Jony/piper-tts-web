# Piper Wasm

The files in `/build` were generated using the steps proposed by [wide-video / piper-wasm](https://github.com/wide-video/piper-wasm).

## Usage

To use PiperTTS client-side in your project, copy the neccessary files into your public directory. If you're using Webpack and NextJS, you need to install the `copy-webpack-plugin` as a dev dependency and modify your config like this:

```js
const nextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "node_modules/piper-wasm/build/piper_phonemize.wasm",
            to: "../public/",
          },
          {
            from: "node_modules/piper-wasm/build/piper_phonemize.data",
            to: "../public/",
          },
          {
            from: "node_modules/piper-wasm/build/piper_phonemize.js",
            to: "../public/",
          },
          {
            from: "node_modules/piper-wasm/build/worker/piper_worker.js",
            to: "../public/",
          },
          {
            from: "node_modules/piper-wasm/espeak-ng/espeak-ng-data/voices",
            to: "../public/espeak-ng-data/voices",
          },
          {
            from: "node_modules/piper-wasm/espeak-ng/espeak-ng-data/lang",
            to: "../public/espeak-ng-data/lang",
          },
          // onnx runtime stuff
          {
            from: "node_modules/piper-wasm/build/worker/dist",
            to: "../public/dist",
          },
          // only needed if you need to know the emotion of the speaker
          {
            from: "node_modules/piper-wasm/build/worker/expression_worker.js",
            to: "../public/",
          },
        ],
      })
    );
    return config;
  },
  ...
};
```

Other build tools may require different configurations, so check which one you're using and figure out how to copy files to your public directory if you don't know how to do it.

Make sure that all files and directories listed share the same parent route:

```yml
- some-route
  - piper_phonemize.wasm
  - piper_phonemize.data
  - piper_phonemize.js
  - piper_worker.js
  - espeak-ng-data
    - voices
    - lang
  - expression_worker.js  # optional
  - dist
    - {onnx-runtime-stuff}
```

Then, you can import the `piperGenerate` function to generate audio. If you want to use the models hosted in the Rhasppy HuggingFace repository, you can also import `HF_BASE`, which is the base URL for the models, and append the model path. Here's an example of how to generate audio:

```js
import { piperGenerate } from "piper-wasm";

const data = await piperGenerate(
  "piper_phonemize.js",
  "piper_phonemize.wasm",
  "piper_phonemize.data",
  "piper_worker.js",
  `${HF_BASE}en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx`,
  `${HF_BASE}en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx.json`,
  307,
  text,
  (progress) => { },
  null,
  false
);
```

`data` gives you the Blob URL of the generated audio, along with some other information. You can use this URL to play the audio in your application like so:

```js
const audio = new Audio(data.file);
audio.play();
```

If you only need the phonemes, you can use the `piperPhonemize` function instead:

```js
const { phonemes, phonemeIds } = await piperPhonemize(
  "piper_phonemize.js",
  "piper_phonemize.wasm",
  "piper_phonemize.data",
  "piper_worker.js",
  `${HF_BASE}en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx`,
  text,
  (progress) => {},
);
```

Read the JSDoc comments for the functions for more info.

## NextJS config

One opt-in feature of this package is emotion inference from audio. It uses the transformers.js library for that, which doesn't play nicely with NextJS out of the box.
If you've gotten this far, you're probably seeing an error message like this:

```txt
Module parse failed: Unexpected character '�' (1:0)
You may need an appropriate loader to handle this file type, ...
```

To resolve this issue, you need to add a custom webpack configuration to your NextJS project. Here's how you can do it:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // (Optional) Export as a static site
    // See https://nextjs.org/docs/pages/building-your-application/deploying/static-exports#configuration
    output: 'export', // Feel free to modify/remove this option

    // Override the default webpack configuration
    webpack: (config) => {
        // See https://webpack.js.org/configuration/resolve/#resolvealias
        config.resolve.alias = {
            ...config.resolve.alias,
            "sharp$": false,
            "onnxruntime-node$": false,
        }
        return config;
    },
}
```

This config step is taken straight from the [transformers.js documentation](https://huggingface.co/docs/transformers.js/tutorials/next). If you're still having trouble or need more information, check out that documentation.

**Piper Phonemize Build Steps As of JUN 2024:**

```sh
# Docker (optional)
docker run -it -v $(pwd):/wasm -w /wasm debian:11.3
apt-get update
apt-get install --yes --no-install-recommends build-essential cmake ca-certificates curl pkg-config git python3 autogen automake autoconf libtool

# Emscripten
git clone --depth 1 https://github.com/emscripten-core/emsdk.git /wasm/modules/emsdk
cd /wasm/modules/emsdk
./emsdk install 3.1.47
./emsdk activate 3.1.47
source ./emsdk_env.sh
TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake
sed -i -E 's/int\s+(iswalnum|iswalpha|iswblank|iswcntrl|iswgraph|iswlower|iswprint|iswpunct|iswspace|iswupper|iswxdigit)\(wint_t\)/\/\/\0/g' ./upstream/emscripten/cache/sysroot/include/wchar.h

# espeak-ng
git clone --depth 1 https://github.com/rhasspy/espeak-ng.git /wasm/modules/espeak-ng
cd /wasm/modules/espeak-ng
./autogen.sh
./configure
make

# piper-phonemize
git clone --depth 1 https://github.com/wide-video/piper-phonemize.git /wasm/modules/piper-phonemize
cd /wasm/modules/piper-phonemize
emmake cmake -Bbuild -DCMAKE_INSTALL_PREFIX=install -DCMAKE_TOOLCHAIN_FILE=$TOOLCHAIN_FILE -DBUILD_TESTING=OFF -G "Unix Makefiles" -DCMAKE_CXX_FLAGS="-O3 -s INVOKE_RUN=0 -s MODULARIZE=1 -s EXPORT_NAME='createPiperPhonemize' -s EXPORTED_FUNCTIONS='[_main]' -s EXPORTED_RUNTIME_METHODS='[callMain, FS]' --preload-file /wasm/modules/espeak-ng/espeak-ng-data@/espeak-ng-data"
emmake cmake --build build --config Release # fails on "Compile intonations / Permission denied", continue with next steps
sed -i 's+$(MAKE) $(MAKESILENT) -f CMakeFiles/data.dir/build.make CMakeFiles/data.dir/build+#\0+g' /wasm/modules/piper-phonemize/build/e/src/espeak_ng_external-build/CMakeFiles/Makefile2
sed -i 's/using namespace std/\/\/\0/g' /wasm/modules/piper-phonemize/build/e/src/espeak_ng_external/src/speechPlayer/src/speechWaveGenerator.cpp
emmake cmake --build build --config Release
```
