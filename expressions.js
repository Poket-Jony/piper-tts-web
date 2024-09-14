/**
 * Duration of a pause in milliseconds.
 * @constant {number}
 */
const pauseDuration = 270;

/**
 * Duration of a word break in milliseconds.
 * @constant {number}
 */
const wordBreakDuration = 12;

/**
 * Duration of a character in milliseconds.
 * @constant {number}
 */
const characterDuration = 40.05;

/**
 * Represents a mouth expression with duration and a mixture of mouth
 * expressions representing what different phonemes look like when
 * spoken out loud.
 *
 * The expressions are based on VRM model expressions.
 *
 * The mouth expressions are represented as a number between 0 and 1,
 * where 1 means the expression is fully expressed and 0 means the expression is not expressed at all.
 *
 * @class
 * @property {number} duration - Duration of the mouth expression in milliseconds.
 * @property {number} aa - Mouth expression for the phoneme "aa".
 * @property {number} ee - Mouth expression for the phoneme "ee".
 * @property {number} ih - Mouth expression for the phoneme "ih".
 * @property {number} oh - Mouth expression for the phoneme "oh".
 * @property {number} ou - Mouth expression for the phoneme "ou".
 *
 * @example
 * ```js
 * d: new MouthExpression({
 *   duration: characterDuration,
 *   aa: 0,
 *   ee: 0,
 *   ih: 0,
 *   oh: 0,
 *   ou: 0.33,
 * }),
 * ʈ: new MouthExpression({
 *   duration: characterDuration,
 *   aa: 0.28,
 *   ee: 0,
 *   ih: 0,
 *   oh: 0.24,
 *   ou: 0.27,
 * }),
 * ```
 * @usage
 *```js
 * const mouthExpression = new MouthExpression({ duration: 40.05, aa: 0.22, ee: 0, ih: 1, oh: 0, ou: 0 });
 * ```
 *
 */
class MouthExpression {
  /**
   * Creates a new MouthExpression.
   * @param {Object} params - The parameters for the mouth expression.
   * @param {number} params.duration - The duration of the expression.
   * @param {number} params.aa - The "aa" property of the expression.
   * @param {number} params.ee - The "ee" property of the expression.
   * @param {number} params.ih - The "ih" property of the expression.
   * @param {number} params.oh - The "oh" property of the expression.
   * @param {number} params.ou - The "ou" property of the expression.
   *
   * All values default to 0 if not provided.
   *
   * @returns {MouthExpression} The new MouthExpression.
   */
  constructor({ duration, aa, ee, ih, oh, ou }) {
    this.duration = duration ?? 0;
    this.aa = aa ?? 0;
    this.ee = ee ?? 0;
    this.ih = ih ?? 0;
    this.oh = oh ?? 0;
    this.ou = ou ?? 0;
  }
}

/**
 * Represents a face expression with duration and a mixture of emotion
 * expressions a face can show.
 *
 * The expressions are based on VRM model expressions.
 *
 * The face expressions are represented as a number between 0 and 1,
 * where 1 means the expression is fully expressed and 0 means the expression is not expressed at all.
 *
 * @class
 * @property {number} duration - Duration of the face expression in milliseconds.
 * @property {number} angry - Face expression for the emotion "angry".
 * @property {number} happy - Face expression for the emotion "happy".
 * @property {number} relaxed - Face expression for the emotion "relaxed".
 * @property {number} sad - Face expression for the emotion "sad".
 * @property {number} surprised - Face expression for the emotion "surprised".
 *
 * @example
 * ```js
 * new FaceExpression({
 *   duration: 1000,
 *   angry: 0.0,
 *   happy: 0.5,
 *   relaxed: 0.5,
 *   sad: 0.0,
 *   surprised: 0.0,
 * }),
 * ```
 * @usage
 *```js
 * const faceExpression = new FaceExpression({ duration: 1000, angry: 0.0, happy: 0.5, relaxed: 0.5, sad: 0.0, surprised: 0.0 });
 * ```
 *
 */
export class FaceExpression {
  /**
   * Creates a new FaceExpression.
   * @param {Object} params - The parameters for the mouth expression.
   * @param {number} params.duration - The duration of the expression.
   * @param {number} params.angry - The "angry" property of the expression.
   * @param {number} params.happy - The "happy" property of the expression.
   * @param {number} params.relaxed - The "relaxed" property of the expression.
   * @param {number} params.sad - The "sad" property of the expression.
   * @param {number} params.surprised - The "surprised" property of the expression.
   * @param {number} params.neutral - The "neutral" property of the expression.
   * @param {string} params.emotion - The emotion to express.
   * @param {number} params.emotionScore - The score of the emotion, indicating confidence.
   *
   * All values default to 0 if not provided.
   *
   * @returns {FaceExpression} The new FaceExpression.
   */
  constructor({
    duration,
    angry,
    happy,
    relaxed,
    sad,
    surprised,
    neutral,
    emotion,
    emotionScore,
  }) {
    this.duration = duration ?? 0;
    this.angry = angry ?? 0;
    this.happy = happy ?? 0;
    this.relaxed = relaxed ?? 0;
    this.sad = sad ?? 0;
    this.surprised = surprised ?? 0;
    this.neutral = neutral ?? 0;
    this.emotion = emotion ?? "";
    this.emotionScore = emotionScore ?? 0;
  }

  /**
   *
   * @param {Object} sentiment
   * @param {number} sentiment.score
   * @param {string} sentiment.label
   * @param {number} duration
   * @returns {FaceExpression}
   */
  static fromDistilbertGoEmotions(sentiment, duration = -1) {
    const expression = new FaceExpression({ duration: duration });
    const labelAppliers = {
      admiration: (expression) => {
        expression.relaxed = sentiment.score;
        expression.surprised = sentiment.score;
      },
      amusement: (expression) => {
        expression.happy = sentiment.score;
        expression.surprised = sentiment.score * 0.2;
      },
      anger: (expression) => {
        expression.angry = sentiment.score;
      },
      annoyance: (expression) => {
        expression.angry = sentiment.score * 0.8;
        expression.sad = sentiment.score * 0.2;
      },
      approval: (expression) => {
        expression.relaxed = sentiment.score;
      },
      caring: (expression) => {
        expression.relaxed = sentiment.score;
        expression.sad = sentiment.score * 0.5;
        expression.happy = sentiment.score * 0.1;
      },
      confusion: (expression) => {
        expression.angry = sentiment.score * 0.5;
        expression.surprised = sentiment.score * 0.4;
        expression.sad = sentiment.score * 0.1;
      },
      curiosity: (expression) => {
        expression.happy = sentiment.score * 0.5;
        expression.surprised = sentiment.score * 0.6;
      },
      desire: (expression) => {
        expression.relaxed = sentiment.score;
        expression.angry = sentiment.score * 0.5;
      },
      disappointment: (expression) => {
        expression.sad = sentiment.score * 0.7;
        expression.angry = sentiment.score * 0.7;
      },
      disapproval: (expression) => {
        expression.angry = sentiment.score;
        expression.relaxed = sentiment.score * 0.5;
      },
      disgust: (expression) => {
        expression.angry = sentiment.score;
        expression.relaxed = sentiment.score * 0.7;
      },
      embarrassment: (expression) => {
        expression.sad = sentiment.score;
        expression.relaxed = sentiment.score * 0.15;
      },
      excitement: (expression) => {
        expression.happy = sentiment.score * 0.9;
        expression.surprised = sentiment.score * 0.9;
      },
      fear: (expression) => {
        expression.sad = sentiment.score;
        expression.surprised = sentiment.score * 0.8;
      },
      gratitude: (expression) => {
        expression.happy = sentiment.score;
        expression.relaxed = sentiment.score * 0.5;
      },
      grief: (expression) => {
        expression.sad = sentiment.score;
        expression.anger = sentiment.score * 0.5;
      },
      joy: (expression) => {
        expression.happy = sentiment.score;
      },
      love: (expression) => {
        expression.happy = sentiment.score * 0.5;
        expression.relaxed = sentiment.score * 0.5;
        expression.sad = sentiment.score * 0.2;
      },
      nervousness: (expression) => {
        expression.sad = sentiment.score;
        expression.angry = sentiment.score * 0.3;
        expression.surprised = sentiment.score * 0.5;
      },
      optimism: (expression) => {
        expression.happy = sentiment.score;
        expression.relaxed = sentiment.score * 0.3;
      },
      pride: (expression) => {
        expression.happy = sentiment.score * 0.2;
        expression.angry = sentiment.score * 0.3;
        expression.relaxed = sentiment.score;
      },
      realization: (expression) => {
        expression.happy = sentiment.score * 0.2;
        expression.surprised = sentiment.score;
      },
      relief: (expression) => {
        expression.relaxed = sentiment.score;
      },
      remorse: (expression) => {
        expression.sad = sentiment.score;
        expression.angry = sentiment.score * 0.15;
      },
      sadness: (expression) => {
        expression.sad = sentiment.score;
      },
      surprise: (expression) => {
        expression.surprised = sentiment.score;
      },
      neutral: (expression) => {
        expression.neutral = sentiment.score;
      },
    };
    const label = sentiment.label.toLowerCase();
    if (label in labelAppliers) {
      labelAppliers[label](expression);
    } else {
      expression.neutral = sentiment.score;
    }
    expression.emotion = label;
    expression.emotionScore = sentiment.score;
    return expression;
  }

  // static fromTwitterRobertaSentiment(sentiment, duration = -1) {
  //   const expression = new FaceExpression({ duration: duration });
  //   switch (sentiment.label.toLowerCase()) {
  //     case "neutral":
  //       expression.neutral = sentiment.score;
  //       break;
  //     case "positive":
  //       expression.happy = sentiment.score;
  //       break;
  //     case "negative":
  //       expression.sad = sentiment.score;
  //       break;
  //     default:
  //       expression.neutral = 1;
  //       break;
  //   }
  //   return expression;
  // }
}

/**
 * Represents expressions that can be used to animate VRM models.
 *
 * @class
 * @property {MouthExpression[]} mouthExpressions - The mouth expressions.
 * @property {FaceExpression[]} faceExpressions - The face expressions.
 *
 * @example
 * ```js
 * const expressions = new Expressions({ipa: "hai", duration: 120}); // "hai" is the IPA string and 120 is the total duration.
 * ```
 *
 * mouthExpressions are generated from the IPA string and are generated on object instantiation.
 *
 * faceExpressions require a separate call to `inferEmotionsFromAudio` or `inferEmotionsFromText`,
 * since they are performance heavy and may not be needed.
 */
export class Expressions {
  static expressionWorker = null;

  /**
   * Creates a new Expressions.
   * @param {Object} params - The parameters for the expressions.
   * @param {string} params.ipa - The IPA string.
   * @param {number?} params.duration - The total duration of the expressions in milliseconds. If not provided, the duration is calculated from the IPA string.
   * @returns {Expressions} The new Expressions.
   */
  constructor({ ipa, duration }) {
    this.mouthExpressions = Expressions.ipa2mouth(ipa, duration);
    this.faceExpressions = [];
  }

  /**
   * Converts an IPA string to a list of mouth expressions.
   * @param {string} ipa - The IPA string to convert.
   * @param {number} duration - The total duration for the expressions.
   * @returns {MouthExpression[]} The list of mouth expressions.
   */
  static ipa2mouth(ipa, duration) {
    const mouthExpressions = [];
    let calculatedDuration = 0;
    for (let i = 0; i < ipa.length; i++) {
      const char = ipa.charAt(i);
      const expressionRef = ipa2mouthMap[char];
      if (expressionRef) {
        const expression = { ...expressionRef };
        mouthExpressions.push(expression);
        calculatedDuration += expression.duration;
      }
    }
    duration = duration ?? calculatedDuration;
    const durationCorrectionMultiplier = duration / calculatedDuration;
    for (let i = 0; i < mouthExpressions.length; i++) {
      mouthExpressions[i].duration =
        mouthExpressions[i].duration * durationCorrectionMultiplier;
    }
    return mouthExpressions;
  }

  /**
   * Infers emotions from an audio file using a Web Worker.
   *
   * @param {string} filePath - The path or URL to the audio file.
   * @param {string} workerUrl - The URL to the Web Worker script.
   * @param {function(number): void} onProgress - Callback function to handle progress updates. The progress is given as a percentage (0 to 100).
   * @returns {Promise<Object>} A promise that resolves with the inferred emotions as an object.
   */
  async inferEmotionsFromAudio(filePath, workerUrl, onProgress) {
    return Expressions.inferEmotionsFromAudio(filePath, workerUrl, onProgress);
  }

  /**
   * Infers emotions from a text string using a Web Worker.
   *
   * @param {string} text - The text from which to infer emotions.
   * @param {number} duration - The duration of the expressions in milliseconds.
   * @param {string} workerUrl - The URL to the Web Worker script.
   * @param {function(number): void} onProgress - Callback function to handle progress updates. The progress is given as a percentage (0 to 100).
   * @returns {Promise<Object>} A promise that resolves with the inferred emotions as an object.
   */
  async inferEmotionsFromText(text, duration, workerUrl, onProgress) {
    const faceExpressions = Expressions.inferEmotionsFromText(
      text,
      duration,
      workerUrl,
      onProgress
    );
    this.faceExpressions = faceExpressions;
  }

  /**
   * Static method to infer emotions from a text string using a Web Worker.
   *
   * @param {string} [text="Hello, beautiful World!"] - The text from which to infer emotions.
   * @param {number} [duration=1000] - The duration of the expressions in milliseconds.
   * @param {string} [workerUrl="expression_worker.js"] - The URL to the Web Worker script.
   * @param {function(number): void} [onProgress=(progress) => {}] - Callback function to handle progress updates. The progress is given as a percentage (0 to 100).
   * @returns {Promise<Object>} A promise that resolves with the inferred emotions as an object.
   */
  static async inferEmotionsFromText(
    text = "Hello, beautiful World!",
    duration = 1000,
    workerUrl = "expression_worker.js",
    onProgress = (progressState) => {}
  ) {
    if (this.expressionWorker === null) {
      this.expressionWorker = new Worker(workerUrl, {
        type: "module",
      });
    }
    const textData = text;

    return await new Promise((resolve, reject) => {
      const messageListener = (event) => {
        const data = event.data;

        if (data.status === "output") {
          const output = data.output[0];
          const faceExpressions = [
            FaceExpression.fromDistilbertGoEmotions(output, duration),
          ];
          onProgress && onProgress(100);
          resolve(faceExpressions);
          this.expressionWorker.removeEventListener("message", messageListener);
        } else if (data.status === "stderr") {
          reject(data);
          this.expressionWorker.removeEventListener("message", messageListener);
        } else if (data.status === "progress") {
          onProgress && onProgress(Math.round(data.progress * 100) * 0.01);
        } else {
          console.log(data);
        }
      };
      this.expressionWorker.addEventListener("message", messageListener);
      this.expressionWorker.postMessage({
        kind: "init",
        textData,
      });
    });
  }

  /**
   * Static method to infer emotions from an audio file using a Web Worker.
   *
   * @param {string} [filePath="https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav"] - The path or URL to the audio file.
   * @param {string} [workerUrl="expression_worker.js"] - The URL to the Web Worker script.
   * @returns {Promise<Object>} A promise that resolves with the inferred emotions as an object.
   */
  static async inferEmotionsFromAudio(
    filePath = "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav",
    workerUrl = "expression_worker.js",
    onProgress = (progressState) => {}
  ) {
    if (this.expressionWorker === null) {
      this.expressionWorker = new Worker(workerUrl, {
        type: "module",
      });
    }
    const audioData = await fetchAndDecodeAudio(filePath);

    return new Promise((resolve, reject) => {
      const messageListener = (event) => {
        const data = event.data;

        if (data.kind === "output") {
          resolve(data.emotions);
          this.expressionWorker.removeEventListener("message", messageListener);
        } else if (data.kind === "stderr") {
          reject(data.message);
          this.expressionWorker.removeEventListener("message", messageListener);
        } else {
          console.log(data);
          onProgress(data);
        }
      };
      this.expressionWorker.addEventListener("message", messageListener);
      this.expressionWorker.postMessage({
        kind: "init",
        audioData,
      });
    });
  }
}

async function fetchAndDecodeAudio(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Decode audio data
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Create a Float32Array to hold the channel data
  const float32Array = new Float32Array(audioBuffer.length);

  // Copy the data from the channel (0 is the first channel)
  audioBuffer.copyFromChannel(float32Array, 0, 0);

  return float32Array;
}

const ipa2mouthMap = {
  " ": new MouthExpression({ duration: wordBreakDuration }),
  ".": new MouthExpression({ duration: pauseDuration }),
  ",": new MouthExpression({ duration: pauseDuration }),
  i: new MouthExpression({
    duration: characterDuration,
    aa: 0.22,
    ee: 0,
    ih: 1,
    oh: 0,
    ou: 0,
  }),
  y: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.25,
    ou: 1,
  }),
  ɨ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 41,
    ih: 1,
    oh: 0,
    ou: 0,
  }),
  ʉ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.16,
    ou: 1,
  }),
  ɯ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.09,
    ih: 0,
    oh: 0.07,
    ou: 0.03,
  }),
  u: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.27,
    ou: 1,
  }),
  ɪ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 1,
    ih: 0,
    oh: 0,
    ou: 0,
  }),
  ʊ: new MouthExpression({
    duration: characterDuration,
    aa: 0.28,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.44,
  }),
  e: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 1,
    ih: 57,
    oh: 0,
    ou: 0,
  }),
  ø: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 1,
    ih: 0,
    oh: 0.15,
    ou: 0.21,
  }),
  ɤ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.5,
    ih: 0,
    oh: 0,
    ou: 0,
  }),
  o: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 1,
    ou: 0,
  }),
  ə: new MouthExpression({
    duration: characterDuration,
    aa: 0.51,
    ee: 0.23,
    ih: 0.34,
    oh: 0,
    ou: 0.11,
  }),
  ɛ: new MouthExpression({
    duration: characterDuration,
    aa: 0.65,
    ee: 0.24,
    ih: 0.82,
    oh: 0,
    ou: 0,
  }),
  œ: new MouthExpression({
    duration: characterDuration,
    aa: 0.43,
    ee: 0.22,
    ih: 0,
    oh: 0.53,
    ou: 0,
  }),
  ʌ: new MouthExpression({
    duration: characterDuration,
    aa: 0.79,
    ee: 0,
    ih: 0,
    oh: 0.27,
    ou: 0,
  }),
  ɔ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0.41,
    oh: 1,
    ou: 0,
  }),
  ɐ: new MouthExpression({
    duration: characterDuration,
    aa: 0.53,
    ee: 0.4,
    ih: 0.61,
    oh: 0,
    ou: 0,
  }),
  æ: new MouthExpression({
    duration: characterDuration,
    aa: 0.57,
    ee: 0.45,
    ih: 0.31,
    oh: 0,
    ou: 0,
  }),
  a: new MouthExpression({
    duration: characterDuration,
    aa: 1,
    ee: 0,
    ih: 0,
    oh: 0.26,
    ou: 0,
  }),
  ɶ: new MouthExpression({
    duration: characterDuration,
    aa: 0.5,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.18,
  }),
  ɑ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.63,
    ih: 0,
    oh: 0,
    ou: 0,
  }),
  ɒ: new MouthExpression({
    duration: characterDuration,
    aa: 0.38,
    ee: 0,
    ih: 0,
    oh: 0.56,
    ou: 0.27,
  }),
  p: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0,
  }),
  b: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0,
  }),
  t: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.33,
  }),
  d: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.33,
  }),
  ʈ: new MouthExpression({
    duration: characterDuration,
    aa: 0.28,
    ee: 0,
    ih: 0,
    oh: 0.24,
    ou: 0.27,
  }),
  ɖ: new MouthExpression({
    duration: characterDuration,
    aa: 0.28,
    ee: 0,
    ih: 0,
    oh: 0.24,
    ou: 0.27,
  }),
  c: new MouthExpression({
    duration: characterDuration,
    aa: 0.28,
    ee: 0,
    ih: 0.23,
    oh: 0.13,
    ou: 0.18,
  }),
  ɟ: new MouthExpression({
    duration: characterDuration,
    aa: 0.13,
    ee: 0,
    ih: 0.15,
    oh: 0.07,
    ou: 0.12,
  }),
  k: new MouthExpression({
    duration: characterDuration,
    aa: 0.37,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.29,
  }),
  ɡ: new MouthExpression({
    duration: characterDuration,
    aa: 0.08,
    ee: 0,
    ih: 0,
    oh: 0.19,
    ou: 0,
  }),
  q: new MouthExpression({
    duration: characterDuration,
    aa: 0.08,
    ee: 0,
    ih: 0,
    oh: 0.19,
    ou: 0,
  }),
  ɢ: new MouthExpression({
    duration: characterDuration,
    aa: 0.08,
    ee: 0,
    ih: 0,
    oh: 0.19,
    ou: 0,
  }),
  ʔ: new MouthExpression({
    duration: characterDuration,
    aa: 0.15,
    ee: 0,
    ih: 0,
    oh: 0.15,
    ou: 0,
  }),
  m: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0,
  }),
  ɱ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.03,
    ou: 0.08,
  }),
  n: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.03,
    ou: 0.41,
  }),
  ɳ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.03,
    ou: 0.88,
  }),
  ɲ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.02,
    ou: 0.74,
  }),
  ŋ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.53,
  }),
  ɴ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.38,
  }),
  ʙ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.15,
    ou: 0.52,
  }),
  r: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.38,
  }),
  ʀ: new MouthExpression({
    duration: characterDuration,
    aa: 0.16,
    ee: 0,
    ih: 0,
    oh: 0.06,
    ou: 0.71,
  }),
  ⱱ: new MouthExpression({
    duration: characterDuration,
    aa: 0.16,
    ee: 0.05,
    ih: 0.06,
    oh: 0,
    ou: 0,
  }),
  ɾ: new MouthExpression({
    duration: characterDuration,
    aa: 0.05,
    ee: 0,
    ih: 0.14,
    oh: 0.11,
    ou: 0.14,
  }),
  ɽ: new MouthExpression({
    duration: characterDuration,
    aa: 0.09,
    ee: 0,
    ih: 0,
    oh: 0.09,
    ou: 0.44,
  }),
  ɸ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.45,
  }),
  β: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.34,
  }),
  f: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.05,
    ou: 0.35,
  }),
  v: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.31,
  }),
  θ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.07,
    ih: 0.27,
    oh: 0,
    ou: 0.47,
  }),
  ð: new MouthExpression({
    duration: characterDuration,
    aa: 0.03,
    ee: 0,
    ih: 0.19,
    oh: 0,
    ou: 0.3,
  }),
  s: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0.85,
    oh: 0,
    ou: 0.12,
  }),
  z: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0.46,
    oh: 0,
    ou: 0.3,
  }),
  ʃ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.16,
    ih: 0.4,
    oh: 0,
    ou: 0.51,
  }),
  ʒ: new MouthExpression({
    duration: characterDuration,
    aa: 0.05,
    ee: 0.08,
    ih: 0.39,
    oh: 0,
    ou: 0.42,
  }),
  ʂ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0.49,
    oh: 0.1,
    ou: 0.05,
  }),
  ʐ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 1,
    oh: 0.05,
    ou: 0.17,
  }),
  ç: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.16,
    ih: 1,
    oh: 0,
    ou: 0.18,
  }),
  ʝ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.17,
    ih: 1,
    oh: 0,
    ou: 0.28,
  }),
  x: new MouthExpression({
    duration: characterDuration,
    aa: 0.23,
    ee: 0,
    ih: 0.21,
    oh: 0,
    ou: 0,
  }),
  ɣ: new MouthExpression({
    duration: characterDuration,
    aa: 0.11,
    ee: 0,
    ih: 0.2,
    oh: 0,
    ou: 0.15,
  }),
  χ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.2,
    ih: 0,
    oh: 0.18,
    ou: 0.46,
  }),
  ʁ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0.55,
    oh: 0,
    ou: 0.4,
  }),
  ħ: new MouthExpression({
    duration: characterDuration,
    aa: 0.07,
    ee: 0,
    ih: 0,
    oh: 0.16,
    ou: 0.32,
  }),
  ʕ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0.16,
    oh: 0,
    ou: 0.44,
  }),
  h: new MouthExpression({
    duration: characterDuration,
    aa: 0.26,
    ee: 0,
    ih: 0,
    oh: 0.17,
    ou: 0,
  }),
  ɦ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.28,
    ou: 0,
  }),
  ɬ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.19,
    ih: 0.42,
    oh: 0,
    ou: 0.3,
  }),
  ɮ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.19,
    ih: 0.3,
    oh: 0,
    ou: 0.26,
  }),
  ʋ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0.14,
  }),
  ɹ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.08,
    ih: 0,
    oh: 0.1,
    ou: 0.09,
  }),
  ɻ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.22,
    ou: 0.22,
  }),
  j: new MouthExpression({
    duration: characterDuration,
    aa: 0.11,
    ee: 0,
    ih: 0.94,
    oh: 0,
    ou: 0,
  }),
  ɰ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.15,
    ih: 0.21,
    oh: 0,
    ou: 0,
  }),
  l: new MouthExpression({
    duration: characterDuration,
    aa: 0.01,
    ee: 0.22,
    ih: 0.08,
    oh: 0,
    ou: 0,
  }),
  ɭ: new MouthExpression({
    duration: characterDuration,
    aa: 0.1,
    ee: 0.34,
    ih: 0.24,
    oh: 0,
    ou: 0,
  }),
  ʎ: new MouthExpression({
    duration: characterDuration,
    aa: 0.02,
    ee: 0.24,
    ih: 0.22,
    oh: 0,
    ou: 0,
  }),
  ʟ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.25,
    ih: 0.0,
    oh: 0,
    ou: 0,
  }),
  ʘ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.0,
    oh: 0,
    ou: 0.14,
  }),
  ɓ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.0,
    oh: 0,
    ou: 0,
  }),
  ǀ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.0,
    oh: 0,
    ou: 0.27,
  }),
  ɗ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.09,
    ih: 0.1,
    oh: 0,
    ou: 0.28,
  }),
  ǃ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.04,
    oh: 0.09,
    ou: 0.06,
  }),
  ʄ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.42,
    oh: 0,
    ou: 0.35,
  }),
  ǂ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.57,
    oh: 0.15,
    ou: 0.07,
  }),
  ɠ: new MouthExpression({
    duration: characterDuration,
    aa: 0.09,
    ee: 0.0,
    ih: 0.0,
    oh: 0.11,
    ou: 0,
  }),
  ǁ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.0,
    oh: 0.15,
    ou: 0.19,
  }),
  ʛ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.13,
    ih: 0.0,
    oh: 0.15,
    ou: 0.03,
  }),
  ʍ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.0,
    oh: 0.25,
    ou: 0.34,
  }),
  ʑ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.3,
    ih: 0.22,
    oh: 0.0,
    ou: 0.0,
  }),
  ɕ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.31,
    ih: 0.34,
    oh: 0.0,
    ou: 0.0,
  }),
  w: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.0,
    ih: 0.0,
    oh: 0.0,
    ou: 1,
  }),
  ɺ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0.08,
    ih: 0.18,
    oh: 0.0,
    ou: 0.19,
  }),
  ɥ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.22,
    ou: 0.86,
  }),
  ɧ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.22,
    ou: 0.27,
  }),
  ʜ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.16,
    ou: 0.23,
  }),
  ʢ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.16,
    ou: 0.17,
  }),
  ʡ: new MouthExpression({
    duration: characterDuration,
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0.13,
    ou: 0.16,
  }),
  //VRM Model Reference: https://vrm-viewer-48655.web.app/
  //IPA Reference: https://www.seeingspeech.ac.uk/ipa-charts/
};
