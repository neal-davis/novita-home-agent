import {
  CSSProperties,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Loader2 } from "lucide-react";
import throttle from "lodash.throttle";
import debounce from "lodash.debounce";
import styles from "./Drawer.module.css";
import { mobileCheck } from "@/lib/utils/utils";
import { getImageSize, resizeImage } from "@/lib/utils/media";

export type DrawerProps = {
  rootPage: string;
  disabled?: boolean;
  children?: ReactNode[];
  brushSize?: number;
  brushColor?: string;
  baseImage?: string;
  resultImage?: string;
  canScale?: boolean;
  canDrag?: boolean;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  controlPanelWidth?: number;
  loading: boolean;
  onScale?: (scale: number) => void;
  setCanGenerate?: (canGenerate: boolean) => void;
  onGenerate: (maskImage: string) => void;
  onAbort?: () => void;
  backBtn?: ReactNode;
  onBack?: () => void;
  widgets?: ReactNode[];
};

type Position = {
  x: number;
  y: number;
};

type History = {
  type: "draw" | "image" | "clear";
  data: string | Position[];
  scale?: number;
  brushSize?: number;
};

const MAX_SCALE = 2.5;
const MIN_SCALE = 0.5;
const DEFAULT_BRUSH_COLOR = "#23d57c";

function initCanvasStyle(
  canvas: HTMLCanvasElement,
  fillColor: string,
  strokeColor: string,
  lineWidth?: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  // ctx.translate(0.5, 0.5);
  ctx.fillStyle = fillColor;
  ctx.imageSmoothingEnabled = true;
  ctx.strokeStyle = strokeColor;
  if (lineWidth) {
    // ctx.lineWidth = lineWidth * 2;
    ctx.lineWidth = lineWidth;
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function drawPath(
  canvasEl: HTMLCanvasElement,
  path: Position[],
  lineWidth: number,
) {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) {
    return;
  }
  if (path.length === 0) {
    return;
  }
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  ctx.lineWidth = lineWidth;
  for (const point of path) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

export interface DrawerMethods {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  getMaskImg: () => Promise<string | undefined>;
  setScale: (s: number) => void;
  setBrushSize: (s: number) => void;
  setDragMode: (drag: boolean) => void;
  setShowResult: (show: boolean) => void;
}

const Drawer = forwardRef<DrawerMethods, DrawerProps>(
  (props: DrawerProps, ref) => {
    const [resultImg, setResultImg] = useState("");
    const [showResult, setShowResult] = useState(true);
    const [showBrush, setShowBrush] = useState(false);
    const [brushSize, setBrushSize] = useState(props.brushSize || 30);
    const [dragMode, setDragMode] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [scale, setScale] = useState(1);
    const [boardTranslatePos, setBoardTranslatePos] = useState({ x: 0, y: 0 });
    const [canvasBoardStyle, setCanvasBoardStyle] = useState<CSSProperties>({});
    const { setCanGenerate } = props;

    const baseImgSize = useRef({ w: 0, h: 0 });
    const baseImgEl = useRef<HTMLImageElement | null>(null);
    const canvasEl = useRef<HTMLCanvasElement | null>(null);
    const maskCanvas = useRef<HTMLCanvasElement | null>(null);
    const wrapperEl = useRef<HTMLDivElement | null>(null);
    const brushEl = useRef<HTMLDivElement | null>(null);
    const drawerBoardEl = useRef<HTMLDivElement | null>(null);
    const wrapperRect = useRef<DOMRect | null>(null);
    const canvasRect = useRef<DOMRect | null>(null);
    const drawing = useRef(false);
    const optHistory = useRef<History[]>([]);
    const undoOptHistory = useRef<History[]>([]);
    const brushColor = useRef(props.brushColor || DEFAULT_BRUSH_COLOR);
    const brushPos = useRef({ x: 0, y: 0 });
    const dragStartMousePos = useRef({ x: 0, y: 0 });
    const dragStartBoradPos = useRef({ x: 0, y: 0 });

    const currentBrushPath = useRef<Position[]>([]);

    const reDraw = useCallback(
      (canvas: HTMLCanvasElement) => {
        const drawHistory: History[] = getCurrentDrawHistory();
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const h of drawHistory) {
          if (h.type !== "draw") {
            continue;
          }
          const hScale = h.scale || 1;
          const drawPositions = (h.data as Position[]).map((p) => ({
            x: p.x / hScale,
            y: p.y / hScale,
          }));
          drawPath(canvas, drawPositions, (h.brushSize || brushSize) / hScale);
        }
        setCanGenerate?.(drawHistory.length > 0);
      },
      [brushSize, setCanGenerate],
    );

    const updateCanvas = useCallback(async () => {
      if (drawing.current) {
        return;
      }

      if (props.baseImage) {
        const imgSize = await getImageSize(props.baseImage);
        if (canvasEl.current) {
          if (
            canvasEl.current.height !== imgSize.height ||
            canvasEl.current.width !== imgSize.width
          ) {
            // canvasEl.current.width = imgSize.width;
            // canvasEl.current.height = imgSize.height;
            initCanvasStyle(
              canvasEl.current,
              brushColor.current,
              brushColor.current,
            );
            reDraw(canvasEl.current);
          }
        }
      }
      if (
        drawerBoardEl.current &&
        !props.baseImage &&
        props.canvasWidth &&
        props.canvasHeight
      ) {
        if (canvasEl.current) {
          // canvasEl.current.width = props.canvasWidth;
          // canvasEl.current.height = props.canvasHeight;
          initCanvasStyle(
            canvasEl.current,
            brushColor.current,
            brushColor.current,
          );
          reDraw(canvasEl.current);
        }
      }
    }, [props.baseImage, props.canvasWidth, props.canvasHeight, reDraw]);

    const refreshCanvasRect = useCallback(() => {
      wrapperRect.current = wrapperEl.current?.getBoundingClientRect() || null;
      canvasRect.current = canvasEl.current?.getBoundingClientRect() || null;
    }, []);

    const clearCurrentDrawHistory = useCallback(() => {
      let idx = -1;
      for (let i = optHistory.current.length - 1; i >= 0; i--) {
        const opt = optHistory.current[i];
        if (opt.type !== "draw") {
          idx = i;
          break;
        }
      }
      console.log("clearing draw history", idx, optHistory.current);
      optHistory.current = optHistory.current?.slice(0, idx + 1);
      setCanGenerate?.(false);
    }, [setCanGenerate]);
    const clearCanvas = useCallback(() => {
      if (!canvasEl.current) {
        return;
      }
      const ctx = canvasEl.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
      clearCurrentDrawHistory();
    }, [clearCurrentDrawHistory]);

    const styleCanvasBoard = useCallback(async () => {
      const boardStyle: CSSProperties = {};
      if (props.canScale) {
        boardStyle.transform = `translate3d(${boardTranslatePos.x}px, ${boardTranslatePos.y}px, 0) scale(${scale})`;
      }
      const boardTargetSize = { w: 0, h: 0 };
      if (props.width && props.height) {
        boardTargetSize.w = props.width;
        boardTargetSize.h = props.height;
      }

      let imgSize = null;
      if (!props.width && !props.height && props.baseImage) {
        imgSize = await getImageSize(props.baseImage);
        baseImgSize.current = { w: imgSize.width, h: imgSize.height };
        boardTargetSize.w = imgSize.width;
        boardTargetSize.h = imgSize.height;
      }

      if (
        (props.maxWidth && boardTargetSize.w > props.maxWidth) ||
        (props.maxHeight && boardTargetSize.h > props.maxHeight)
      ) {
        const ratio = Math.min(
          props.maxWidth ? props.maxWidth / boardTargetSize.w : 1,
          props.maxHeight ? props.maxHeight / boardTargetSize.h : 1,
        );
        boardTargetSize.w *= ratio;
        boardTargetSize.h *= ratio;
      }

      if (!boardTargetSize.w || !boardTargetSize.h) {
        const rect = canvasEl.current?.getBoundingClientRect();
        if (rect) {
          const w = Math.min(rect.height, rect.width);
          boardTargetSize.w = boardTargetSize.h = w;
        }
      }

      if (wrapperEl.current) {
        const wRect = wrapperEl.current.getBoundingClientRect();
        if (
          wRect.width < boardTargetSize.w ||
          wRect.height < boardTargetSize.h
        ) {
          const imgRatio = boardTargetSize.w / boardTargetSize.h;
          const wrapperRatio = wRect.width / wRect.height;
          if (imgRatio > wrapperRatio) {
            boardTargetSize.w = wRect.width;
            boardTargetSize.h = wRect.width / imgRatio;
          } else {
            boardTargetSize.h = wRect.height;
            boardTargetSize.w = wRect.height * imgRatio;
          }
        }
      }

      boardStyle.width = boardTargetSize.w;
      boardStyle.height = boardTargetSize.h;
      if (canvasEl.current) {
        canvasEl.current.width = boardStyle.width * 2;
        canvasEl.current.height = boardStyle.height * 2;
        reDraw(canvasEl.current);
      }

      if (props.rootPage === "playground" && props.baseImage) {
        boardStyle.position = "absolute";
      }
      setCanvasBoardStyle(boardStyle);
    }, [
      props.rootPage,
      props.baseImage,
      props.canScale,
      props.width,
      props.height,
      props.maxWidth,
      props.maxHeight,
      boardTranslatePos,
      scale,
      reDraw,
    ]);

    const undo = useCallback(() => {
      if (!canvasEl.current) {
        return;
      }
      const ctx = canvasEl.current.getContext("2d");
      if (!ctx) {
        return;
      }
      const h = optHistory.current.pop();
      if (!h) {
        return;
      }
      undoOptHistory.current.unshift(h);
      if (h.type === "image") {
        let lastImageH;
        for (let i = optHistory.current.length - 1; i >= 0; i--) {
          const opt = optHistory.current[i];
          if (opt.type === "image") {
            lastImageH = opt;
            break;
          }
        }
        if (lastImageH) {
          setResultImg(lastImageH.data as string);
        } else {
          setResultImg("");
        }
      }
      ctx.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
      reDraw(canvasEl.current);
    }, [reDraw]);

    const redo = useCallback(() => {
      if (!canvasEl.current) {
        return;
      }
      const ctx = canvasEl.current.getContext("2d");
      if (!ctx) {
        return;
      }
      const h = undoOptHistory.current.shift();
      if (!h) {
        return;
      }
      optHistory.current.push(h);
      if (h.type === "image") {
        setResultImg(h.data as string);
        clearCanvas();
      }
      reDraw(canvasEl.current);
    }, [clearCanvas, reDraw]);

    const clearAll = useCallback(() => {
      clearCanvas();
      optHistory.current = [];
      undoOptHistory.current = [];
      setResultImg("");
      // setScale(1)
      // props.onScale?.(1)
      setCanGenerate?.(false);
    }, [clearCanvas, setCanGenerate]);

    useEffect(() => {
      clearAll();
      updateCanvas();
      styleCanvasBoard();
    }, [clearAll, props.baseImage, styleCanvasBoard, updateCanvas]);

    useEffect(() => {
      refreshCanvasRect();
      // if (!props.canScale && !props.baseImage && props.canvasHeight) {
      //   const newScale = canvasRect.current!.height / props.canvasHeight;
      //   setScale(newScale);
      // }
    }, [
      canvasBoardStyle,
      props.canScale,
      props.baseImage,
      props.canvasHeight,
      refreshCanvasRect,
    ]);

    useEffect(() => {
      updateCanvas();
      styleCanvasBoard();
      const onScroll = () => {
        refreshCanvasRect();
      };
      window.addEventListener("scroll", onScroll);

      const onResize = debounce(
        () => {
          if (!props.canScale && !props.baseImage && props.canvasHeight) {
            styleCanvasBoard();
          }
        },
        400,
        { trailing: true },
      );
      window.addEventListener("resize", onResize);

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
      };
      const cavasEl = canvasEl.current;
      if (props.canScale) {
        cavasEl?.addEventListener("wheel", onWheel, { passive: false });
      }

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        cavasEl?.removeEventListener("wheel", onWheel);
      };
    }, [
      props.baseImage,
      props.canScale,
      props.canvasHeight,
      refreshCanvasRect,
      styleCanvasBoard,
      updateCanvas,
    ]);

    useEffect(() => {
      if (props.canvasWidth && props.canvasHeight) {
        updateCanvas();
      }
    }, [props.canvasWidth, props.canvasHeight, updateCanvas]);

    useEffect(() => {
      if (props.resultImage) {
        optHistory.current.push({
          type: "image",
          data: props.resultImage,
        });
        undoOptHistory.current = [];
        setResultImg(props.resultImage);
        clearCanvas();
      }
    }, [props.resultImage, clearCanvas]);

    useEffect(() => {
      if (props.canScale) {
        setCanvasBoardStyle((s) => ({
          ...s,
          transform: `translate3d(${boardTranslatePos.x}px, ${boardTranslatePos.y}px, 0) scale(${scale})`,
        }));
      }
      refreshCanvasRect();
    }, [scale, boardTranslatePos, props.canScale, refreshCanvasRect]);

    useEffect(() => {
      if (wrapperEl.current && drawerBoardEl.current && canvasEl.current) {
        const rObserver = new ResizeObserver(() => {
          refreshCanvasRect();
          styleCanvasBoard();
          updateCanvas();
        });
        rObserver.observe(wrapperEl.current);
        // rObserver.observe(drawerBoardEl.current);
        // rObserver.observe(canvasEl.current);
        return () => {
          rObserver.disconnect();
        };
      }
    }, [refreshCanvasRect, styleCanvasBoard, updateCanvas]);

    useImperativeHandle(ref, () => ({
      undo() {
        undo();
      },
      redo() {
        redo();
      },
      clear() {
        clearCanvas();
      },
      getMaskImg(): Promise<string | undefined> {
        return genMaskImg();
      },
      setScale(scale: number) {
        setScale(scale);
      },
      setBrushSize(size: number) {
        setBrushSize(size);
      },
      setDragMode(drag: boolean) {
        setDragMode(drag);
      },
      setShowResult(show: boolean) {
        setShowResult(show);
      },
    }));

    function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
      canvasEl.current?.focus();
      const x = e.clientX;
      const y = e.clientY;
      if (dragMode) {
        startDragging({ x, y });
        return;
      }
      startDrawing({
        x: x - canvasRect.current!.x,
        y: y - canvasRect.current!.y,
      });
    }
    function onTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
      // e.preventDefault()
      if (drawing.current) {
        return;
      }
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      if (dragMode) {
        startDragging({ x, y });
        return;
      }
      startDrawing({
        x: x - canvasRect.current!.x,
        y: y - canvasRect.current!.y,
      });
    }

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const x = e.clientX;
      const y = e.clientY;
      if (isInCanvasArea(x, y)) {
        setBrushPos(x - brushSize / 2, y - brushSize / 2);
      } else {
        if (drawing.current) {
          endDrawing();
          return;
        }
      }
      if (dragMode && isDragging) {
        drag({ x, y });
        return;
      }
      draw({ x: x - canvasRect.current!.x, y: y - canvasRect.current!.y });
    };

    const onTouchMove = throttle(
      (e: React.TouchEvent<HTMLCanvasElement>) => {
        // e.preventDefault()
        if (!drawing.current) {
          return;
        }
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        if (isInCanvasArea(x, y)) {
          setBrushPos(x - brushSize / 2, y - brushSize / 2);
        } else {
          if (drawing.current) {
            endDrawing();
            return;
          }
        }
        draw({ x: x - canvasRect.current!.x, y: y - canvasRect.current!.y });
      },
      17,
      { leading: true, trailing: true },
    );

    function onMouseUp() {
      if (dragMode) {
        endDragging();
        return;
      }
      endDrawing();
    }
    function onTouchEnd() {
      // e.preventDefault()
      if (dragMode) {
        endDragging();
        return;
      }
      endDrawing();
    }

    function onMouseEnter() {
      setShowBrush(true);
    }
    function onMouseLeave() {
      setShowBrush(false);
      endDrawing();
    }

    function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
      if (!props.canScale) {
        return;
      }
      // e.preventDefault();
      const angleInRadians = Math.atan2(Math.abs(e.deltaY), Math.abs(e.deltaX));
      const angleInDegrees = angleInRadians * (180 / Math.PI);
      if (angleInDegrees <= 60) {
        return;
      }

      let newS = 1;
      if (e.deltaY < 0) {
        newS = parseFloat(Math.min(MAX_SCALE, scale + 0.1).toFixed(2));
      } else {
        newS = parseFloat(Math.max(MIN_SCALE, scale - 0.1).toFixed(2));
      }
      setScale(newS);
      props.onScale?.(newS);
      // const oriTransform = drawerBoardEl.current!.style.transform
      // if (oriTransform.match(/scale\((\d+\.?\d*)\)/)) {
      //   const newTransform = oriTransform.replace(/scale\(\d+\.?\d*\)/, `scale(${scale})`)
      //   drawerBoardEl.current!.style.transform = newTransform
      // } else {
      //   drawerBoardEl.current!.style.transform += ` scale(${scale})`
      // }
    }
    function onKeyDown(e: React.KeyboardEvent<HTMLCanvasElement>) {
      if (dragMode || !props.canDrag) {
        return;
      }
      if (e.keyCode === 32) {
        // dragMode.current = true
        setDragMode(true);
        endDrawing();
      }
    }
    function onKeyUp(e: React.KeyboardEvent<HTMLCanvasElement>) {
      if (!dragMode) {
        return;
      }
      if (e.keyCode === 32) {
        // dragMode.current = false
        endDragging();
        setDragMode(false);
      }
    }

    function setBrushPos(x: number, y: number) {
      brushPos.current.x = x;
      brushPos.current.y = y;
      if (brushEl.current) {
        brushEl.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    }

    function startDrawing(pos: Position) {
      if (!canvasEl.current) {
        return;
      }

      console.log("start drawing:", scale, pos);
      const finalScale = scale / 2;
      const newX = pos.x / finalScale;
      const newY = pos.y / finalScale;
      if (
        newX <= 0 ||
        newY <= 0 ||
        newX >= canvasEl.current.width ||
        newY >= canvasEl.current.height
      ) {
        // setShowBrush(false)
        endDrawing();
        return;
      }
      drawing.current = true;
      currentBrushPath.current = [];
      currentBrushPath.current.push(pos);

      const ctx = canvasEl.current?.getContext("2d");
      if (!ctx) {
        return;
      }

      initCanvasStyle(canvasEl.current, brushColor.current, brushColor.current);
      if (!props.baseImage) {
        reDraw(canvasEl.current);
      }
      ctx.beginPath();
      ctx.moveTo(newX, newY);
      ctx.arc(newX, newY, brushSize / finalScale / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.lineTo(newX, newY);
    }

    function draw(pos: Position) {
      if (!drawing.current) {
        return;
      }
      if (!canvasEl.current) {
        return;
      }
      const finalScale = scale / 2;
      const newX = pos.x / finalScale;
      const newY = pos.y / finalScale;
      // if (
      //   newX <= 0 ||
      //   newY <= 0 ||
      //   pos.x >= canvasEl.current.width ||
      //   newY >= canvasEl.current.height
      // ) {
      //   // setShowBrush(false)
      //   endDrawing();
      //   return;
      // }
      const ctx = canvasEl.current?.getContext("2d");
      if (!ctx) {
        return;
      }
      const lastPos =
        currentBrushPath.current[currentBrushPath.current.length - 1];
      if (lastPos) {
        if (
          Math.abs(pos.x / finalScale - lastPos.x / finalScale) < 2 &&
          Math.abs(pos.y / finalScale - lastPos.y / finalScale) < 2
        ) {
          return;
        }
      }
      ctx.imageSmoothingEnabled = true;
      ctx.lineWidth = brushSize / finalScale;
      ctx.lineTo(newX, newY);
      ctx.stroke();
      currentBrushPath.current.push(pos);
    }
    function endDrawing() {
      console.log("end drawing");
      drawing.current = false;
      if (currentBrushPath.current.length > 0) {
        optHistory.current.push({
          type: "draw",
          data: currentBrushPath.current,
          scale: scale / 2,
          brushSize: brushSize,
        });
        undoOptHistory.current = [];
        props.setCanGenerate?.(true);
      }
      currentBrushPath.current = [];
    }
    function startDragging(pos: Position) {
      setIsDragging(true);
      dragStartMousePos.current.x = pos.x;
      dragStartMousePos.current.y = pos.y;
      dragStartBoradPos.current.x = boardTranslatePos.x;
      dragStartBoradPos.current.y = boardTranslatePos.y;
    }
    function drag(pos: Position) {
      const dx = pos.x - dragStartMousePos.current.x;
      const dy = pos.y - dragStartMousePos.current.y;
      const fx = dragStartBoradPos.current.x + dx;
      const fy = dragStartBoradPos.current.y + dy;
      setBoardTranslatePos({ x: fx, y: fy });
    }
    function endDragging() {
      setIsDragging(false);
    }

    function getCurrentDrawHistory() {
      const drawHistory: History[] = [];
      for (let i = optHistory.current.length - 1; i >= 0; i--) {
        const opt = optHistory.current[i];
        if (opt.type !== "draw") {
          break;
        }
        drawHistory.unshift(opt);
      }
      return drawHistory;
    }

    function isInCanvasArea(x: number, y: number) {
      if (!canvasEl.current) {
        return false;
      }
      if (!canvasRect.current || canvasRect.current.width === 0) {
        refreshCanvasRect();
      }
      const cRect = canvasRect.current!;

      const inside =
        x >= 0 &&
        x <= cRect.x + cRect.width &&
        y >= 0 &&
        y <= cRect.y + cRect.height;
      if (!inside) {
        console.log("outside canvas", x, y, cRect);
      }
      return inside;
    }

    async function genMaskImg() {
      if (!canvasEl.current) {
        return;
      }
      const oriCtx = canvasEl.current.getContext("2d");
      if (!oriCtx) {
        return;
      }
      if (!maskCanvas.current) {
        maskCanvas.current = document.createElement("canvas");
      }
      const newCtx = maskCanvas.current.getContext("2d");
      if (!newCtx) {
        return;
      }
      maskCanvas.current.width = canvasEl.current.width;
      maskCanvas.current.height = canvasEl.current.height;
      initCanvasStyle(maskCanvas.current, "#000", "#fff");
      maskCanvas.current
        .getContext("2d")
        ?.fillRect(0, 0, maskCanvas.current.width, maskCanvas.current.height);

      for (const h of optHistory.current) {
        if (h.type !== "draw") {
          continue;
        }
        const hScale = h.scale || 1;
        const drawPositions = (h.data as Position[]).map((p) => ({
          x: p.x / hScale,
          y: p.y / hScale,
        }));
        drawPath(
          maskCanvas.current,
          drawPositions,
          (h.brushSize || brushSize) / hScale,
        );
      }

      const image = maskCanvas.current.toDataURL("image/png");
      const finalMaskImage = await resizeImage(image, {
        w: props.canvasWidth || baseImgSize.current.w,
        h: props.canvasHeight || baseImgSize.current.h,
      });

      // const imageEl = document.createElement("img");
      // imageEl.src = finalMaskImage;
      // document.body.append(maskCanvas.current);
      // document.body.append(imageEl);
      // setTimeout(() => {
      // imageEl.remove();
      // maskCanvas.current?.remove();
      // }, 10000);
      return finalMaskImage;
    }

    return (
      <div
        className={`${styles.drawer_wrapper} ${
          props.canDrag ? styles.drawer_draggable : ""
        } scrollBar_container`}
        ref={wrapperEl}
      >
        {props.backBtn}
        <div
          ref={drawerBoardEl}
          className={`${styles.drawer_board} ${
            props.baseImage && styles.with_baseimage
          }`}
          style={{
            width: props.width || "auto",
            height: props.height || "auto",
            ...canvasBoardStyle,
          }}
        >
          {props.loading && (
            <div className={styles.canvas_loading}>
              <Loader2 className="h-10 w-10 animate-spin" color="white" />
            </div>
          )}
          {props.baseImage && (
            <img
              ref={baseImgEl}
              className={`${styles.preview_img} ${styles.preview_img_origin}`}
              src={props.baseImage}
              alt=""
            />
          )}
          {resultImg && (
            <img
              className={`${styles.preview_img} ${styles.preview_img_result}`}
              style={{
                visibility: showResult ? "visible" : "hidden",
              }}
              src={resultImg}
              alt=""
            />
          )}
          <canvas
            tabIndex={1}
            style={{
              cursor: dragMode ? (isDragging ? "grabbing" : "grab") : "none",
              background: props.baseImage ? "transparent" : "#fff",
              opacity: props.baseImage ? 0.7 : 1,
            }}
            className={styles.drawer_canvas}
            ref={canvasEl}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onMouseMove={onMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onTouchMove={onTouchMove}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          ></canvas>
        </div>
        <div
          ref={brushEl}
          style={{
            width: brushSize,
            height: brushSize,
            borderRadius: brushSize / 2,
            display:
              !mobileCheck() && showBrush && !dragMode ? "block" : "none",
            backgroundColor: brushColor.current,
          }}
          className={styles.brush_cursor}
        ></div>
      </div>
    );
  },
);

Drawer.displayName = "Drawer";

export default Drawer;
