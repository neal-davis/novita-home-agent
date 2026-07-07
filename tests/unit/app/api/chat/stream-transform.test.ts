/* eslint-disable @typescript-eslint/no-var-requires */
const webStreams = require("stream/web");
global.TransformStream = webStreams.TransformStream;
global.ReadableStream = webStreams.ReadableStream;

jest.mock("gpt-tokenizer", () => ({ encode: (s: string) => Array.from(s) }));

const { slaTransform } = require("@/app/api/chat/stream-transform");

async function runThrough(chunks: any[]) {
  const ts = slaTransform()({ tools: {}, stopStream: () => {} });
  const out: any[] = [];
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();
  const pump = (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      out.push(value);
    }
  })();
  for (const c of chunks) await writer.write(c);
  await writer.close();
  await pump;
  return out;
}

describe("slaTransform", () => {
  it("drops raw chunks and annotates text-delta with tps/ttft from sla metrics", async () => {
    const out = await runThrough([
      {
        type: "raw",
        rawValue: { choices: [{}], sla_metrics: { ttft_ms: 12, ts_us: 1000 } },
      },
      {
        type: "raw",
        rawValue: { choices: [{}], sla_metrics: { ts_us: 2000 } },
      },
      { type: "text-delta", text: "hello" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe("text-delta");
    expect(out[0].providerMetadata.provider.ttft_ms).toBe(12);
    expect(out[0].providerMetadata.provider.tps).toBeGreaterThan(0);
  });

  it("ignores raw chunks whose choices are null", async () => {
    const out = await runThrough([
      { type: "raw", rawValue: { choices: null } },
      { type: "reasoning-delta", text: "think" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe("reasoning-delta");
    expect(out[0].providerMetadata.provider).toHaveProperty("tps");
  });

  it("passes through unrelated chunk types unchanged", async () => {
    const out = await runThrough([{ type: "finish", foo: 1 }]);
    expect(out).toEqual([{ type: "finish", foo: 1 }]);
  });
});
