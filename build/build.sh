#!/bin/bash
# reference: https://github.com/wide-video/piper-wasm/blob/main/README.md#build-wasm

# emscripten
git clone --depth 1 https://github.com/emscripten-core/emsdk.git /build/modules/emsdk
cd /build/modules/emsdk
./emsdk install 3.1.74
./emsdk activate 3.1.74
source ./emsdk_env.sh
TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake
sed -i -E 's/int\s+(iswalnum|iswalpha|iswblank|iswcntrl|iswgraph|iswlower|iswprint|iswpunct|iswspace|iswupper|iswxdigit)\(wint_t\)/\/\/\0/g' upstream/emscripten/cache/sysroot/include/wchar.h

# espeak-ng
git clone --depth 1 https://github.com/rhasspy/espeak-ng.git /build/modules/espeak-ng
cd /build/modules/espeak-ng
./autogen.sh
./configure
make

# piper-phonemize
git clone --depth 1 https://github.com/wide-video/piper-phonemize.git /build/modules/piper-phonemize
cd /build/modules/piper-phonemize
emmake cmake -Bbuild -DCMAKE_INSTALL_PREFIX=install -DCMAKE_TOOLCHAIN_FILE=$TOOLCHAIN_FILE -DBUILD_TESTING=OFF -G "Unix Makefiles" -DCMAKE_CXX_FLAGS="-O3" -DCMAKE_EXE_LINKER_FLAGS="-s FORCE_FILESYSTEM=1 -s INVOKE_RUN=0 -s MODULARIZE=1 -s EXPORT_NAME='createPiperPhonemize' -s EXPORTED_FUNCTIONS='[_main]' -s EXPORTED_RUNTIME_METHODS='[callMain, FS]' --preload-file /build/modules/espeak-ng/espeak-ng-data@/espeak-ng-data"
emmake cmake --build build --config Release || true # fails on "Compile intonations / Permission denied", continue with next steps
sed -i 's+$(MAKE) $(MAKESILENT) -f CMakeFiles/data.dir/build.make CMakeFiles/data.dir/build+#\0+g' build/e/src/espeak_ng_external-build/CMakeFiles/Makefile2
sed -i 's/using namespace std/\/\/\0/g' build/e/src/espeak_ng_external/src/speechPlayer/src/speechWaveGenerator.cpp
emmake cmake --build build --config Release
cp -fv build/piper_phonemize.* ../../