import OnnxWebRuntime from '../Runtime/Onnx/OnnxWebRuntime.js';
import PhonemizeWebRuntime from '../Runtime/Phonemize/PhonemizeWebRuntime.js';
import ExpressionWebRuntime from '../Runtime/Expression/ExpressionWebRuntime.js';
import HFVoiceProvider from '../Voice/HuggingFaceVoiceProvider.js';
import IPA from '../Expression/IPA.js';
import FaceExpression from '../Expression/FaceExpression.js';
import IdleState from './State/IdleState.js';
import BusyState from './State/BusyState.js';

export default class {
  #onnxRuntime = null;
  #phonemizeRuntime = null;
  #expressionRuntime = null;
  #voiceProvider = null;
  #state = null;

  constructor({
    onnxRuntime = new OnnxWebRuntime(),
    phonemizeRuntime = new PhonemizeWebRuntime(),
    expressionRuntime = new ExpressionWebRuntime(),
    voiceProvider = new HFVoiceProvider(),
  } = {}) {
    this.#onnxRuntime = onnxRuntime;
    this.#phonemizeRuntime = phonemizeRuntime;
    this.#expressionRuntime = expressionRuntime;
    this.#voiceProvider = voiceProvider;
    this.#state = new IdleState();
  }

  destroy() {
    this.#onnxRuntime.destroy();
    this.#phonemizeRuntime.destroy();
    this.#expressionRuntime.destroy();
    this.#voiceProvider.destroy();
  }

  async generate(text, voice, speaker = 0) {
    if (this.#state.type !== IdleState.prototype.type) {
      return new Promise((resolve) => setTimeout(async () => resolve(await this.generate(text, voice, speaker)), 100));
    }

    this.#state = new BusyState();
    const voiceData = await this.#voiceProvider.fetch(voice);

    await this.#phonemizeRuntime.loadModule();
    const phonemeData = await this.#phonemizeRuntime.phonemize(text, voiceData);

    const response = await this.#onnxRuntime.generate(phonemeData, voiceData, speaker);
    this.#state = new IdleState();

    return response;
  }

  async expressions(phonemeData, duration = 1000) {
    if (this.#state.type !== IdleState.prototype.type) {
      return new Promise((resolve) =>
        setTimeout(async () => resolve(await this.expressions(phonemeData, duration)), 100)
      );
    }

    this.#state = new BusyState();
    const mouth = new IPA(phonemeData.phonemes).generateMouthExpressions(duration);

    await this.#expressionRuntime.loadPipeline();
    const response = await this.#expressionRuntime.generate(phonemeData.text);
    const face = [FaceExpression.fromDistilbertGoEmotions(response, duration)];
    this.#state = new IdleState();

    return {
      mouth,
      face,
    };
  }
}
