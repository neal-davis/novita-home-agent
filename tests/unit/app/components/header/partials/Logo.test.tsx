import { render, screen } from "@testing-library/react";
import { Logo } from "@/app/components/header/partials/Logo";

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (href: string, locale: string) =>
    locale === "en" ? href : `/${locale}${href}`,
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) => a.filter(Boolean).join(" "),
}));

describe("Logo", () => {
  it("renders the default light logo linking to the localized home path", () => {
    render(<Logo />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
    const img = screen.getByAltText("Novita AI");
    expect(img).toHaveAttribute("src", "/logo/logo.svg");
  });

  it("uses the white logo for the dark theme and a custom href/alt", () => {
    render(<Logo theme="dark" href="/home" alt="Brand" />);
    const img = screen.getByAltText("Brand");
    expect(img).toHaveAttribute("src", "/logo/white-logo.svg");
    expect(screen.getByRole("link")).toHaveAttribute("href", "/home");
  });
});
