import { useEffect, useState } from "react";

export function useEncodedPath(pathname: string) {
  const [path, setPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(pathname + encodeURIComponent(window.location.search));
    }
  }, [pathname]);

  return path;
}
