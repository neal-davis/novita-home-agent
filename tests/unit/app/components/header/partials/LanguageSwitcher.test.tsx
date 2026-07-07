import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageSwitcher } from "@/app/components/header/partials/LanguageSwitcher";
import { prefetchLocaleMessages, useI18n } from "@/i18n/provider";

const mockSetLocale = jest.fn();
let mockI18n: any;

jest.mock("@/i18n/provider", () => ({
  useI18n: jest.fn(),
  prefetchLocaleMessages: jest.fn(),
}));

jest.mock("@/i18n/config", () => ({
  LOCALE_LABELS: { en: "English", zh: "中文", ja: "日本語" },
}));

jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) => a.filter(Boolean).join(" "),
}));

// Minimal Select primitives that surface the wired-up handlers for testing.
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, onOpenChange }: any) => (
    <div>
      <button data-testid="open" onClick={() => onOpenChange?.(true)}>
        open
      </button>
      <button data-testid="select-zh" onClick={() => onValueChange?.("zh")}>
        choose-zh
      </button>
      <button data-testid="select-en" onClick={() => onValueChange?.("en")}>
        choose-en
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, disabled }: any) => (
    <div data-testid="trigger" data-disabled={disabled}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
  SelectValue: ({ children }: any) => <span>{children}</span>,
}));

const mockUseI18n = useI18n as jest.Mock;

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      isLocalePending: false,
      locale: "en",
      pendingLocale: null,
      setLocale: mockSetLocale,
      supportedLocales: ["en", "zh", "ja"],
    };
    mockUseI18n.mockImplementation(() => mockI18n);
  });

  it("renders an item per supported locale", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("中文")).toBeInTheDocument();
    expect(screen.getByText("日本語")).toBeInTheDocument();
  });

  it("switches to a different locale on selection", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("select-zh"));
    expect(mockSetLocale).toHaveBeenCalledWith("zh");
  });

  it("does not call setLocale when selecting the active locale", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("select-en"));
    expect(mockSetLocale).not.toHaveBeenCalled();
  });

  it("prefetches the other locales' messages when opened", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("open"));
    expect(prefetchLocaleMessages).toHaveBeenCalledWith("zh");
    expect(prefetchLocaleMessages).toHaveBeenCalledWith("ja");
    expect(prefetchLocaleMessages).not.toHaveBeenCalledWith("en");
  });

  it("disables the trigger while a locale switch is pending", () => {
    mockI18n.isLocalePending = true;
    render(<LanguageSwitcher />);
    expect(screen.getByTestId("trigger")).toHaveAttribute(
      "data-disabled",
      "true",
    );
  });
});
