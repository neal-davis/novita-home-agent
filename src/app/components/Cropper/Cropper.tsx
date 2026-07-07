import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Loader2, Plus } from "lucide-react";
import styles from "./Cropper.module.css";
import { getImageSize, resizeImage } from "@/lib/utils/media";
import throttle from "lodash.throttle";

type CropperProps = {
  baseImg: string;
  maxWidth?: number;
  maxHeight?: number;
  loading?: boolean;
  onCrop: (
    size: { w: number; h: number },
    center: { x: number; y: number },
    imgSize: { w: number; h: number },
  ) => void;
};

export interface CropperMethods {
  getImgBase64: () => Promise<string>;
  crop: (size: { w?: number; h?: number }) => void;
}

interface ImgResizerMethods {
  getImgBase64: () => Promise<string>;
}

const Cropper = forwardRef<CropperMethods, CropperProps>(
  ({ baseImg, loading, maxWidth, maxHeight, onCrop }: CropperProps, ref) => {
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
    const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
    const [cropSize, setCropSize] = useState({ w: 0, h: 0 });
    const [cropPos, setCropPos] = useState({ x: 0, y: 0 });

    const baseImgSize = useRef({ w: 0, h: 0 });
    const baseCropSize = useRef({ w: 0, h: 0 });
    const cropScale = useRef(1);
    const cropperContainerEl = useRef<HTMLDivElement>(null);
    const cropperContainerRect = useRef<DOMRect | null>(null);
    const draggingImg = useRef(false);
    const draggingCrop = useRef(false);
    const resizingCropDown = useRef(false);
    const resizingCropUp = useRef(false);
    const resizingCropLeft = useRef(false);
    const resizingCropRight = useRef(false);
    const resizingImgNE = useRef(false);
    const resizingImgSE = useRef(false);
    const resizingImgSW = useRef(false);
    const resizingImgNW = useRef(false);
    const lastImgPos = useRef({ x: 0, y: 0 });
    const lastImgSize = useRef({ w: 0, h: 0 });
    const lastCropPos = useRef({ x: 0, y: 0 });
    const lastCropSize = useRef({ w: 0, h: 0 });
    const dragStartMousePos = useRef({ x: 0, y: 0 });
    const imgResizer = useRef<ImgResizerMethods>(null);
    const imgResizer1 = useRef<ImgResizerMethods>(null);

    const resultSize = useRef({ w: 0, h: 0 });
    const resultCenterPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
      if (!baseImg) {
        setImgSize({ w: 0, h: 0 });
        setImgPos({ x: 0, y: 0 });
        setCropSize({ w: 0, h: 0 });
        setCropPos({ x: 0, y: 0 });
        baseImgSize.current = { w: 0, h: 0 };
        baseCropSize.current = { w: 0, h: 0 };
        cropScale.current = 1;
        draggingImg.current = false;
        draggingCrop.current = false;
        resizingCropDown.current = false;
        resizingCropUp.current = false;
        resizingCropLeft.current = false;
        resizingCropRight.current = false;
        resizingImgNE.current = false;
        resizingImgSE.current = false;
        resizingImgSW.current = false;
        resizingImgNW.current = false;
        resultSize.current = { w: 0, h: 0 };
        resultCenterPos.current = { x: 0, y: 0 };
        onCrop(resultSize.current, resultCenterPos.current, { w: 0, h: 0 });
        return;
      }
      cropScale.current = 1;
      const el = cropperContainerEl.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        console.log("container rect:", rect.width, rect.height);
        if (rect.height > rect.width || rect.height === 0) {
          el.style.height = `${rect.width}px`;
        }
      }
      getImageSize(baseImg).then((size) => {
        const containerRect =
          cropperContainerEl.current!.getBoundingClientRect();
        cropperContainerRect.current = containerRect;
        let scale = Math.min(
          (containerRect.width - 120) / size.width,
          (containerRect.height - 120) / size.height,
        );
        if (scale > 1) {
          scale = 1;
        }
        const imgSize = { w: size.width * scale, h: size.height * scale };
        const imgPos = {
          x: (containerRect.width - size.width * scale) / 2,
          y: (containerRect.height - size.height * scale) / 2,
        };
        setImgSize(imgSize);
        setImgPos(imgPos);
        lastImgPos.current = imgPos;
        lastImgSize.current = imgSize;
        const cropSize = { w: imgSize.w + 100, h: imgSize.h + 100 };
        const cropPos = { x: imgPos.x - 50, y: imgPos.y - 50 };
        setCropSize(cropSize);
        setCropPos(cropPos);
        lastCropPos.current = cropPos;
        lastCropSize.current = cropSize;

        baseImgSize.current = imgSize;
        baseCropSize.current = cropSize;
      });
      const prvt = (e: WheelEvent) => {
        e.preventDefault();
      };
      el?.addEventListener("wheel", prvt);
      return () => {
        el?.removeEventListener("wheel", prvt);
      };
    }, [baseImg, onCrop]);

    useEffect(() => {
      resultSize.current.w = cropSize.w / cropScale.current;
      resultSize.current.h = cropSize.h / cropScale.current;
      resultCenterPos.current.x =
        (imgPos.x + imgSize.w / 2 - (cropPos.x + cropSize.w / 2)) /
        cropScale.current;
      resultCenterPos.current.y =
        (cropPos.y + cropSize.h / 2 - (imgPos.y + imgSize.h / 2)) /
        cropScale.current;
      onCrop(resultSize.current, resultCenterPos.current, {
        w: imgSize.w / cropScale.current,
        h: imgSize.h / cropScale.current,
      });
    }, [cropPos, cropSize, imgPos, imgSize, cropScale, onCrop]);

    useImperativeHandle(ref, () => ({
      getImgBase64: async () => {
        return imgResizer.current?.getImgBase64() || "";
      },
      crop(size: { w?: number; h?: number }) {
        setCropSize(
          updateCropSize({
            w: size.w ? size.w * cropScale.current : cropSize.w,
            h: size.h ? size.h * cropScale.current : cropSize.h,
          }),
        );
      },
    }));

    function setLastData() {
      lastImgPos.current = imgPos;
      lastImgSize.current = imgSize;
      lastCropPos.current = cropPos;
      lastCropSize.current = cropSize;
    }

    function updateCropSize({ w, h }: { w: number; h: number }) {
      let newW = w,
        newH = h;
      let limited = false;
      if (maxWidth && Math.ceil(w / cropScale.current) > maxWidth) {
        newW = maxWidth * cropScale.current;
        limited = true;
      }
      if (maxHeight && Math.ceil(h / cropScale.current) > maxHeight) {
        newH = maxHeight * cropScale.current;
        limited = true;
      }
      return { w: newW, h: newH, limited };
    }

    const ImgResizer = forwardRef<
      ImgResizerMethods,
      { pos: { x: number; y: number } }
    >(({ pos }: { pos: { x: number; y: number } }, ref) => {
      const viewImgEl = useRef<HTMLImageElement>(null);

      useImperativeHandle(ref, () => ({
        getImgBase64: async () => {
          if (!viewImgEl.current) {
            return "";
          }
          const img = await resizeImage(baseImg, {
            w: imgSize.w / cropScale.current,
            h: imgSize.h / cropScale.current,
          });
          return img;
        },
      }));

      return (
        <>
          <div
            className={styles.cropper_img_resize_box}
            style={{
              width: imgSize.w,
              height: imgSize.h,
              transform: `translateX(${pos.x}px) translateY(${pos.y}px)`,
            }}
            onMouseDown={(e) => {
              console.log("resize img down");
              e.preventDefault();
              e.stopPropagation();
              draggingImg.current = true;
              dragStartMousePos.current = {
                x: e.clientX,
                y: e.clientY,
              };
              lastImgPos.current = imgPos;
            }}
          >
            {/* <span className={`${styles.cropper_face} ${styles.cropper_move}`}></span> */}
            <span className={`${styles.cropper_line} ${styles.line_e}`}></span>
            <span className={`${styles.cropper_line} ${styles.line_n}`}></span>
            <span className={`${styles.cropper_line} ${styles.line_w}`}></span>
            <span className={`${styles.cropper_line} ${styles.line_s}`}></span>
            <span
              className={`${styles.cropper_point} ${styles.point_ne}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingImgNE.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                lastImgPos.current = imgPos;
                lastImgSize.current = imgSize;
              }}
            ></span>
            <span
              className={`${styles.cropper_point} ${styles.point_nw}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingImgNW.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                lastImgPos.current = imgPos;
                lastImgSize.current = imgSize;
              }}
            ></span>
            <span
              className={`${styles.cropper_point} ${styles.point_sw}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingImgSW.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                lastImgPos.current = imgPos;
                lastImgSize.current = imgSize;
              }}
            ></span>
            <span
              className={`${styles.cropper_point} ${styles.point_se}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingImgSE.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                lastImgPos.current = imgPos;
                lastImgSize.current = imgSize;
              }}
            ></span>
          </div>
          <img
            ref={viewImgEl}
            className={styles.cropper_image}
            src={baseImg}
            alt="img"
            style={{
              width: imgSize.w,
              height: imgSize.h,
              transform: `translateX(${pos.x}px) translateY(${pos.y}px)`,
            }}
          />
        </>
      );
    });
    ImgResizer.displayName = "ImgResizer";

    return (
      <div className={styles.cropper}>
        {loading && (
          <div className={styles.loading}>
            <Loader2 className="h-10 w-10 animate-spin" color="white" />
          </div>
        )}
        <div
          ref={cropperContainerEl}
          className={`${styles.cropper_container} ${styles.cropper_bg}`}
          onMouseMove={(e) => {
            if (
              draggingImg.current &&
              dragStartMousePos.current &&
              lastCropPos.current
            ) {
              const newX =
                lastImgPos.current.x +
                (e.clientX - dragStartMousePos.current.x);
              const newY =
                lastImgPos.current.y +
                (e.clientY - dragStartMousePos.current.y);
              setImgPos({
                x: newX,
                y: newY,
              });
              resultCenterPos.current.x =
                newX +
                imgSize.w / 2 -
                (lastCropPos.current.x + lastCropSize.current.w / 2);
              resultCenterPos.current.y =
                lastCropPos.current.y +
                lastCropSize.current.h / 2 -
                (newY + imgSize.h / 2);
            }
            if (
              draggingCrop.current &&
              dragStartMousePos.current &&
              lastCropPos.current
            ) {
              const dx = e.clientX - dragStartMousePos.current.x;
              const dy = e.clientY - dragStartMousePos.current.y;
              setCropPos({
                x: lastCropPos.current.x + dx,
                y: lastCropPos.current.y + dy,
              });
              setImgPos({
                x: lastImgPos.current.x + dx,
                y: lastImgPos.current.y + dy,
              });
            }
            if (resizingCropDown.current) {
              const newH =
                lastCropSize.current.h +
                (e.clientY - dragStartMousePos.current.y);
              const newSize = updateCropSize({ w: cropSize.w, h: newH });
              setCropSize(() => ({
                w: newSize.w,
                h: newSize.h,
              }));
            }
            if (resizingCropUp.current) {
              const newH =
                lastCropSize.current.h -
                (e.clientY - dragStartMousePos.current.y);
              const newY =
                lastCropPos.current.y +
                (e.clientY - dragStartMousePos.current.y);
              const newSize = updateCropSize({ w: cropSize.w, h: newH });
              setCropSize(() => ({
                w: newSize.w,
                h: newSize.h,
              }));
              if (newSize.limited) {
                return;
              }
              setCropPos((prev) => ({
                x: prev.x,
                y: newY,
              }));
            }
            if (resizingCropLeft.current) {
              const newW =
                lastCropSize.current.w -
                (e.clientX - dragStartMousePos.current.x);
              const newX =
                lastCropPos.current.x +
                (e.clientX - dragStartMousePos.current.x);
              const newSize = updateCropSize({
                w: newW,
                h: cropSize.h,
              });
              setCropSize(() => ({
                w: newSize.w,
                h: newSize.h,
              }));
              if (newSize.limited) {
                return;
              }
              setCropPos((prev) => ({
                x: newX,
                y: prev.y,
              }));
            }
            if (resizingCropRight.current) {
              const newW =
                lastCropSize.current.w +
                (e.clientX - dragStartMousePos.current.x);
              const newSize = updateCropSize({
                w: newW,
                h: cropSize.h,
              });
              setCropSize(() => ({
                w: newSize.w,
                h: newSize.h,
              }));
            }
            if (resizingImgNE.current) {
              const newW =
                lastImgSize.current.w +
                (e.clientX - dragStartMousePos.current.x);
              const newH =
                (newW * baseImgSize.current.h) / baseImgSize.current.w;
              const newY =
                lastImgPos.current.y - (newH - lastImgSize.current.h);
              setImgSize(() => ({
                w: newW,
                h: newH,
              }));
              setImgPos((prev) => ({
                x: prev.x,
                y: newY,
              }));
            }
            if (resizingImgSE.current) {
              const newW =
                lastImgSize.current.w +
                (e.clientX - dragStartMousePos.current.x);
              const newH =
                (newW * baseImgSize.current.h) / baseImgSize.current.w;
              setImgSize(() => ({
                w: newW,
                h: newH,
              }));
            }
            if (resizingImgSW.current) {
              const newW =
                lastImgSize.current.w -
                (e.clientX - dragStartMousePos.current.x);
              const newH =
                (newW * baseImgSize.current.h) / baseImgSize.current.w;
              const newX =
                lastImgPos.current.x + (lastImgSize.current.w - newW);
              setImgSize(() => ({
                w: newW,
                h: newH,
              }));
              setImgPos((prev) => ({
                x: newX,
                y: prev.y,
              }));
            }
            if (resizingImgNW.current) {
              const newW =
                lastImgSize.current.w -
                (e.clientX - dragStartMousePos.current.x);
              const newH =
                (newW * baseImgSize.current.h) / baseImgSize.current.w;
              const newX =
                lastImgPos.current.x + (lastImgSize.current.w - newW);
              const newY =
                lastImgPos.current.y + (lastImgSize.current.h - newH);
              setImgSize(() => ({
                w: newW,
                h: newH,
              }));
              setImgPos(() => ({
                x: newX,
                y: newY,
              }));
            }
          }}
          onMouseUp={() => {
            draggingImg.current = false;
            draggingCrop.current = false;
            resizingCropDown.current = false;
            resizingCropUp.current = false;
            resizingCropLeft.current = false;
            resizingCropRight.current = false;
            resizingImgNE.current = false;
            resizingImgSE.current = false;
            resizingImgSW.current = false;
            resizingImgNW.current = false;
          }}
          onWheel={throttle(
            (e) => {
              e.preventDefault();
              e.stopPropagation();
              let newCropScale = 1;
              if (e.deltaY < 0) {
                newCropScale = 1.1;
              }
              if (e.deltaY > 0) {
                newCropScale = 0.9;
              }
              cropScale.current = cropScale.current * newCropScale;
              const newCropWidth = cropSize.w * newCropScale;
              const newCropHeight = cropSize.h * newCropScale;
              const newImgWidth = imgSize.w * newCropScale;
              const newImgHeight = imgSize.h * newCropScale;
              if (cropScale.current > 10 || cropScale.current < 0.1) {
                return;
              }

              const newCropPosX =
                ((e.clientX - cropperContainerRect.current!.x - cropPos.x) /
                  cropSize.w) *
                  (cropSize.w - newCropWidth) +
                cropPos.x;
              const newCropPosY =
                ((e.clientY - cropperContainerRect.current!.y - cropPos.y) /
                  cropSize.h) *
                  (cropSize.h - newCropHeight) +
                cropPos.y;

              const newImgPosX =
                ((e.clientX - cropperContainerRect.current!.x - imgPos.x) /
                  imgSize.w) *
                  (imgSize.w - newImgWidth) +
                imgPos.x;
              const newImgPosY =
                ((e.clientY - cropperContainerRect.current!.y - imgPos.y) /
                  imgSize.h) *
                  (imgSize.h - newImgHeight) +
                imgPos.y;

              setImgSize({ w: newImgWidth, h: newImgHeight });
              setImgPos({ x: newImgPosX, y: newImgPosY });
              setCropSize({ w: newCropWidth, h: newCropHeight });
              setCropPos({ x: newCropPosX, y: newCropPosY });
            },
            30,
            { leading: true, trailing: false },
          )}
        >
          <div className={`${styles.cropper_wrap_box}`}>
            <ImgResizer ref={imgResizer} pos={{ x: imgPos.x, y: imgPos.y }} />
          </div>
          <div
            className={`${styles.cropper_drag_box} ${styles.cropper_modal} ${styles.cropper_move}`}
          ></div>
          <div
            className={styles.cropper_crop_box}
            style={{
              width: cropSize.w,
              height: cropSize.h,
              transform: `translateX(${cropPos.x}px) translateY(${cropPos.y}px)`,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              draggingImg.current = false;
              draggingCrop.current = true;
              dragStartMousePos.current = {
                x: e.clientX,
                y: e.clientY,
              };
              setLastData();
            }}
          >
            <span className={styles.cropper_view_box}>
              <ImgResizer
                ref={imgResizer1}
                pos={{ x: imgPos.x - cropPos.x, y: imgPos.y - cropPos.y }}
              />
            </span>
            <span
              className={`${styles.cropper_face} ${styles.cropper_move}`}
            ></span>
            <span className={styles.cropper_center_cross}>
              <Plus />
            </span>
            <span
              className={`${styles.cropper_line} ${styles.line_e}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingCropRight.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                setLastData();
              }}
            ></span>
            <span
              className={`${styles.cropper_line} ${styles.line_n}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingCropUp.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                setLastData();
              }}
            ></span>
            <span
              className={`${styles.cropper_line} ${styles.line_w}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingCropLeft.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                setLastData();
              }}
            ></span>
            <span
              className={`${styles.cropper_line} ${styles.line_s}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingCropDown.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                setLastData();
              }}
            ></span>
            <span
              className={`${styles.cropper_point} ${styles.point_e}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingCropRight.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                setLastData();
              }}
            ></span>
            <span
              className={`${styles.cropper_point} ${styles.point_n}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingCropUp.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                setLastData();
              }}
            ></span>
            <span
              className={`${styles.cropper_point} ${styles.point_w}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingCropLeft.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                setLastData();
              }}
            ></span>
            <span
              className={`${styles.cropper_point} ${styles.point_s}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resizingCropDown.current = true;
                dragStartMousePos.current = { x: e.clientX, y: e.clientY };
                setLastData();
              }}
            ></span>
          </div>
        </div>
      </div>
    );
  },
);

Cropper.displayName = "Cropper";

export default Cropper;
