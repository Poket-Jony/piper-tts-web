import RemoteVoiceProvider from './RemoteVoiceProvider.js';
import FetchProvider from '../FetchProvider.js';

export default class extends RemoteVoiceProvider {
  constructor({
    provider = new FetchProvider(),
    baseUrl = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/',
    separator = '-',
  } = {}) {
    super({ provider, baseUrl, separator });
  }
}
