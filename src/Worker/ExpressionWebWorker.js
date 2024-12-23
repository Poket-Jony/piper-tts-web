import ExpressionWebRuntime from '../Runtime/Expression/ExpressionWebRuntime.js';

let expressionRuntime = null;

self.onmessage = ({ data: { type, data } }) => {
  switch (type) {
    case 'constructor':
      expressionRuntime = new ExpressionWebRuntime(data || {});
      break;
    case 'destroy':
      expressionRuntime.destroy();
      break;
    case 'loadPipeline':
      expressionRuntime.loadPipeline(...(data || [])).then(() => self.postMessage(null));
      break;
    case 'generate':
      expressionRuntime.generate(...(data || [])).then(self.postMessage);
      break;
    default:
      throw new Error('Unknown type ' + type);
  }
};
