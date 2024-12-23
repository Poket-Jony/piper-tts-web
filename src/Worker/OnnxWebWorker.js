import OnnxWebRuntime from '../Runtime/Onnx/OnnxWebRuntime.js';

let onnxRuntime = null;

self.onmessage = ({ data: { type, data } }) => {
  switch (type) {
    case 'constructor':
      onnxRuntime = new OnnxWebRuntime(data || {});
      break;
    case 'destroy':
      onnxRuntime.destroy();
      break;
    case 'loadSession':
      onnxRuntime.loadSession(...(data || [])).then(() => self.postMessage(null));
      break;
    case 'generate':
      onnxRuntime.generate(...(data || [])).then(self.postMessage);
      break;
    default:
      throw new Error('Unknown type ' + type);
  }
};
