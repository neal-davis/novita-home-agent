import { render } from "@testing-library/react";
import { useHideIntercom } from "@/app/models-console/llm-playground/hooks/use-hide-intercom";

function Probe() {
  useHideIntercom();
  return null;
}

describe("useHideIntercom", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    document.body.innerHTML = "";
  });

  it("hides the intercom widget once it appears in the DOM", () => {
    const el = document.createElement("div");
    el.className = "intercom-lightweight-app";
    document.body.appendChild(el);

    render(<Probe />);
    jest.advanceTimersByTime(500);

    expect(el.style.display).toBe("none");
    expect(el.style.visibility).toBe("hidden");
  });

  it("does nothing when the widget is absent (no throw)", () => {
    render(<Probe />);
    expect(() => jest.advanceTimersByTime(1500)).not.toThrow();
  });

  it("clears its interval on unmount", () => {
    const clearSpy = jest.spyOn(global, "clearInterval");
    const { unmount } = render(<Probe />);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
