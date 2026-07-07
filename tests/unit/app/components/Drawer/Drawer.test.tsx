import { createRef } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Drawer, { DrawerMethods } from "@/app/components/Drawer/Drawer";
import { getImageSize, resizeImage } from "@/lib/utils/media";

jest.mock("@/lib/utils/utils", () => ({
  mobileCheck: jest.fn(() => false),
}));

jest.mock("@/lib/utils/media", () => ({
  getImageSize: jest.fn(),
  resizeImage: jest.fn(),
}));

const mockGetImageSize = getImageSize as jest.Mock;
const mockResizeImage = resizeImage as jest.Mock;

const context2d = {
  arc: jest.fn(),
  beginPath: jest.fn(),
  clearRect: jest.fn(),
  fill: jest.fn(),
  fillRect: jest.fn(),
  lineTo: jest.fn(),
  moveTo: jest.fn(),
  stroke: jest.fn(),
};

function installCanvasMocks() {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: jest.fn(() => context2d),
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    configurable: true,
    value: jest.fn(() => "data:image/png;base64,mask"),
  });
  Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: jest.fn(() => ({
      bottom: 100,
      height: 100,
      left: 0,
      right: 100,
      toJSON: () => ({}),
      top: 0,
      width: 100,
      x: 0,
      y: 0,
    })),
  });
}

function renderDrawer(
  props: Partial<React.ComponentProps<typeof Drawer>> = {},
  ref = createRef<DrawerMethods>(),
) {
  const setCanGenerate = jest.fn();
  const onGenerate = jest.fn();
  const onScale = jest.fn();
  const view = render(
    <Drawer
      ref={ref}
      rootPage="playground"
      width={100}
      height={100}
      canvasWidth={100}
      canvasHeight={100}
      loading={false}
      canScale
      canDrag
      setCanGenerate={setCanGenerate}
      onGenerate={onGenerate}
      onScale={onScale}
      {...props}
    />,
  );

  return { ...view, onGenerate, onScale, ref, setCanGenerate };
}

describe("Drawer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(context2d).forEach((fn) => {
      if (typeof fn === "function" && "mockClear" in fn) {
        fn.mockClear();
      }
    });
    jest.spyOn(console, "log").mockImplementation();
    installCanvasMocks();
    mockGetImageSize.mockResolvedValue({ height: 100, width: 100 });
    mockResizeImage.mockResolvedValue("data:image/png;base64,resized-mask");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("draws on the canvas, enables generation, clears and exports a resized mask", async () => {
    const { container, ref, setCanGenerate } = renderDrawer({
      brushSize: 20,
      brushColor: "#ff0000",
    });

    const canvas = container.querySelector("canvas")!;

    await waitFor(() => expect(canvas.width).toBe(200));

    fireEvent.mouseEnter(canvas);
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 30, clientY: 30 });
    fireEvent.mouseUp(canvas);

    expect(context2d.arc).toHaveBeenCalledWith(20, 20, 20, 0, Math.PI * 2);
    expect(context2d.stroke).toHaveBeenCalled();
    expect(setCanGenerate).toHaveBeenLastCalledWith(true);

    await expect(ref.current!.getMaskImg()).resolves.toBe(
      "data:image/png;base64,resized-mask",
    );
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith(
      "image/png",
    );
    expect(mockResizeImage).toHaveBeenCalledWith("data:image/png;base64,mask", {
      h: 100,
      w: 100,
    });

    act(() => ref.current!.clear());
    expect(context2d.clearRect).toHaveBeenCalled();
    expect(setCanGenerate).toHaveBeenLastCalledWith(false);
  });

  it("tracks result image history through visibility, undo and redo controls", async () => {
    const { rerender, ref } = renderDrawer({
      baseImage: "https://cdn.test/base.png",
      loading: true,
      resultImage: "https://cdn.test/result-1.png",
    });

    expect(document.querySelector(".preview_img_origin")).toHaveAttribute(
      "src",
      "https://cdn.test/base.png",
    );
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();

    await waitFor(() =>
      expect(document.querySelector(".preview_img_result")).toHaveAttribute(
        "src",
        "https://cdn.test/result-1.png",
      ),
    );

    act(() => ref.current!.setShowResult(false));
    await waitFor(() =>
      expect(document.querySelector(".preview_img_result")).toHaveStyle({
        visibility: "hidden",
      }),
    );

    rerender(
      <Drawer
        ref={ref}
        rootPage="playground"
        width={100}
        height={100}
        canvasWidth={100}
        canvasHeight={100}
        loading={false}
        canScale
        canDrag
        baseImage="https://cdn.test/base.png"
        resultImage="https://cdn.test/result-2.png"
        onGenerate={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(document.querySelector(".preview_img_result")).toHaveAttribute(
        "src",
        "https://cdn.test/result-2.png",
      ),
    );

    act(() => ref.current!.undo());
    await waitFor(() =>
      expect(
        document.querySelector(".preview_img_result"),
      ).not.toBeInTheDocument(),
    );

    act(() => ref.current!.redo());
    await waitFor(() =>
      expect(document.querySelector(".preview_img_result")).toHaveAttribute(
        "src",
        "https://cdn.test/result-2.png",
      ),
    );
  });

  it("scales with vertical wheel gestures and drags the board in drag mode", async () => {
    const { container, onScale, ref } = renderDrawer();
    const canvas = container.querySelector("canvas")!;
    const board = canvas.parentElement!;

    await waitFor(() => expect(canvas.width).toBe(200));

    fireEvent.wheel(canvas, { deltaX: 0, deltaY: -100 });
    expect(onScale).toHaveBeenCalledWith(1.1);

    fireEvent.wheel(canvas, { deltaX: 100, deltaY: 1 });
    expect(onScale).toHaveBeenCalledTimes(1);

    act(() => ref.current!.setDragMode(true));
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 40, clientY: 35 });
    fireEvent.mouseUp(canvas);

    await waitFor(() =>
      expect(board).toHaveStyle({
        transform: "translate3d(30px, 25px, 0) scale(1.1)",
      }),
    );
  });

  it("uses keyboard space to enter temporary drag mode when dragging is allowed", async () => {
    const { container } = renderDrawer();
    const canvas = container.querySelector("canvas")!;

    await waitFor(() => expect(canvas.width).toBe(200));

    fireEvent.keyDown(canvas, { keyCode: 32 });
    await waitFor(() => expect(canvas).toHaveStyle({ cursor: "grab" }));

    fireEvent.keyUp(canvas, { keyCode: 32 });
    await waitFor(() => expect(canvas).toHaveStyle({ cursor: "none" }));
  });
});
