const blobs = {};
let worker;

export const HF_BASE = `https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/`;

/**
 * Generates phonemes using the Piper Phonemizer.
 *
 * @param {string} piperPhonemizeJsUrl - URL for the Piper phonemize JavaScript file.
 * @param {string} piperPhonemizeWasmUrl - URL for the Piper phonemize WASM file.
 * @param {string} piperPhonemizeDataUrl - URL for the Piper phonemize data file.
 * @param {string} workerUrl - URL for the Web Worker script.
 * @param {string} modelConfigUrl - URL for the model configuration file.
 * @param {string} input - Text input to be processed.
 * @param {function(number): void} onProgress - Callback function to handle progress updates.
 *
 * @returns {Promise<string>} A promise that resolves with the generated audio Blob URL.
 */
export const piperPhonemize = (
  piperPhonemizeJsUrl,
  piperPhonemizeWasmUrl,
  piperPhonemizeDataUrl,
  workerUrl,
  modelConfigUrl,
  input,
  onProgress
) => {
  const piperPromise = new Promise((resolve, reject) => {
    worker?.terminate();

    worker = new Worker(workerUrl);
    worker.postMessage({
      kind: "phonemize",
      input,
      speakerId: null,
      blobs,
      piperPhonemizeJsUrl,
      piperPhonemizeWasmUrl,
      piperPhonemizeDataUrl,
      modelUrl: null,
      modelConfigUrl,
    });
    worker.addEventListener("message", (event) => {
      const data = event.data;
      switch (data.kind) {
        case "output": {
          resolve(data.phonemes);
          break;
        }
        case "stderr": {
          reject(data.message);
          break;
        }
        case "fetch": {
          if (data.blob) blobs[data.url] = data.blob;
          const progress = data.blob
            ? 1
            : data.total
            ? data.loaded / data.total
            : 0;
          onProgress(Math.round(progress * 100));
          break;
        }
      }
    });
  });
  return piperPromise;
};

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
export const piperGenerate = (
  piperPhonemizeJsUrl,
  piperPhonemizeWasmUrl,
  piperPhonemizeDataUrl,
  workerUrl,
  modelUrl,
  modelConfigUrl,
  speakerId,
  input,
  onProgress
) => {
  const piperPromise = new Promise((resolve, reject) => {
    worker?.terminate();

    worker = new Worker(workerUrl);
    worker.postMessage({
      kind: "init",
      input,
      speakerId,
      blobs,
      piperPhonemizeJsUrl,
      piperPhonemizeWasmUrl,
      piperPhonemizeDataUrl,
      modelUrl,
      modelConfigUrl,
    });
    worker.addEventListener("message", (event) => {
      const data = event.data;
      switch (data.kind) {
        case "output": {
          const audioBlobUrl = URL.createObjectURL(data.file);
          resolve(audioBlobUrl);
          break;
        }
        case "stderr": {
          reject(data.message);
          break;
        }
        case "fetch": {
          if (data.blob) blobs[data.url] = data.blob;
          const progress = data.blob
            ? 1
            : data.total
            ? data.loaded / data.total
            : 0;
          onProgress(Math.round(progress * 100));
          break;
        }
      }
    });
  });
  return piperPromise;
};
