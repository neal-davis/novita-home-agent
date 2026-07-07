import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockPersist = jest.fn();
const mockClear = jest.fn();
let consentListener: ((c: { preferences: boolean }) => void) | null = null;
const mockAddConsentListener = jest.fn(
  (cb: (c: { preferences: boolean }) => void) => {
    consentListener = cb;
    return () => {
      consentListener = null;
    };
  },
);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
}));
jest.mock("@/i18n/preference", () => ({
  persistLocalePreference: (...a: unknown[]) => mockPersist(...a),
  clearLocalePreference: (...a: unknown[]) => mockClear(...a),
}));
jest.mock("@/lib/consent/cookiebot", () => ({
  addCookiebotConsentListener: (cb: (c: { preferences: boolean }) => void) =>
    mockAddConsentListener(cb),
}));

import {
  I18nProvider,
  prefetchLocaleMessages,
  useI18n,
  useI18nSubscription,
} from "@/i18n/provider";

const snapshot = {
  locale: "en" as const,
  messages: {},
  fallbackMessages: {},
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider snapshot={snapshot}>{children}</I18nProvider>;
}

describe("I18nProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consentListener = null;
    window.history.replaceState({}, "", "/");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ hello: "bonjour" }),
    });
  });

  it("throws when useI18n is used outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useI18n())).toThrow(
      "useI18n must be used inside I18nProvider",
    );
    spy.mockRestore();
  });

  it("provides the snapshot locale and supported locales", () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.locale).toBe("en");
    expect(result.current.isLocalePending).toBe(false);
    expect(result.current.supportedLocales.length).toBeGreaterThan(0);
  });

  it("renders children", () => {
    render(
      <I18nProvider snapshot={snapshot}>
        <div>child-content</div>
      </I18nProvider>,
    );
    expect(screen.getByText("child-content")).toBeInTheDocument();
  });

  it("registers a cookiebot consent listener and clears preference on withdrawal", () => {
    renderHook(() => useI18n(), { wrapper });
    expect(mockAddConsentListener).toHaveBeenCalled();
    (window as unknown as { Cookiebot?: { hasResponse: boolean } }).Cookiebot =
      { hasResponse: true };
    act(() => {
      consentListener?.({ preferences: false });
    });
    expect(mockClear).toHaveBeenCalled();
  });

  it("does not clear preference before cookiebot has a response", () => {
    renderHook(() => useI18n(), { wrapper });
    (window as unknown as { Cookiebot?: { hasResponse: boolean } }).Cookiebot =
      { hasResponse: false };
    act(() => {
      consentListener?.({ preferences: false });
    });
    expect(mockClear).not.toHaveBeenCalled();
  });

  it("setLocale fetches messages, updates locale and persists the choice", async () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    await act(async () => {
      await result.current.setLocale("fr" as never);
    });
    await waitFor(() => expect(result.current.locale).toBe("fr"));
    expect(mockPersist).toHaveBeenCalledWith("fr");
  });

  it("setLocale is a no-op when switching to the current locale", async () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    await act(async () => {
      await result.current.setLocale("en" as never);
    });
    expect(mockPersist).not.toHaveBeenCalled();
  });

  it("useI18nSubscription does not throw inside the provider", () => {
    expect(() =>
      renderHook(() => useI18nSubscription(), { wrapper }),
    ).not.toThrow();
  });

  it("prefetchLocaleMessages triggers a fetch for an uncached locale", () => {
    (global.fetch as jest.Mock).mockClear();
    prefetchLocaleMessages("ja" as never);
    expect(global.fetch).toHaveBeenCalled();
  });
});
