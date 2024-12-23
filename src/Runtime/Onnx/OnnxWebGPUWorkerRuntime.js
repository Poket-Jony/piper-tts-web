import OnnxWebWorkerRuntime from './OnnxWebWorkerRuntime.js';
import OnnxWebGPUWorker from '../../Worker/OnnxWebGPUWorker.js?worker';

export default class extends OnnxWebWorkerRuntime {
  constructor({
    worker = new OnnxWebGPUWorker(),
    basePath = '/onnx/',
    numThreads = navigator.hardwareConcurrency,
  } = {}) {
    super({ worker, basePath, numThreads });
  }
}
