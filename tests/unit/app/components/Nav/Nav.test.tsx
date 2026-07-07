import { render, screen, fireEvent } from "@testing-library/react";
import NavOut from "@/app/components/Nav/Nav";

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (link: string) => link,
  getPathnameWithoutLocale: (p: string) => p,
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/gpu-instance/instances",
}));

const data = [
  {
    title: "Manage",
    items: [
      { text: "Instances", link: "/gpu-instance/instances" },
      { text: "Jobs", link: "/gpu-instance/jobs" },
      // Not present in navMenuList for this route -> should be skipped.
      { text: "Nonexistent", link: "/nope" },
    ],
  },
];

describe("NavOut", () => {
  it("renders only menu items defined for the current route", () => {
    render(<NavOut curRoute="gpu-instance" data={data} />);
    expect(screen.getByText("Instances")).toBeInTheDocument();
    expect(screen.getByText("Jobs")).toBeInTheDocument();
    expect(screen.queryByText("Nonexistent")).not.toBeInTheDocument();
  });

  it("uppercases the section title", () => {
    render(<NavOut curRoute="gpu-instance" data={data} />);
    expect(screen.getByText("MANAGE")).toBeInTheDocument();
  });

  it("applies the selected style to the active path link", () => {
    render(<NavOut curRoute="gpu-instance" data={data} />);
    const active = screen.getByText("Instances").closest("a");
    expect(active?.className).toContain("font-subtle-medium");
  });

  it("invokes clickCb with the item when a link is clicked", () => {
    const clickCb = jest.fn();
    render(<NavOut curRoute="gpu-instance" data={data} clickCb={clickCb} />);
    fireEvent.click(screen.getByText("Jobs"));
    expect(clickCb).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Jobs" }),
    );
  });
});
