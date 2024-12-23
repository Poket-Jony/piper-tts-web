import OnnxWebGPURuntime from '../Runtime/Onnx/OnnxWebGPURuntime.js';

let onnxRuntime = null;

self.onmessage = ({ data: { type, data } }) => {
  switch (type) {
    case 'constructor':
      onnxRuntime = new OnnxWebGPURuntime(data || {});
      break;
    case 'destroy':
      onnxRuntime.destroy();
      break;
    case 'loadSession':
      onnxRuntime.loadSession(...(data || [])).then(() => self.postMessage());
      break;
    case 'generate':
      onnxRuntime.generate(...(data || [])).then(self.postMessage);
      break;
    default:
      throw new Error('Unknown type ' + type);
  }
};
