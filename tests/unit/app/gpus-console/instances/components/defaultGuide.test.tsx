import { fireEvent, render, screen } from "@testing-library/react";
import DefaultGuide from "@/app/gpus-console/instances/components/defaultGuide";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
}));
jest.mock(
  "@/app/gpus-console/instances/components/animation/animation",
  () => ({
    __esModule: true,
    default: () => <div>animation</div>,
  }),
);

describe("instances DefaultGuide", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the instance guidance copy", () => {
    render(<DefaultGuide />);
    expect(
      screen.getByText("Need to deploy cloud resources?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Instance")).toBeInTheDocument();
  });

  it("routes to explore when clicking Deploy Now", () => {
    render(<DefaultGuide />);
    fireEvent.click(screen.getByRole("button", { name: /Deploy Now/ }));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/en"));
  });

  it("opens docs in a new tab when clicking Learn More", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<DefaultGuide />);
    fireEvent.click(screen.getByRole("button", { name: /Learn More/ }));
    expect(openSpy).toHaveBeenCalledWith(expect.any(String), "_blank");
    openSpy.mockRestore();
  });
});
