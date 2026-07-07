import * as React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

const onSuccessRef: { current?: (t: string) => void } = {};
const onErrorRef: { current?: () => void } = {};
const reset = jest.fn();

jest.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess, onError }: any) => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    return <div data-testid="turnstile" />;
  },
}));

jest.mock("@/constants/constants", () => ({ TurnstileSiteKey: "site-key" }));

import { useCloudflareTurnstile } from "@/app/user/components/cloudflare-turnstile";

describe("useCloudflareTurnstile", () => {
  it("starts with an empty token and null status", () => {
    const { result } = renderHook(() => useCloudflareTurnstile());
    expect(result.current.cloudflareToken).toBe("");
    expect(result.current.status).toBeNull();
  });

  it("captures the token and marks solved on success", () => {
    const { result } = renderHook(() => useCloudflareTurnstile());
    render(result.current.TurnstileElement);
    act(() => onSuccessRef.current?.("tok-123"));
    expect(result.current.cloudflareToken).toBe("tok-123");
    expect(result.current.status).toBe("solved");
  });

  it("clears token and marks error on failure", () => {
    const { result } = renderHook(() => useCloudflareTurnstile());
    render(result.current.TurnstileElement);
    act(() => onSuccessRef.current?.("tok"));
    act(() => onErrorRef.current?.());
    expect(result.current.cloudflareToken).toBe("");
    expect(result.current.status).toBe("error");
  });

  it("resetWidget clears state", () => {
    const { result } = renderHook(() => useCloudflareTurnstile());
    render(result.current.TurnstileElement);
    act(() => onSuccessRef.current?.("tok"));
    act(() => result.current.resetWidget());
    expect(result.current.cloudflareToken).toBe("");
    expect(result.current.status).toBeNull();
  });
});
