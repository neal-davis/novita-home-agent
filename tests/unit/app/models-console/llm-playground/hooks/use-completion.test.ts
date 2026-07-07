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

describe("useCompletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStreamParts = [];
    global.fetch = jest.fn();
  });

  it("streams text deltas, SLA metrics and finish callback state", async () => {
    const onFinish = jest.fn();
    mockStreamParts = [
      {
        success: true,
        value: {
          delta: "hello",
          providerMetadata: { provider: { tps: 24, ttft_ms: 120 } },
          type: "text-delta",
        },
      },
      {
        success: true,
        value: {
          delta: " world",
          providerMetadata: { provider: { tps: 30, ttft_ms: 100 } },
          type: "text-delta",
        },
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      body: new ReadableStream(),
      ok: true,
    });

    const { result } = renderHook(() =>
      useCompletion({
        api: "/api/completion",
        body: { model: "demo" },
        headers: { Authorization: "Bearer token" },
        initialInput: "initial",
        onFinish,
        throttleMs: 0,
      }),
    );

    act(() => {
      result.current.handleInputChange({ target: { value: "prompt" } });
    });
    expect(result.current.input).toBe("prompt");

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    await waitFor(() => expect(result.current.completion).toBe("hello world"));
    expect(result.current.slaMetrics).toEqual({ tps: 30, ttft_ms: 100 });
    expect(onFinish).toHaveBeenCalledWith("prompt", "hello world");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/completion",
      expect.objectContaining({
        body: JSON.stringify({ model: "demo", prompt: "prompt" }),
        method: "POST",
        signal: expect.any(Object),
      }),
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("reports failed responses and stream parser errors", async () => {
    const onError = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      body: new ReadableStream(),
      ok: false,
      text: async () => "bad request",
    });

    const { result, rerender } = renderHook(
      ({ api }) =>
        useCompletion({
          api,
          onError,
          throttleMs: 0,
        }),
      { initialProps: { api: "/api/completion" } },
    );

    await act(async () => {
      await result.current.complete("prompt");
    });
    await waitFor(() =>
      expect(result.current.error?.message).toBe("bad request"),
    );
    expect(onError).toHaveBeenCalledWith(expect.any(Error));

    mockStreamParts = [
      {
        error: new Error("bad chunk"),
        success: false,
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      body: new ReadableStream(),
      ok: true,
    });
    rerender({ api: "/api/completion-2" });

    await act(async () => {
      await result.current.complete("prompt");
    });
    await waitFor(() =>
      expect(result.current.error?.message).toBe("bad chunk"),
    );
  });

  it("does not submit empty input and can abort an active request", async () => {
    let signal: AbortSignal | undefined;
    (global.fetch as jest.Mock).mockImplementation(
      (_url, init) =>
        new Promise(() => {
          signal = init.signal;
        }),
    );
    const { result } = renderHook(() =>
      useCompletion({
        api: "/api/completion",
        initialInput: "",
      }),
    );

    expect(result.current.handleSubmit()).toBeUndefined();
    act(() => {
      result.current.complete("prompt");
    });
    await waitFor(() => expect(signal).toBeDefined());

    act(() => {
      result.current.stop();
    });

    expect(signal?.aborted).toBe(true);
  });
});
