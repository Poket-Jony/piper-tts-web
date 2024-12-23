import { pipeline } from '@huggingface/transformers';

export default class {
  #task = null;
  #model = null;
  #pipeline = null;

  constructor({ task = 'text-classification', model = 'Cohee/distilbert-base-uncased-go-emotions-onnx' } = {}) {
    this.#task = task;
    this.#model = model;
  }

  destroy() {
    this.#pipeline = null;
  }

  async loadPipeline() {
    if (!this.#pipeline) {
      this.#pipeline = await pipeline(this.#task, this.#model);
    }
    return Promise.resolve(this.#pipeline);
  }

  async generate(text) {
    return this.loadPipeline()
      .then(async (pipeline) => pipeline(text))
      .then((response) => response[0]);
  }
}
