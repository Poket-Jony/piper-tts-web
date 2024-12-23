import WebWorkerEvent from '../../Worker/Event/WebWorkerEvent.js';
import ExpressionWebWorker from '../../Worker/ExpressionWebWorker.js?worker';

export default class {
  #worker = null;

  constructor({ task = 'text-classification', model = 'Cohee/distilbert-base-uncased-go-emotions-onnx' } = {}) {
    this.#worker = new ExpressionWebWorker();
    this.#worker.postMessage(new WebWorkerEvent('constructor', { task, model }));
  }

  destroy() {
    this.#worker.postMessage(new WebWorkerEvent('destroy'));
    this.#worker.terminate();
  }

  async loadPipeline() {
    this.#worker.postMessage(new WebWorkerEvent('loadPipeline'));
    return new Promise((resolve) => (this.#worker.onmessage = ({ data }) => resolve(data)));
  }

  async generate(text) {
    this.#worker.postMessage(new WebWorkerEvent('generate', [text]));
    return new Promise((resolve) => (this.#worker.onmessage = ({ data }) => resolve(data)));
  }
}
