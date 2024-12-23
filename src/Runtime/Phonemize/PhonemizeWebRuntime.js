import createPiperPhonemize from '../../../build/piper_phonemize.js';
import FetchProvider from '../../Provider/FetchProvider.js';

export default class {
  #provider = null;
  #basePath = null;
  #wasmUrl = null;
  #dataUrl = null;
  #module = null;
  #callback = null;

  constructor({ provider = new FetchProvider(), basePath = '/piper/' } = {}) {
    this.#provider = provider;
    this.#basePath = basePath;
  }

  destroy() {
    this.#provider.destroy();
    this.#wasmUrl = null;
    this.#dataUrl = null;
    this.#module = null;
    this.#callback = null;
  }

  async loadModule(wasmUrl = null, dataUrl = null) {
    this.#wasmUrl = wasmUrl || this.#wasmUrl || (await this.#provider.fetch(this.#basePath + 'piper_phonemize.wasm'));
    this.#dataUrl = dataUrl || this.#dataUrl || (await this.#provider.fetch(this.#basePath + 'piper_phonemize.data'));

    if (!this.#module) {
      this.#module = await createPiperPhonemize({
        print: (data) => {
          if (this.#callback) {
            this.#callback(JSON.parse(data));
            this.#callback = null;
          }
        },
        printErr: (message) => {
          throw new Error(message);
        },
        locateFile: (url, _scriptDirectory) => {
          if (url.endsWith('.wasm')) {
            return this.#wasmUrl;
          } else if (url.endsWith('.data')) {
            return this.#dataUrl;
          }
          return url;
        },
      });
    }
    return Promise.resolve(this.#module);
  }

  async phonemize(text, voiceData) {
    const phonemeMap = Object.fromEntries(Object.entries(voiceData[0].phoneme_id_map).map(([k, v]) => [v[0], k]));
    return new Promise((resolve) => {
      this.#callback = (data) => {
        const phonemes = data.phoneme_ids.map((id) => phonemeMap[id]);
        resolve({
          ...data,
          phonemes,
        });
      };

      this.loadModule().then((module) =>
        module.callMain([
          '-l',
          voiceData[0].espeak.voice,
          '--input',
          JSON.stringify([{ text }]),
          '--espeak_data',
          '/espeak-ng-data',
        ])
      );
    });
  }
}
