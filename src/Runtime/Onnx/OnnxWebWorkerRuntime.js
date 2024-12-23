import WebWorkerEvent from '../../Worker/Event/WebWorkerEvent.js';
import OnnxWebWorker from '../../Worker/OnnxWebWorker.js?worker';

export default class {
  #worker = null;

  constructor({ worker = new OnnxWebWorker(), basePath = '/onnx/', numThreads = navigator.hardwareConcurrency } = {}) {
    this.#worker = worker;
    this.#worker.postMessage(new WebWorkerEvent('constructor', { basePath, numThreads }));
  }

  destroy() {
    this.#worker.postMessage(new WebWorkerEvent('destroy'));
    this.#worker.terminate();
  }

  async loadSession(voiceData) {
    this.#worker.postMessage(new WebWorkerEvent('loadSession', [voiceData]));
    return new Promise((resolve) => (this.#worker.onmessage = ({ data }) => resolve(data)));
  }

  async generate(phonemeData, voiceData, speaker = 0) {
    this.#worker.postMessage(new WebWorkerEvent('generate', [phonemeData, voiceData, speaker]));
    return new Promise((resolve) => (this.#worker.onmessage = ({ data }) => resolve(data)));
  }
}
