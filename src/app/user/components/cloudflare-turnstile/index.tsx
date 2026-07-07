import { TurnstileSiteKey } from "@/constants/constants";
import { Turnstile } from "@marsidev/react-turnstile";
import { useCallback, useRef, useState } from "react";

type WidgetStatus = "solved" | "error" | "expired" | null;

export function useCloudflareTurnstile() {
  const turnstileRef = useRef<any>(null);
  const [cloudflareToken, setCloudflareToken] = useState("");
  const [status, setStatus] = useState<WidgetStatus>(null);
  const TurnstileElement = (
    <Turnstile
      options={{
        theme: "light",
      }}
      siteKey={TurnstileSiteKey}
      ref={turnstileRef}
      onSuccess={(token) => {
        setCloudflareToken(token);
        setStatus("solved");
      }}
      onError={() => {
        setCloudflareToken("");
        setStatus("error");
      }}
    />
  );

  const resetWidget = useCallback(() => {
    setStatus(null);
    setCloudflareToken("");
    turnstileRef.current?.reset();
  }, []);
  return { TurnstileElement, cloudflareToken, status, resetWidget };
}
