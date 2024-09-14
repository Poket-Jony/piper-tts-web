// worker_blob_cache.js
var getBlob = async (url, blobs) => new Promise((resolve) => {
  const cached = blobs[url];
  if (cached)
    return resolve(cached);
  const id = new Date().getTime();
  let xContentLength;
  self.postMessage({ kind: "fetch", id, url });
  const xhr = new XMLHttpRequest;
  xhr.responseType = "blob";
  xhr.onprogress = (event) => self.postMessage({
    kind: "fetch",
    id,
    url,
    total: xContentLength ?? event.total,
    loaded: event.loaded
  });
  xhr.onreadystatechange = () => {
    if (xhr.readyState >= xhr.HEADERS_RECEIVED && xContentLength === undefined && xhr.getAllResponseHeaders().includes("x-content-length"))
      xContentLength = Number(xhr.getResponseHeader("x-content-length"));
    if (xhr.readyState === xhr.DONE) {
      self.postMessage({ kind: "fetch", id, url, blob: xhr.response });
      resolve(xhr.response);
    }
  };
  xhr.open("GET", url);
  xhr.send();
});

// piper_worker.js
async function phonemize(data, onnxruntimeBase, modelConfig) {
  const { input, speakerId, blobs, modelUrl, modelConfigUrl } = data;
  const piperPhonemizeJs = URL.createObjectURL(await getBlob(data.piperPhonemizeJsUrl, blobs));
  const piperPhonemizeWasm = URL.createObjectURL(await getBlob(data.piperPhonemizeWasmUrl, blobs));
  const piperPhonemizeData = URL.createObjectURL(await getBlob(data.piperPhonemizeDataUrl, blobs));
  importScripts(piperPhonemizeJs);
  const phonemeIds = await new Promise(async (resolve) => {
    const module = await createPiperPhonemize({
      print: (data2) => {
        resolve(JSON.parse(data2).phoneme_ids);
      },
      printErr: (message) => {
        self.postMessage({ kind: "stderr", message });
      },
      locateFile: (url, _scriptDirectory) => {
        if (url.endsWith(".wasm"))
          return piperPhonemizeWasm;
        if (url.endsWith(".data"))
          return piperPhonemizeData;
        return url;
      }
    });
    module.callMain([
      "-l",
      modelConfig.espeak.voice,
      "--input",
      JSON.stringify([{ text: input }]),
      "--espeak_data",
      "/espeak-ng-data"
    ]);
  });
  return phonemeIds;
}
async function init(data, phonemizeOnly = false) {
  const { input, speakerId, blobs, modelUrl, modelConfigUrl, onnxruntimeUrl } = data;
  const modelConfigBlob = await getBlob(modelConfigUrl, blobs);
  const modelConfig = JSON.parse(await modelConfigBlob.text());
  const onnxruntimeBase = onnxruntimeUrl;
  const providedPhonemeIds = data.phonemeIds;
  const phonemeIds = providedPhonemeIds ?? await phonemize(data, onnxruntimeBase, modelConfig);
  const phonemeIdMap = Object.entries(modelConfig.phoneme_id_map);
  const idPhonemeMap = Object.fromEntries(phonemeIdMap.map(([k, v]) => [v[0], k]));
  const phonemes = phonemeIds.map((id) => idPhonemeMap[id]);
  if (phonemizeOnly) {
    self.postMessage({ kind: "output", input, phonemes, phonemeIds });
    self.postMessage({ kind: "complete" });
    return;
  }
  const onnxruntimeJs = URL.createObjectURL(await getBlob(`${onnxruntimeBase}ort.min.js`, blobs));
  importScripts(onnxruntimeJs);
  ort.env.wasm.numThreads = navigator.hardwareConcurrency;
  ort.env.wasm.wasmPaths = onnxruntimeBase;
  const sampleRate = modelConfig.audio.sample_rate;
  const numChannels = 1;
  const noiseScale = modelConfig.inference.noise_scale;
  const lengthScale = modelConfig.inference.length_scale;
  const noiseW = modelConfig.inference.noise_w;
  const modelBlob = await getBlob(modelUrl, blobs);
  const session = cachedSession[modelUrl] ?? await ort.InferenceSession.create(URL.createObjectURL(modelBlob));
  if (Object.keys(cachedSession).length && !cachedSession[modelUrl])
    cachedSession = {};
  cachedSession[modelUrl] = session;
  const feeds = {
    input: new ort.Tensor("int64", phonemeIds, [1, phonemeIds.length]),
    input_lengths: new ort.Tensor("int64", [phonemeIds.length]),
    scales: new ort.Tensor("float32", [noiseScale, lengthScale, noiseW])
  };
  if (Object.keys(modelConfig.speaker_id_map).length)
    feeds.sid = new ort.Tensor("int64", [speakerId]);
  const {
    output: { data: pcm }
  } = await session.run(feeds);
  function PCM2WAV(buffer, sampleRate2, numChannels2) {
    const bufferLength = buffer.length;
    const headerLength = 44;
    const view = new DataView(new ArrayBuffer(bufferLength * numChannels2 * 2 + headerLength));
    view.setUint32(0, 1179011410, true);
    view.setUint32(4, view.buffer.byteLength - 8, true);
    view.setUint32(8, 1163280727, true);
    view.setUint32(12, 544501094, true);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels2, true);
    view.setUint32(24, sampleRate2, true);
    view.setUint32(28, numChannels2 * 2 * sampleRate2, true);
    view.setUint16(32, numChannels2 * 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 1635017060, true);
    view.setUint32(40, 2 * bufferLength, true);
    let p = headerLength;
    for (let i = 0;i < bufferLength; i++) {
      const v = buffer[i];
      if (v >= 1)
        view.setInt16(p, 32767, true);
      else if (v <= -1)
        view.setInt16(p, -32768, true);
      else
        view.setInt16(p, v * 32768 | 0, true);
      p += 2;
    }
    const wavBuffer = view.buffer;
    const duration2 = bufferLength / (sampleRate2 * numChannels2);
    return { wavBuffer, duration: duration2 };
  }
  const result = PCM2WAV(pcm, sampleRate, numChannels);
  const file = new Blob([result.wavBuffer], { type: "audio/x-wav" });
  const duration = Math.floor(result.duration * 1000);
  self.postMessage({
    kind: "output",
    input,
    file,
    duration,
    phonemes,
    phonemeIds
  });
  self.postMessage({ kind: "complete" });
}
var cachedSession = {};
self.addEventListener("message", (event) => {
  const data = event.data;
  if (data.kind === "init")
    init(data);
  if (data.kind === "isAlive")
    isAlive(data.modelUrl);
  if (data.kind === "phonemize")
    init(data, true);
});
var isAlive = (modelUrl) => {
  self.postMessage({
    kind: "isAlive",
    isAlive: cachedSession[modelUrl] != null
  });
};
