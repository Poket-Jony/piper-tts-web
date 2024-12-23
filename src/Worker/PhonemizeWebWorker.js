import PhonemizeWebRuntime from '../Runtime/Phonemize/PhonemizeWebRuntime.js';

let phonemizeRuntime = null;

self.onmessage = ({ data: { type, data } }) => {
  switch (type) {
    case 'constructor':
      phonemizeRuntime = new PhonemizeWebRuntime(data || {});
      break;
    case 'destroy':
      phonemizeRuntime.destroy();
      break;
    case 'loadModule':
      phonemizeRuntime.loadModule(...(data || [])).then(() => self.postMessage(null));
      break;
    case 'phonemize':
      phonemizeRuntime.phonemize(...(data || [])).then(self.postMessage);
      break;
    default:
      throw new Error('Unknown type ' + type);
  }
};
