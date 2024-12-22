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
}
