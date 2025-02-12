import * as Ort from 'onnxruntime-web';

export default class {
  #ort = null;
  #sessions = [];

  constructor({ ort = Ort, basePath = '/onnx/', numThreads = navigator.hardwareConcurrency } = {}) {
    this.#ort = ort;
    this.#ort.env.wasm.wasmPaths = basePath;
    this.#ort.env.wasm.numThreads = numThreads;
  }

  destroy() {
    this.#sessions = [];
  }

  async loadSession(voiceData) {
    if (!this.#sessions[voiceData[1]]) {
      this.#sessions[voiceData[1]] = await this.#ort.InferenceSession.create(voiceData[1]);
    }
    return Promise.resolve(this.#sessions[voiceData[1]]);
  }

  async generate(phonemeData, voiceData, speaker = 0) {
    const feeds = {
      input: new this.#ort.Tensor('int64', phonemeData.phoneme_ids, [1, phonemeData.phoneme_ids.length]),
      input_lengths: new this.#ort.Tensor('int64', [phonemeData.phoneme_ids.length]),
      scales: new this.#ort.Tensor('float32', [
        voiceData[0].inference.noise_scale,
        voiceData[0].inference.length_scale,
        voiceData[0].inference.noise_w,
      ]),
    };
    if (Object.keys(voiceData[0].speaker_id_map).length) {
      if (speaker >= voiceData[0].num_speakers) {
        throw new Error(`Speaker ${speaker} does not exist`);
      }
      feeds.sid = new this.#ort.Tensor('int64', [speaker]);
    }

    const {
      output: { data: pcm },
    } = await this.loadSession(voiceData).then(async (session) => session.run(feeds));
    const result = this.#convertPCMToWAV(pcm, voiceData[0].audio.sample_rate);
    const file = new Blob([result.wavBuffer], { type: 'audio/x-wav' });
    const duration = Math.floor(result.duration * 1000);

    return {
      phonemeData,
      file,
      duration,
    };
  }

  #convertPCMToWAV(buffer, sampleRate, numChannels = 1) {
    const bufferLength = buffer.length;
    const headerLength = 44;
    const view = new DataView(new ArrayBuffer(bufferLength * numChannels * 2 + headerLength));

    view.setUint32(0, 0x46464952, true); // "RIFF"
    view.setUint32(4, view.buffer.byteLength - 8, true); // RIFF size
    view.setUint32(8, 0x45564157, true); // "WAVE"

    view.setUint32(12, 0x20746d66, true); // Subchunk1ID ("fmt ")
    view.setUint32(16, 0x10, true); // Subchunk1Size
    view.setUint16(20, 0x0001, true); // AudioFormat
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, numChannels * 2 * sampleRate, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    view.setUint32(36, 0x61746164, true); // Subchunk2ID ("data")
    view.setUint32(40, 2 * bufferLength, true); // Subchunk2Size

    let p = headerLength;
    for (let i = 0; i < bufferLength; i++) {
      const v = buffer[i];
      if (v >= 1) view.setInt16(p, 0x7fff, true);
      else if (v <= -1) view.setInt16(p, -0x8000, true);
      else view.setInt16(p, (v * 0x8000) | 0, true);
      p += 2;
    }
    const wavBuffer = view.buffer;
    const duration = bufferLength / (sampleRate * numChannels);

    return { wavBuffer, duration };
  }
}
