import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { useObstacleCollisionPadding } from "@/components/ui/standard/useObstacleCollisionPadding";

type RectInit = Pick<
  DOMRect,
  "top" | "right" | "bottom" | "left" | "width" | "height"
>;

function rect(init: RectInit): DOMRect {
  return {
    x: init.left,
    y: init.top,
    toJSON: () => init,
    ...init,
  } as DOMRect;
}

function obstacle(position: "fixed" | "sticky", bounds: RectInit): HTMLElement {
  const element = document.createElement("div");
  element.style.position = position;
  element.getBoundingClientRect = () => rect(bounds);
  return element;
}

function mockElementsFromPoint(
  implementation: (x: number, y: number) => Element[],
) {
  (document.elementsFromPoint as jest.Mock).mockImplementation(implementation);
}

function Probe() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.getBoundingClientRect = () =>
        rect({
          top: 320,
          right: 480,
          bottom: 356,
          left: 320,
          width: 160,
          height: 36,
        });
    }
    ref.current = node;
  }, []);
  const padding = useObstacleCollisionPadding(ref, true);

  return (
    <div>
      <div ref={setRef} />
      <output data-testid="padding">{JSON.stringify(padding)}</output>
    </div>
  );
}

async function expectPadding(expected: Record<string, number>) {
  await waitFor(() => {
    expect(JSON.parse(screen.getByTestId("padding").textContent ?? "")).toEqual(
      expected,
    );
  });
}

describe("useObstacleCollisionPadding", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps base padding when no edge obstacle exists", async () => {
    mockElementsFromPoint(() => []);

    render(<Probe />);

    await expectPadding({ top: 8, right: 8, bottom: 8, left: 8 });
  });

  it("ignores sticky elements that are not attached to a viewport edge", async () => {
    mockElementsFromPoint(() => [
      obstacle("sticky", {
        top: 120,
        right: 500,
        bottom: 160,
        left: 300,
        width: 200,
        height: 40,
      }),
    ]);

    render(<Probe />);

    await expectPadding({ top: 8, right: 8, bottom: 8, left: 8 });
  });

  it("adds top padding for a fixed header attached to the viewport top", async () => {
    mockElementsFromPoint((_, y) =>
      y <= 1
        ? [
            obstacle("fixed", {
              top: 0,
              right: 1024,
              bottom: 64,
              left: 0,
              width: 1024,
              height: 64,
            }),
          ]
        : [],
    );

    render(<Probe />);

    await expectPadding({ top: 72, right: 8, bottom: 8, left: 8 });
  });

  it("adds bottom padding for a fixed footer attached to the viewport bottom", async () => {
    mockElementsFromPoint((_, y) =>
      y >= 799
        ? [
            obstacle("fixed", {
              top: 736,
              right: 1024,
              bottom: 800,
              left: 0,
              width: 1024,
              height: 64,
            }),
          ]
        : [],
    );

    render(<Probe />);

    await expectPadding({ top: 8, right: 8, bottom: 72, left: 8 });
  });
});
