import { createRef } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Cropper, { CropperMethods } from "@/app/components/Cropper/Cropper";
import { getImageSize, resizeImage } from "@/lib/utils/media";

jest.mock("@/lib/utils/media", () => ({
  getImageSize: jest.fn(),
  resizeImage: jest.fn(),
}));

jest.mock("lodash.throttle", () => (callback: unknown) => callback);

const mockGetImageSize = getImageSize as jest.Mock;
const mockResizeImage = resizeImage as jest.Mock;

describe("Cropper", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockGetImageSize.mockResolvedValue({ height: 200, width: 400 });
    mockResizeImage.mockResolvedValue("resized-image");
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 400,
      height: 400,
      left: 0,
      right: 600,
      toJSON: () => ({}),
      top: 0,
      width: 600,
      x: 0,
      y: 0,
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("initializes crop geometry, supports imperative crop and base64 export", async () => {
    const onCrop = jest.fn();
    const ref = createRef<CropperMethods>();

    render(
      <Cropper
        ref={ref}
        baseImg="data:image/png;base64,source"
        loading
        maxHeight={250}
        maxWidth={450}
        onCrop={onCrop}
      />,
    );

    expect(screen.getAllByAltText("img")).toHaveLength(2);

    await waitFor(() => {
      expect(onCrop).toHaveBeenLastCalledWith(
        { h: 300, w: 500 },
        { x: 0, y: 0 },
        { h: 200, w: 400 },
      );
    });

    act(() => {
      ref.current?.crop({ h: 500, w: 1000 });
    });

    await waitFor(() => {
      expect(onCrop).toHaveBeenLastCalledWith(
        { h: 250, w: 450 },
        expect.any(Object),
        { h: 200, w: 400 },
      );
    });

    await expect(ref.current?.getImgBase64()).resolves.toBe("resized-image");
    expect(mockResizeImage).toHaveBeenCalledWith(
      "data:image/png;base64,source",
      {
        h: 200,
        w: 400,
      },
    );
  });

  it("updates crop state through mouse and wheel interactions", async () => {
    const onCrop = jest.fn();
    const { container } = render(
      <Cropper baseImg="base-image" onCrop={onCrop} />,
    );

    await waitFor(() => {
      expect(onCrop).toHaveBeenLastCalledWith(
        { h: 300, w: 500 },
        { x: 0, y: 0 },
        { h: 200, w: 400 },
      );
    });

    const cropBox = container.querySelector(".cropper_crop_box") as HTMLElement;
    const cropperContainer = container.querySelector(
      ".cropper_container",
    ) as HTMLElement;
    let imageResizeBox = container.querySelector(
      ".cropper_img_resize_box",
    ) as HTMLElement;

    fireEvent.mouseDown(cropBox, { clientX: 120, clientY: 140 });
    fireEvent.mouseMove(cropperContainer, { clientX: 150, clientY: 170 });
    fireEvent.mouseUp(cropperContainer);

    await waitFor(() => {
      const currentImageResizeBox = container.querySelector(
        ".cropper_img_resize_box",
      ) as HTMLElement;
      expect(cropBox).toHaveStyle(
        "transform: translateX(80px) translateY(80px)",
      );
      expect(currentImageResizeBox).toHaveStyle(
        "transform: translateX(130px) translateY(130px)",
      );
    });

    imageResizeBox = container.querySelector(
      ".cropper_img_resize_box",
    ) as HTMLElement;
    fireEvent.mouseDown(imageResizeBox, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(cropperContainer, { clientX: 120, clientY: 130 });
    fireEvent.mouseUp(cropperContainer);

    await waitFor(() => {
      expect(onCrop).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.any(Object),
      );
    });

    fireEvent.wheel(cropperContainer, {
      clientX: 200,
      clientY: 200,
      deltaY: -1,
    });

    await waitFor(() => {
      const currentCropBox = container.querySelector(
        ".cropper_crop_box",
      ) as HTMLElement;
      const currentImageResizeBox = container.querySelector(
        ".cropper_img_resize_box",
      ) as HTMLElement;
      expect(currentCropBox).toHaveStyle("width: 550px; height: 330px");
      expect(currentImageResizeBox).toHaveStyle(
        "width: 440.00000000000006px; height: 220.00000000000003px",
      );
    });
  });

  it("resets all geometry when base image is cleared", async () => {
    const onCrop = jest.fn();
    const { rerender } = render(
      <Cropper baseImg="base-image" onCrop={onCrop} />,
    );

    await waitFor(() => {
      expect(mockGetImageSize).toHaveBeenCalledWith("base-image");
    });

    rerender(<Cropper baseImg="" onCrop={onCrop} />);

    await waitFor(() => {
      expect(onCrop).toHaveBeenLastCalledWith(
        { h: 0, w: 0 },
        { x: 0, y: 0 },
        { h: 0, w: 0 },
      );
    });
  });
});
