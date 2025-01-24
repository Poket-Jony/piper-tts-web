export default class {
  duration = null;
  angry = null;
  happy = null;
  relaxed = null;
  sad = null;
  surprised = null;
  neutral = null;
  emotion = null;
  emotionScore = null;

  constructor({
    duration = 0,
    angry = 0,
    happy = 0,
    relaxed = 0,
    sad = 0,
    surprised = 0,
    neutral = 0,
    emotion = '',
    emotionScore = 0,
  } = {}) {
    this.duration = duration;
    this.angry = angry;
    this.happy = happy;
    this.relaxed = relaxed;
    this.sad = sad;
    this.surprised = surprised;
    this.neutral = neutral;
    this.emotion = emotion;
    this.emotionScore = emotionScore;
  }

  static fromDistilbertGoEmotions(sentiment, duration = -1) {
    const expression = new this({ duration: duration });
    const score = Math.min(sentiment.score * 2, 1);
    const labelAppliers = {
      admiration: (expression) => {
        expression.relaxed = score;
        expression.surprised = score;
      },
      amusement: (expression) => {
        expression.happy = score;
        expression.surprised = score * 0.2;
      },
      anger: (expression) => {
        expression.angry = score;
      },
      annoyance: (expression) => {
        expression.angry = score * 0.8;
        expression.sad = score * 0.2;
      },
      approval: (expression) => {
        expression.relaxed = score;
      },
      caring: (expression) => {
        expression.relaxed = score;
        expression.sad = score * 0.5;
        expression.happy = score * 0.1;
      },
      confusion: (expression) => {
        expression.angry = score * 0.5;
        expression.surprised = score * 0.4;
        expression.sad = score * 0.1;
      },
      curiosity: (expression) => {
        expression.happy = score * 0.5;
        expression.surprised = score * 0.6;
      },
      desire: (expression) => {
        expression.relaxed = score;
        expression.angry = score * 0.5;
      },
      disappointment: (expression) => {
        expression.sad = score * 0.7;
        expression.angry = score * 0.7;
      },
      disapproval: (expression) => {
        expression.angry = score;
        expression.relaxed = score * 0.5;
      },
      disgust: (expression) => {
        expression.angry = score;
        expression.relaxed = score * 0.7;
      },
      embarrassment: (expression) => {
        expression.sad = score;
        expression.relaxed = score * 0.15;
      },
      excitement: (expression) => {
        expression.happy = score * 0.9;
        expression.surprised = score * 0.9;
      },
      fear: (expression) => {
        expression.sad = score;
        expression.surprised = score * 0.8;
      },
      gratitude: (expression) => {
        expression.happy = score;
        expression.relaxed = score * 0.5;
      },
      grief: (expression) => {
        expression.sad = score;
        expression.anger = score * 0.5;
      },
      joy: (expression) => {
        expression.happy = score;
      },
      love: (expression) => {
        expression.happy = score * 0.5;
        expression.relaxed = score * 0.5;
        expression.sad = score * 0.2;
      },
      nervousness: (expression) => {
        expression.sad = score;
        expression.angry = score * 0.3;
        expression.surprised = score * 0.5;
      },
      optimism: (expression) => {
        expression.happy = score;
        expression.relaxed = score * 0.3;
      },
      pride: (expression) => {
        expression.happy = score * 0.2;
        expression.angry = score * 0.3;
        expression.relaxed = score;
      },
      realization: (expression) => {
        expression.happy = score * 0.2;
        expression.surprised = score;
      },
      relief: (expression) => {
        expression.relaxed = score;
      },
      remorse: (expression) => {
        expression.sad = score;
        expression.angry = score * 0.15;
      },
      sadness: (expression) => {
        expression.sad = score;
      },
      surprise: (expression) => {
        expression.surprised = score;
      },
      neutral: (expression) => {
        expression.neutral = score;
      },
    };

    const label = sentiment.label.toLowerCase();
    if (label in labelAppliers) {
      labelAppliers[label](expression);
    } else {
      expression.neutral = score;
    }
    expression.emotion = label;
    expression.emotionScore = score;

    return expression;
  }
}
