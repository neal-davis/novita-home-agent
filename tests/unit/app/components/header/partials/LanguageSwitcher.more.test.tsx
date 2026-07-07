import { fireEvent, render, screen, within } from "@testing-library/react";
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
  cn: (...a: any[]) => a.flat(Infinity).filter(Boolean).join(" "),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, onOpenChange }: any) => (
    <div>
      <button data-testid="open" onClick={() => onOpenChange?.(true)}>
        open
      </button>
      <button data-testid="close" onClick={() => onOpenChange?.(false)}>
        close
      </button>
      <button data-testid="select-zh" onClick={() => onValueChange?.("zh")}>
        choose-zh
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, disabled, className }: any) => (
    <div data-testid="trigger" data-disabled={disabled} className={className}>
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

describe("LanguageSwitcher variants", () => {
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

  it("pill + mobile shows the active locale label inside the trigger", () => {
    render(<LanguageSwitcher variant="pill" mode="mobile" />);
    expect(
      within(screen.getByTestId("trigger")).getByText("English"),
    ).toBeInTheDocument();
  });

  it("legacy + mobile renders the label via SelectValue in the trigger", () => {
    render(<LanguageSwitcher variant="legacy" mode="mobile" />);
    expect(
      within(screen.getByTestId("trigger")).getByText("English"),
    ).toBeInTheDocument();
  });

  it("pill + desktop is icon-only (no label text in the trigger)", () => {
    render(<LanguageSwitcher variant="pill" mode="desktop" />);
    expect(
      within(screen.getByTestId("trigger")).queryByText("English"),
    ).not.toBeInTheDocument();
    // pill classes applied
    expect(screen.getByTestId("trigger").className).toContain(
      "rounded-[999px]",
    );
  });

  it("legacy + desktop is icon-only too", () => {
    render(<LanguageSwitcher variant="legacy" mode="desktop" />);
    expect(
      within(screen.getByTestId("trigger")).queryByText("English"),
    ).not.toBeInTheDocument();
  });

  it("uses pendingLocale as the active locale when present", () => {
    mockI18n.pendingLocale = "zh";
    render(<LanguageSwitcher variant="pill" mode="mobile" />);
    expect(
      within(screen.getByTestId("trigger")).getByText("中文"),
    ).toBeInTheDocument();
    // selecting the active (pending) locale should be a no-op
    fireEvent.click(screen.getByTestId("select-zh"));
    expect(mockSetLocale).not.toHaveBeenCalled();
  });

  it("does nothing on open-change close (early return)", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("close"));
    expect(prefetchLocaleMessages).not.toHaveBeenCalled();
  });

  it("applies cursor-progress styling on a pending pill trigger", () => {
    mockI18n.isLocalePending = true;
    render(<LanguageSwitcher variant="pill" mode="desktop" />);
    expect(screen.getByTestId("trigger").className).toContain(
      "cursor-progress",
    );
  });
});
