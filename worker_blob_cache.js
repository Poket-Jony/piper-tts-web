/**
 * Fetches a blob from a given URL and caches it in the provided `blobs` object.
 * If the blob is already cached, it returns the cached version.
 * This function is designed to be run inside a Web Worker and communicates progress,
 * completion, and the fetched blob data back to the main thread via `self.postMessage`.
 *
 * The main thread should listen for messages from the worker and store the received blob
 * data in an appropriate data structure, such as a `Map` or an object, where the URL is
 * the key and the blob is the value.
 *
 * Example:
 *
 * ```javascript
 * const blobs = new Map();
 * worker.onmessage = (event) => {
 *   const { kind, url, blob } = event.data;
 *   if (kind === "fetch" && blob) {
 *     blobs.set(url, blob);
 *   }
 * };
 * ```
 *
 * @param {string} url - The URL from which to fetch the blob.
 * @param {Object<string, Blob>} blobs - An object used as a cache for storing blobs, with URLs as keys.
 * @returns {Promise<void>} A promise that resolves when the blob is fetched and sent to the main thread.
 */
export const getBlob = async (url, blobs) =>
  new Promise((resolve) => {
    const cached = blobs[url];
    if (cached) return resolve(cached);
    const id = new Date().getTime();
    let xContentLength;
    self.postMessage({ kind: "fetch", id, url });

    const xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onprogress = (event) =>
      self.postMessage({
        kind: "fetch",
        id,
        url,
        total: xContentLength ?? event.total,
        loaded: event.loaded,
      });
    xhr.onreadystatechange = () => {
      if (
        xhr.readyState >= xhr.HEADERS_RECEIVED &&
        xContentLength === undefined &&
        xhr.getAllResponseHeaders().includes("x-content-length")
      )
        xContentLength = Number(xhr.getResponseHeader("x-content-length"));

      if (xhr.readyState === xhr.DONE) {
        self.postMessage({ kind: "fetch", id, url, blob: xhr.response });
        resolve(xhr.response);
      }
    };
    xhr.open("GET", url);
    xhr.send();
  });
