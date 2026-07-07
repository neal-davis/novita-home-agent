export async function downloadImage(url: string, type = "png") {
  if (url.indexOf("http") === -1) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `result.${type}`;
    a.click();
    return;
  }
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = URL.createObjectURL(blob);
    a.download = `result.${type}`;

    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  } catch (error) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `result.${type}`;
    a.target = "_blank";
    a.click();
  }
}

export function getImageSize(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const imageEl = document.createElement("img");
    imageEl.onload = () => {
      resolve({ width: imageEl.width, height: imageEl.height });
    };
    imageEl.src = src;
  });
}

export async function resizeImage(
  originImg: string,
  targetSize: { w: number; h: number },
  oriImgEl?: HTMLImageElement,
): Promise<string> {
  const oriSize = await getImageSize(originImg);
  if (oriSize.width !== targetSize.w || oriSize.height !== targetSize.h) {
    const imgCanvas = document.createElement("canvas");
    const ctx = imgCanvas.getContext("2d");
    if (!ctx) {
      return "";
    }
    imgCanvas.width = targetSize.w;
    imgCanvas.height = targetSize.h;
    if (oriImgEl) {
      ctx.drawImage(oriImgEl, 0, 0, targetSize.w, targetSize.h);
      return imgCanvas.toDataURL("image/png");
    }
    const oriImgPromise: Promise<HTMLImageElement> = new Promise((resolve) => {
      const imgEl = document.createElement("img");
      imgEl.src = originImg;
      imgEl.onload = () => {
        resolve(imgEl);
      };
    });
    const el = await oriImgPromise;
    ctx.drawImage(el, 0, 0, targetSize.w, targetSize.h);
    return imgCanvas.toDataURL("image/png");
  }
  return originImg;
}

export function getVideoFirstFrame(vPath: string) {
  const video = document.createElement("video");
  video.style.display = "none";
  video.src = vPath;
  document.body.appendChild(video);

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");

  video.addEventListener("loadeddata", function () {
    if (video.readyState >= 2) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  });

  video
    .play()
    .then(() => {
      video.pause();
    })
    .catch((error) => {
      console.error("视频播放失败", error);
    });
}

export function getImgFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function getImgBase64FromPath(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = filePath;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, img.width, img.height);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject("canvas is null");
      }
    };
    img.onerror = (error) => reject(error);
  });
}

export function isImgBase64(src: string) {
  return /^data:[A-Za-z0-9+/]+;base64,/.test(src);
}
