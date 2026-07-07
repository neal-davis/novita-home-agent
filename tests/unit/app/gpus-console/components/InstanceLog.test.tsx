import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import InstanceLog from "@/app/gpus-console/components/InstanceLog";
import { requestText } from "@/api/api";

jest.mock("@/api/api", () => ({
  requestText: jest.fn(),
}));

const mockRequestText = requestText as jest.Mock;

class MockEventSource {
  static instances: MockEventSource[] = [];

  onerror: (() => void) | null = null;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onopen: (() => void) | null = null;
  close = jest.fn();

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  emit(data: string) {
    this.onmessage?.({ data } as MessageEvent<string>);
  }

  error() {
    this.onerror?.();
  }

  open() {
    this.onopen?.();
  }
}

function flushRaf() {
  const callback = mockRequestAnimationFrame.mock.calls.at(-1)?.[0];
  act(() => {
    callback?.(0);
  });
}

const mockRequestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  return mockRequestAnimationFrame.mock.calls.length;
});
const mockCancelAnimationFrame = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  MockEventSource.instances = [];
  mockRequestText.mockResolvedValue("downloaded logs");
  global.EventSource = MockEventSource as unknown as typeof EventSource;
  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame;
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("InstanceLog", () => {
  it("does not connect without an address and can hide the download action", () => {
    const { container } = render(
      <InstanceLog address="" downloadableLog={false} outHeight="240px" />,
    );

    expect(MockEventSource.instances).toHaveLength(0);
    expect(container.querySelector(".scrollShow")).toHaveStyle({
      height: "240px",
    });
    expect(container.querySelector(".icon-arrow-down-to-line")).toBeNull();
  });

  it("connects to SSE, appends log lines, auto-scrolls, and closes on address change", async () => {
    const { container, rerender } = render(
      <InstanceLog address="/logs" tailCount={25} />,
    );
    const scrollArea = container.querySelector(".scrollShow") as HTMLDivElement;
    Object.defineProperty(scrollArea, "scrollHeight", {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(scrollArea, "clientHeight", {
      configurable: true,
      value: 50,
    });

    expect(MockEventSource.instances[0].url).toBe(
      "/logs?follow=1&sse=1&timestamps=1&tail=25",
    );
    MockEventSource.instances[0].emit("first line");
    flushRaf();

    expect(await screen.findByText("first line")).toBeInTheDocument();
    jest.runOnlyPendingTimers();
    expect(scrollArea.scrollTop).toBe(150);

    rerender(<InstanceLog address="/logs?pod=a" tailCount={5} />);
    expect(MockEventSource.instances[0].close).toHaveBeenCalled();
    expect(MockEventSource.instances[1].url).toBe(
      "/logs?pod=a&follow=1&sse=1&timestamps=1&tail=5",
    );
  });

  it("tracks manual scroll and trims displayed logs to the latest 1000 entries", async () => {
    const { container } = render(<InstanceLog address="/stream" />);
    const scrollArea = container.querySelector(".scrollShow") as HTMLDivElement;

    fireEvent.scroll(scrollArea);
    for (let index = 0; index < 1005; index += 1) {
      MockEventSource.instances[0].emit(`line-${index}`);
    }
    flushRaf();

    expect(await screen.findByText("line-1004")).toBeInTheDocument();
    expect(screen.queryByText("line-0")).not.toBeInTheDocument();
    expect(screen.getByText("line-5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("retries the SSE connection before first open and clears retry after open", () => {
    render(<InstanceLog address="/retry" />);

    MockEventSource.instances[0].error();
    expect(MockEventSource.instances[0].close).toHaveBeenCalled();
    expect(MockEventSource.instances).toHaveLength(1);

    jest.advanceTimersByTime(5000);
    expect(MockEventSource.instances).toHaveLength(2);

    MockEventSource.instances[1].open();
    MockEventSource.instances[1].error();
    jest.advanceTimersByTime(5000);
    expect(MockEventSource.instances).toHaveLength(2);
  });

  it("downloads full logs with timestamps", async () => {
    const { container } = render(<InstanceLog address="/logs?pod=a" />);
    const anchor = document.createElement("a");
    const click = jest.spyOn(anchor, "click").mockImplementation();
    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockReturnValue(anchor);
    const removeChildSpy = jest
      .spyOn(document.body, "removeChild")
      .mockReturnValue(anchor);
    const createObjectURL = jest.fn(() => "blob:logs");
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    fireEvent.click(
      container.querySelector(".icon-arrow-down-to-line") as Element,
    );

    await waitFor(() => {
      expect(mockRequestText).toHaveBeenCalledWith({
        base_url: "",
        headers: { "Content-Type": "text/plain" },
        url: "/logs?pod=a&timestamps=1",
      });
    });
    await waitFor(() => {
      expect(click).toHaveBeenCalled();
    });
    expect(anchor.download).toBe("log.txt");
    expect(anchor.href).toBe("blob:logs");
    expect(removeChildSpy).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:logs");

    createElementSpy.mockRestore();
    removeChildSpy.mockRestore();
    click.mockRestore();
  });
});
