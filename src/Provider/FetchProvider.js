export default class {
  #cache = [];

  destroy() {
    for (const data in this.#cache) {
      if (typeof data === 'string' && data.startsWith('blob:')) {
        URL.revokeObjectURL(data);
      }
    }
    this.#cache = [];
  }

  async fetch(url) {
    return !this.#cache[url]
      ? fetch(url)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error('Could not fetch: ' + url);
            }
            return url.endsWith('.json') ? response.json() : URL.createObjectURL(await response.blob());
          })
          .then((data) => (this.#cache[url] = data))
      : Promise.resolve(this.#cache[url]);
  }
}
