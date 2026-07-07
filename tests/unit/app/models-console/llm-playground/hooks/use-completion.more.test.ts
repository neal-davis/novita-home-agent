import { act, renderHook, waitFor } from "@testing-library/react";
import { useCompletion } from "@/app/models-console/llm-playground/hooks/use-completion";
import { ReadableStream, TransformStream } from "stream/web";

let mockStreamParts: any[] = [];

(global as any).ReadableStream = ReadableStream;
(global as any).TransformStream = TransformStream;

jest.mock("ai", () => ({
  consumeStream: jest.fn(async ({ stream, onError }) => {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    } catch (error) {
      onError?.(error);
    }
  }),
  uiMessageChunkSchema: {},
}));

jest.mock("@ai-sdk/provider-utils", () => ({
  parseJsonEventStream: jest.fn(() => ({
    pipeThrough(transform: TransformStream) {
      return new ReadableStream({
        async start(controller) {
          const writer = transform.writable.getWriter();
          const reader = transform.readable.getReader();
          const pump = (async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          })();

          for (const part of mockStreamParts) {
            await writer.write(part);
          }
          await writer.close();
          await pump;
        },
      });
    },
  })),
}));

describe("useCompletion (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStreamParts = [];
    global.fetch = jest.fn();
  });

  it("throws when the response has no body", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      body: null,
      ok: true,
    });
    const { result } = renderHook(() =>
      useCompletion({ api: "/api/c", throttleMs: 0 }),
    );
    await act(async () => {
      await result.current.complete("prompt");
    });
    await waitFor(() =>
      expect(result.current.error?.message).toBe("The response body is empty."),
    );
  });

  it("surfaces an explicit stream error part", async () => {
    mockStreamParts = [
      { success: true, value: { type: "error", errorText: "stream blew up" } },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      body: new ReadableStream(),
      ok: true,
    });
    const { result } = renderHook(() =>
      useCompletion({ api: "/api/c", throttleMs: 0 }),
    );
    await act(async () => {
      await result.current.complete("prompt");
    });
    await waitFor(() =>
      expect(result.current.error?.message).toBe("stream blew up"),
    );
  });

  it("ignores AbortError without setting an error", async () => {
    const abortErr = Object.assign(new Error("aborted"), {
      name: "AbortError",
    });
    (global.fetch as jest.Mock).mockRejectedValueOnce(abortErr);
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useCompletion({ api: "/api/c", throttleMs: 0, onError }),
    );
    await act(async () => {
      await result.current.complete("prompt");
    });
    // AbortError path: no error stored, no onError, loading cleared
    expect(result.current.error).toBeUndefined();
    expect(onError).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("does not throttle SLA metrics when provider metadata lacks tps/ttft", async () => {
    mockStreamParts = [
      {
        success: true,
        value: {
          type: "text-delta",
          delta: "hi",
          providerMetadata: { provider: {} },
        },
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      body: new ReadableStream(),
      ok: true,
    });
    const { result } = renderHook(() =>
      useCompletion({ api: "/api/c", throttleMs: 0 }),
    );
    await act(async () => {
      await result.current.complete("prompt");
    });
    await waitFor(() => expect(result.current.completion).toBe("hi"));
    expect(result.current.slaMetrics).toBeUndefined();
  });
});
