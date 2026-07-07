export function getUrlParams(targetName: string) {
  if (typeof window === "undefined") {
    return "";
  }

  const href: any = decodeURIComponent(window.location.href);
  if (href && href.includes("?")) {
    const tmpArr: any = href.split("?");
    if (tmpArr.length > 1) {
      const retMap: any = new URLSearchParams(tmpArr[1]);
      return retMap.get(targetName) || "";
    }
  }
  return "";
}
