import PiperWebEngine from './PiperWebEngine.js';
import OnnxWebWorkerRuntime from '../Runtime/Onnx/OnnxWebWorkerRuntime.js';
import PhonemizeWebWorkerRuntime from '../Runtime/Phonemize/PhonemizeWebWorkerRuntime.js';
import ExpressionWebWorkerRuntime from '../Runtime/Expression/ExpressionWebWorkerRuntime.js';
import HuggingFaceVoiceProvider from '../Provider/Voice/HuggingFaceVoiceProvider.js';

export default class extends PiperWebEngine {
  constructor({
    onnxRuntime = new OnnxWebWorkerRuntime(),
    phonemizeRuntime = new PhonemizeWebWorkerRuntime(),
    expressionRuntime = new ExpressionWebWorkerRuntime(),
    voiceProvider = new HuggingFaceVoiceProvider(),
  } = {}) {
    super({ onnxRuntime, phonemizeRuntime, expressionRuntime, voiceProvider });
  }
}
