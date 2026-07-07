"use client";

import { useEffect, createContext, useState } from "react";
import { debounce } from "lodash-es";

export const WindowSizeContext = createContext({
  width: 0,
});

export function ChartContainer({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState(1000);

  const handleWindowSizeChange = debounce((e: any) => {
    if (e?.target?.innerWidth) {
      setWidth(e.target.innerWidth);
    }
  }, 100);

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, [handleWindowSizeChange]);

  return (
    <WindowSizeContext.Provider
      value={{
        width: width,
      }}
    >
      {children}
    </WindowSizeContext.Provider>
  );
}
