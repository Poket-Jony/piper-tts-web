import OnnxWebRuntime from '../Runtime/Onnx/OnnxWebRuntime.js';
import PhonemizeWebRuntime from '../Runtime/Phonemize/PhonemizeWebRuntime.js';
import ExpressionWebRuntime from '../Runtime/Expression/ExpressionWebRuntime.js';
import HuggingFaceVoiceProvider from '../Provider/Voice/HuggingFaceVoiceProvider.js';
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

  get state() {
    return this.#state;
  }

  constructor({
    onnxRuntime = new OnnxWebRuntime(),
    phonemizeRuntime = new PhonemizeWebRuntime(),
    expressionRuntime = new ExpressionWebRuntime(),
    voiceProvider = new HuggingFaceVoiceProvider(),
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

    speaker = Number(speaker);
    this.#state = new BusyState();
    const voiceData = await this.#voiceProvider.fetch(voice);
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

    duration = Number(duration);
    this.#state = new BusyState();
    const mouth = new IPA(phonemeData.phonemes).generateMouthExpressions(duration);
    const face = [
      await this.#expressionRuntime
        .generate(phonemeData.text)
        .then((sentiment) => FaceExpression.fromDistilbertGoEmotions(sentiment, duration)),
    ];
    this.#state = new IdleState();

    return {
      mouth,
      face,
    };
  }
}
