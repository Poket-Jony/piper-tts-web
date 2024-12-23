import FetchProvider from '../FetchProvider.js';

export default class {
  #provider = null;
  #baseUrl = null;
  #separator = null;

  constructor({ provider = new FetchProvider(), baseUrl = '/piper/models/', separator = '-' } = {}) {
    this.#provider = provider;
    this.#baseUrl = baseUrl;
    this.#separator = separator;
  }

  destroy() {
    this.#provider.destroy();
  }

  async list() {
    return this.#provider.fetch(this.#baseUrl + 'voices.json');
  }

  async fetch(voice) {
    const voicePath = voice.split(this.#separator);
    const modelPath =
      this.#baseUrl + voicePath[0].split('_')[0] + '/' + voicePath.join('/') + '/' + voicePath.join('-');

    return Promise.all([modelPath + '.onnx.json', modelPath + '.onnx'].map((url) => this.#provider.fetch(url)));
  }
}
