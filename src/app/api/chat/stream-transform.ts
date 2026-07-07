import { TextStreamPart, ToolSet } from "ai";
import { encode } from "gpt-tokenizer";

/**
 * chunk
 * 1. start
 * 2. start-step
 * 3. reasoning-start
 * 4. reasoning-delta
 * 5. text-start
 * 6. text-delta
 * 7. reasoning-end
 * 8. text-end
 * 9. finish-top
 * 10. finish
 * 11. [done]
 */

const calcTps = (chunkStr: string, ts_us: number[]) => {
  const tokens = encode(chunkStr).length;
  const time_cost = ts_us[1] - ts_us[0];
  const tps = time_cost !== 0 ? tokens / (time_cost / 1000 / 1000) : 0;
  return tps;
};

export const slaTransform =
  <TOOLS extends ToolSet>() =>
  (options: { tools: TOOLS; stopStream: () => void }) => {
    const ts_us = [0, 0];
    let ttft_ms = 0;
    let chunkStr = "";
    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        if (chunk.type === "raw") {
          const rawValue = chunk.rawValue as any;
          if (rawValue.choices === null) {
            return;
          }
          const sla_metrics = rawValue.sla_metrics;
          if (sla_metrics) {
            const { ttft_ms: ttft_ms_raw, ts_us: ts_us_raw } = sla_metrics;
            if (ttft_ms_raw) {
              ttft_ms = ttft_ms_raw;
            }
            if (ts_us_raw) {
              if (ts_us[0] === 0) {
                ts_us[0] = ts_us_raw;
              } else {
                ts_us[1] = ts_us_raw;
              }
            }
          }
          return;
        }
        if (chunk.type === "reasoning-delta" || chunk.type === "text-delta") {
          if (chunk.text) {
            chunkStr += chunk.text;
          }
          // calc tps
          const tps = calcTps(chunkStr, ts_us);

          controller.enqueue({
            ...chunk,
            providerMetadata: {
              provider: {
                tps,
                ttft_ms,
              },
            },
          });
          return;
        }
        controller.enqueue(chunk);
      },
    });
  };
