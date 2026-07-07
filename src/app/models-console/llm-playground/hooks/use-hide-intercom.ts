import { useEffect } from "react";

export function useHideIntercom() {
  useEffect(() => {
    let timer: any = null;
    const hideIntercom = () => {
      const el = document.querySelector(".intercom-lightweight-app");
      if (el) {
        (el as HTMLElement).style.display = "none";
        (el as HTMLElement).style.visibility = "hidden";
        clearTimeout(timer);
      }
    };
    timer = setInterval(hideIntercom, 500);
    return () => clearInterval(timer);
  }, []);
}
