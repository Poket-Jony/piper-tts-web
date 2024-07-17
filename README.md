# Piper Wasm

The files in `/build` were generated using the steps proposed by [wide-video / piper-wasm](https://github.com/wide-video/piper-wasm).

## Usage

To use PiperTTS client-side in your project, you need to copy some of the neccessary files into your public directory. If you're using NextJS, you need to install the `copy-webpack-plugin` as a dev dependency and modify your config something like this:

```json
const nextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.wasm",
            to: "../public/",
          },
          {
            from: "node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.data",
            to: "../public/",
          },
          {
            from: "node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.js",
            to: "../public/",
          },
          {
            from: "node_modules/@diffusionstudio/piper-wasm/piper_worker.js",
            to: "../public/",
          },
          {
            from: "node_modules/@diffusionstudio/piper-wasm/espeak-ng/espeak-ng-data/voices",
            to: "../public/espeak-ng-data/voices",
          },
          {
            from: "node_modules/@diffusionstudio/piper-wasm/espeak-ng/espeak-ng-data/lang",
            to: "../public/espeak-ng-data/lang",
          },
        ],
      })
    );
    return config;
  },
  ...
};
```

To generate audio, you can use the `piperGenerate` function:

```js
/**
 * Generates audio using the Piper model.
 *
 * @param {string} piperPhonemizeJsUrl - URL for the Piper phonemize JavaScript file.
 * @param {string} piperPhonemizeWasmUrl - URL for the Piper phonemize WASM file.
 * @param {string} piperPhonemizeDataUrl - URL for the Piper phonemize data file.
 * @param {string} workerUrl - URL for the Web Worker script.
 * @param {string} modelUrl - URL for the model file.
 * @param {string} modelConfigUrl - URL for the model configuration file.
 * @param {number} speakerId - ID of the speaker.
 * @param {string} input - Text input to be processed.
 * @param {function(number): void} onProgress - Callback function to handle progress updates.
 *
 * @returns {Promise<string>} A promise that resolves with the generated audio Blob URL.
 */
```

**As of JUN 2024:**

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
