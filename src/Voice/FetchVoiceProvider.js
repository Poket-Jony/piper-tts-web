export default class {
  #baseUrl = null;
  #separator = null;
  #cache = [];

  constructor({ baseUrl = '/piper/models/', separator = '-' } = {}) {
    this.#baseUrl = baseUrl;
    this.#separator = separator;
  }

  destroy() {
    for (const data in this.#cache) {
      if (typeof data === 'string' && data.startsWith('blob:')) {
        URL.revokeObjectURL(data);
      }
    }
    this.#cache = [];
  }

  async list() {
    const url = this.#baseUrl + 'voices.json';
    return !this.#cache[url]
      ? fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Could not fetch voice list: ' + url);
            }
            return response.json();
          })
          .then((data) => (this.#cache[url] = data))
      : Promise.resolve(this.#cache[url]);
  }

  async fetch(voice) {
    return Promise.all(
      this.#urls(voice).map(async (url) =>
        !this.#cache[url]
          ? fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error('Could not fetch voice: ' + url);
                }
                return response.blob();
              })
              .then((data) => URL.createObjectURL(data))
              .then((data) => (this.#cache[url] = data))
          : Promise.resolve(this.#cache[url])
      )
    );
  }

  #urls(voice) {
    const voicePath = voice.split(this.#separator);
    const modelPath =
      this.#baseUrl + voicePath[0].split('_')[0] + '/' + voicePath.join('/') + '/' + voicePath.join('-');
    return [modelPath + '.onnx.json', modelPath + '.onnx'];
  }
}
