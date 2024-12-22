import * as ort from 'onnxruntime-web';
import AbstractOnnxRuntime from './AbstractOnnxRuntime.js';

export default class extends AbstractOnnxRuntime {
  get ort() {
    return ort;
  }

  constructor({ basePath = '/onnx/', numThreads = navigator.hardwareConcurrency } = {}) {
    super();
    ort.env.wasm.wasmPaths = basePath;
    ort.env.wasm.numThreads = numThreads;
  }
}
