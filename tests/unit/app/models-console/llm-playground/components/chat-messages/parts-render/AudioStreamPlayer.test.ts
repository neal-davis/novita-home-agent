import AudioStreamPlayer from "@/app/models-console/llm-playground/components/chat-messages/parts-render/AudioStreamPlayer";

const startMock = jest.fn();
const disconnectMock = jest.fn();
const connectMock = jest.fn();
const resumeMock = jest.fn();
const closeMock = jest.fn();
const createObjectURLMock = jest.fn(() => "blob:audio");
const getChannelDataMock = jest.fn(() => new Float32Array(4));

function readBlob(blob: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob);
  });
}

class MockAudioContext {
  currentTime = 1;
  destination = {};
  state = "running";

  close = closeMock;
  createBuffer = jest.fn((_channels, length, sampleRate) => ({
    duration: length / sampleRate,
    getChannelData: getChannelDataMock,
  }));
  createBufferSource = jest.fn(() => ({
    connect: connectMock,
    disconnect: disconnectMock,
    onended: null as null | (() => void),
    start: startMock,
  }));
  createMediaStreamDestination = jest.fn(() => ({ stream: {} }));
  resume = resumeMock;
}

describe("AudioStreamPlayer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).AudioContext = MockAudioContext;
    (window as any).AudioContext = MockAudioContext;
    (window as any).webkitAudioContext = undefined;
    global.atob = (value: string) =>
      Buffer.from(value, "base64").toString("binary");
    global.URL.createObjectURL = createObjectURLMock;
  });

  it("queues base64 PCM chunks, converts samples and schedules playback", async () => {
    const player = new AudioStreamPlayer();
    const pcm = new Int16Array([0, 32767, -32768, 16384]);
    const base64 = Buffer.from(pcm.buffer).toString("base64");

    await player.addBase64Chunk(`data:audio/pcm;base64,${base64}`);

    expect(player.collectedPCMData).toHaveLength(1);
    expect(player.queue).toHaveLength(0);
    expect(startMock).toHaveBeenCalledWith(expect.any(Number));
    expect(connectMock).toHaveBeenCalledTimes(2);
    expect(getChannelDataMock.mock.results[0].value[0]).toBeCloseTo(0);
    expect(getChannelDataMock.mock.results[0].value[1]).toBeCloseTo(
      32767 / 32768,
    );
    expect(player.playTime).toBeGreaterThan(1);
  });

  it("handles invalid chunks, empty PCM and resume/stop errors gracefully", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const player = new AudioStreamPlayer();

    await player.addBase64Chunk("%%%");
    player.queue.push(new ArrayBuffer(0));
    await player._decodePCMNext();
    expect(warnSpy).toHaveBeenCalledWith("Empty PCM chunk received");

    player.audioCtx.state = "suspended";
    await player.resumeIfRequired();
    expect(resumeMock).toHaveBeenCalled();

    closeMock.mockRejectedValueOnce(new Error("close failed"));
    player.queue.push(new ArrayBuffer(2));
    await player.stop();
    expect(player.queue).toEqual([]);

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("generates a WAV blob from collected PCM data", async () => {
    const player = new AudioStreamPlayer();
    player.collectedPCMData = [new Int16Array([1, 2]), new Int16Array([3])];

    const { blob, url } = await player.generateWAVFile();

    expect(url).toBe("blob:audio");
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBe(50);

    const bytes = new Uint8Array(await readBlob(blob));
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe("WAVE");
    expect(String.fromCharCode(...bytes.slice(36, 40))).toBe("data");
  });

  it("rejects WAV generation when no audio was collected", async () => {
    const player = new AudioStreamPlayer();
    await expect(player.generateWAVFile()).rejects.toThrow(
      "No audio data collected",
    );
  });
});
