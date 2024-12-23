import * as Ort from 'onnxruntime-web/webgpu';
import OnnxWebRuntime from './OnnxWebRuntime.js';

export default class extends OnnxWebRuntime {
  constructor({ ort = Ort, basePath = '/onnx/', numThreads = navigator.hardwareConcurrency } = {}) {
    super({ ort, basePath, numThreads });
  }
}
