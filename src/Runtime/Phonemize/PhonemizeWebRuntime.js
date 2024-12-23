import createPiperPhonemize from '../../../build/piper_phonemize.js';
import FetchProvider from '../../Provider/FetchProvider.js';

export default class {
  #provider = null;
  #basePath = null;
  #module = null;
  #callback = null;

  constructor({ provider = new FetchProvider(), basePath = '/piper/' } = {}) {
    this.#provider = provider;
    this.#basePath = basePath;
  }

  destroy() {
    this.#provider.destroy();
  }

  async loadModule() {
    if (!this.#module) {
      const wasmUrl = await this.#provider.fetch(this.#basePath + 'piper_phonemize.wasm');
      const dataUrl = await this.#provider.fetch(this.#basePath + 'piper_phonemize.data');

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
            return wasmUrl;
          } else if (url.endsWith('.data')) {
            return dataUrl;
          }
          return url;
        },
      });
    }
  }

  async phonemize(text, voiceData) {
    const phonemeMap = this.#getPhonemeMap(voiceData);
    return new Promise(async (resolve) => {
      this.#callback = (data) => {
        const phonemes = data.phoneme_ids.map((id) => phonemeMap[id]);
        resolve({
          ...data,
          phonemes,
        });
      };

      this.#module.callMain([
        '-l',
        voiceData[0].espeak.voice,
        '--input',
        JSON.stringify([{ text }]),
        '--espeak_data',
        '/espeak-ng-data',
      ]);
    });
  }

  #getPhonemeMap(voiceData) {
    return Object.fromEntries(Object.entries(voiceData[0].phoneme_id_map).map(([k, v]) => [v[0], k]));
  }
}
