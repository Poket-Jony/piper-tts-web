import createPiperPhonemize from '../../../build/piper_phonemize.js';

export default class {
  #basePath = null;
  #module = null;
  #callback = null;
  #cache = [];

  constructor({ basePath = '/piper/' } = {}) {
    this.#basePath = basePath;
  }

  destroy() {
    for (const data in this.#cache) {
      if (typeof data === 'string' && data.startsWith('blob:')) {
        URL.revokeObjectURL(data);
      }
    }
    this.#cache = [];
  }

  async loadModule() {
    if (!this.#module) {
      const wasmUrl = await this.#fetch(this.#basePath + 'piper_phonemize.wasm');
      const dataUrl = await this.#fetch(this.#basePath + 'piper_phonemize.data');

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

  async phonemize(text, voice) {
    return new Promise(async (resolve) => {
      const config = await fetch(voice[0]).then((response) => response.json());

      this.#callback = (data) => {
        const phonemeMap = Object.fromEntries(Object.entries(config.phoneme_id_map).map(([k, v]) => [v[0], k]));
        const phonemes = data.phoneme_ids.map((id) => phonemeMap[id]);

        resolve({
          ...data,
          phonemes,
        });
      };

      this.#module.callMain([
        '-l',
        config.espeak.voice,
        '--input',
        JSON.stringify([{ text }]),
        '--espeak_data',
        '/espeak-ng-data',
      ]);
    });
  }

  async #fetch(url) {
    return !this.#cache[url]
      ? fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Could not fetch piper: ' + url);
            }
            return response.blob();
          })
          .then((data) => URL.createObjectURL(data))
          .then((data) => (this.#cache[url] = data))
      : Promise.resolve(this.#cache[url]);
  }
}
