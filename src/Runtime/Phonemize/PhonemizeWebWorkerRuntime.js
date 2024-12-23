import FetchProvider from '../../Provider/FetchProvider.js';
import WebWorkerEvent from '../../Worker/Event/WebWorkerEvent.js';
import PhonemizeWebWorker from '../../Worker/PhonemizeWebWorker.js?worker';

export default class {
  #provider = null;
  #basePath = null;
  #worker = null;

  constructor({ provider = new FetchProvider(), basePath = '/piper/' } = {}) {
    this.#provider = provider;
    this.#basePath = basePath;
    this.#worker = new PhonemizeWebWorker();
    this.#worker.postMessage(new WebWorkerEvent('constructor', { provider, basePath }));
  }

  destroy() {
    this.#provider.destroy();
    this.#worker.postMessage(new WebWorkerEvent('destroy'));
    this.#worker.terminate();
  }

  async loadModule(wasmUrl = null, dataUrl = null) {
    wasmUrl = wasmUrl || (await this.#provider.fetch(this.#basePath + 'piper_phonemize.wasm'));
    dataUrl = dataUrl || (await this.#provider.fetch(this.#basePath + 'piper_phonemize.data'));

    this.#worker.postMessage(new WebWorkerEvent('loadModule', [wasmUrl, dataUrl]));
    return new Promise((resolve) => (this.#worker.onmessage = ({ data }) => resolve(data)));
  }

  async phonemize(text, voiceData) {
    await this.loadModule();
    this.#worker.postMessage(new WebWorkerEvent('phonemize', [text, voiceData]));
    return new Promise((resolve) => (this.#worker.onmessage = ({ data }) => resolve(data)));
  }
}
