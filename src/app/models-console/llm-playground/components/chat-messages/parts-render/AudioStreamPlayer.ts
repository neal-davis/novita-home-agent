export default class AudioStreamPlayer {
  audioCtx: AudioContext;
  queue: ArrayBuffer[];
  playTime: number;
  isDecoding: boolean;

  // PCM audio parameters - these should match the server's audio output
  sampleRate: number = 24000; // Common for TTS models
  channels: number = 1; // Mono
  bytesPerSample: number = 2; // 16-bit PCM

  // media destination + HTMLAudioElement
  mediaDest: MediaStreamAudioDestinationNode;

  collectedPCMData: Int16Array[] = [];

  constructor() {
    this.audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.queue = [];
    this.playTime = this.audioCtx.currentTime;
    this.isDecoding = false;

    // create a MediaStream destination so we can pipe WebAudio output to an <audio> element
    this.mediaDest = this.audioCtx.createMediaStreamDestination();
  }

  async addBase64Chunk(base64: string) {
    try {
      const clean = base64.replace(/^data:.*?;base64,/, "");
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // console.log("Processed PCM chunk:", bytes.length, "bytes");
      this.queue.push(bytes.buffer);
      this.collectedPCMData.push(new Int16Array(bytes.buffer));
      if (!this.isDecoding) this._decodePCMNext();
    } catch (error) {
      console.error("Error processing base64 chunk:", error);
    }
  }

  async _decodePCMNext() {
    if (this.queue.length === 0) {
      this.isDecoding = false;
      return;
    }

    this.isDecoding = true;
    const chunk = this.queue.shift() as ArrayBuffer;

    try {
      // Process raw PCM data instead of trying to decode as audio file
      const pcmData = new Int16Array(chunk);
      const numSamples = pcmData.length / this.channels;

      if (numSamples === 0) {
        console.warn("Empty PCM chunk received");
        this._decodePCMNext();
        return;
      }

      // Create AudioBuffer for raw PCM data
      const audioBuffer = this.audioCtx.createBuffer(
        this.channels,
        numSamples,
        this.sampleRate,
      );

      // Copy PCM data to AudioBuffer (convert from Int16 to Float32)
      for (let channel = 0; channel < this.channels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < numSamples; i++) {
          // Convert 16-bit PCM to float (-1.0 to 1.0)
          channelData[i] = pcmData[i * this.channels + channel] / 32768.0;
        }
      }

      // Create source and play
      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Connect to both media destination and speakers for better playback
      source.connect(this.mediaDest);
      source.connect(this.audioCtx.destination); // Enable local playback

      // Schedule playback using audioCtx clock
      const duration = audioBuffer.duration;
      const startAt = Math.max(this.playTime, this.audioCtx.currentTime + 0.01);
      source.start(startAt);

      this.playTime = startAt + duration;

      // cleanup when ended
      source.onended = () => {
        try {
          source.disconnect();
        } catch (e) {}
      };
    } catch (e) {
      console.error("PCM processing error:", e);
    }

    // continue processing queue
    this._decodePCMNext();
  }

  // ensure user gesture to start audio on mobile/Chrome
  async resumeIfRequired() {
    if (this.audioCtx.state === "suspended") {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        /* ignore */
      }
    }
  }

  // stop & cleanup
  async stop() {
    this.queue = [];
    try {
      await this.audioCtx.close();
    } catch (e) {}
  }

  // Generate WAV file from collected PCM data
  async generateWAVFile(): Promise<{ blob: Blob; url: string }> {
    if (this.collectedPCMData.length === 0) {
      throw new Error("No audio data collected");
    }

    // Calculate total length
    const totalSamples = this.collectedPCMData.reduce(
      (sum, chunk) => sum + chunk.length,
      0,
    );

    // Combine all PCM data
    const combinedPCM = new Int16Array(totalSamples);
    let offset = 0;
    for (const chunk of this.collectedPCMData) {
      combinedPCM.set(chunk, offset);
      offset += chunk.length;
    }

    // Create WAV file
    const wavBlob = this.createWAVBlob(combinedPCM);
    const url = URL.createObjectURL(wavBlob);

    // console.log(
    //   "Generated WAV file:",
    //   (totalSamples / this.sampleRate).toFixed(2),
    //   "seconds,",
    //   wavBlob.size,
    //   "bytes",
    // );

    return { blob: wavBlob, url };
  }

  // Create WAV file blob from PCM data
  private createWAVBlob(pcmData: Int16Array): Blob {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, this.channels, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * this.channels * 2, true);
    view.setUint16(32, this.channels * 2, true);
    view.setUint16(34, 16, true); // 16 bits per sample
    writeString(36, "data");
    view.setUint32(40, pcmData.length * 2, true);

    // PCM data
    const offset = 44;
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(offset + i * 2, pcmData[i], true);
    }

    return new Blob([buffer], { type: "audio/wav" });
  }
}
