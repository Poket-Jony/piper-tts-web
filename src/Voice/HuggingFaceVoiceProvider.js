import FetchVoiceProvider from './FetchVoiceProvider.js';

export default class extends FetchVoiceProvider {
  constructor({ baseUrl = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/', separator = '-' } = {}) {
    super({ baseUrl, separator });
  }
}
