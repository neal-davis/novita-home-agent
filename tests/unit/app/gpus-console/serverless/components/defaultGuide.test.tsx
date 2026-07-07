import { fireEvent, render, screen } from "@testing-library/react";
import DefaultGuide from "@/app/gpus-console/serverless/components/defaultGuide";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));
jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock(
  "@/app/gpus-console/serverless/components/animation/animation",
  () => ({
    __esModule: true,
    default: () => <div>animation</div>,
  }),
);

describe("DefaultGuide", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the serverless guide content", () => {
    render(<DefaultGuide />);
    expect(
      screen.getByText("Need to deploy cloud resources?"),
    ).toBeInTheDocument();
    expect(screen.getByText("SERVERLESS READY")).toBeInTheDocument();
    expect(screen.getByText("animation")).toBeInTheDocument();
  });

  it("navigates to the serverless deploy page on Deploy Now", () => {
    render(<DefaultGuide />);
    fireEvent.click(screen.getByText("Deploy Now"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/en"));
  });

  it("opens the docs in a new tab on Learn More", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<DefaultGuide />);
    fireEvent.click(screen.getByText("Learn More"));
    expect(openSpy).toHaveBeenCalledWith(expect.any(String), "_blank");
    openSpy.mockRestore();
  });
});
