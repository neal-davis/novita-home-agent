import { render, screen } from "@testing-library/react";
import AuthHeader from "@/app/components/header/AuthHeader";

jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) =>
    a
      .flatMap((x) =>
        typeof x === "object" && x !== null
          ? Object.entries(x)
              .filter(([, v]) => v)
              .map(([k]) => k)
          : x,
      )
      .filter(Boolean)
      .join(" "),
}));

jest.mock("@/app/components/header/partials/Logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));

jest.mock("@/hooks/useHeaderHeight", () => ({
  ORI_HEADER_HEIGHT: 64,
  CONSOLE_ORI_HEADER_HEIGHT: 56,
}));

describe("AuthHeader", () => {
  it("renders the logo inside a fixed-position header by default", () => {
    const { container } = render(<AuthHeader />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(container.querySelector("header")).toHaveStyle({
      position: "fixed",
    });
  });

  it("uses relative positioning when position=relative", () => {
    const { container } = render(<AuthHeader position="relative" />);
    expect(container.querySelector("header")).toHaveStyle({
      position: "relative",
    });
  });

  it("applies the console header modifier class for the console page", () => {
    const { container } = render(<AuthHeader page="console" />);
    const header = container.querySelector("header")!;
    expect(header.className).toContain("header_console");
  });
});
