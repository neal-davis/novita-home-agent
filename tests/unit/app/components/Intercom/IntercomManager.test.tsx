import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import IntercomManager from "@/app/components/Intercom/IntercomManager";

const mockUsePathname = jest.fn();
const mockUseCookiebotConsent = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("@/hooks/useCookiebotConsent", () => ({
  useCookiebotConsent: () => mockUseCookiebotConsent(),
}));

jest.mock("lucide-react", () => ({
  ChevronLeft: () => <svg aria-label="open intercom" />,
}));

describe("IntercomManager", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    document.body.innerHTML = "";
    mockUsePathname.mockReturnValue("/llm-api/playground");
    mockUseCookiebotConsent.mockReturnValue({
      marketing: true,
      preferences: false,
    });
    window.Intercom = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    delete (window as any).Intercom;
  });

  it("does not render controls when consent is missing", () => {
    mockUseCookiebotConsent.mockReturnValue({
      marketing: false,
      preferences: false,
    });
    render(<IntercomManager />);

    expect(screen.queryByLabelText("open intercom")).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass("novita-llm-playground");
  });

  it("wraps and hides the launcher on hidden paths, then reopens and closes it", async () => {
    const parent = document.createElement("div");
    const launcher = document.createElement("button");
    launcher.className = "intercom-launcher";
    parent.appendChild(launcher);
    document.body.appendChild(parent);

    render(<IntercomManager />);

    await waitFor(() =>
      expect(
        document.querySelector(".intercom-launcher-temp-wrapper"),
      ).toBeTruthy(),
    );

    const wrapper = document.querySelector(
      ".intercom-launcher-temp-wrapper",
    ) as HTMLElement;
    expect(document.body).toHaveClass("novita-llm-playground");
    expect(wrapper.style.right).toBe("-80px");
    expect(wrapper.querySelector(".close-btn")).toBeTruthy();
    expect(window.Intercom).toHaveBeenCalledWith("hide");

    fireEvent.mouseEnter(screen.getByLabelText("open intercom").parentElement!);
    expect(wrapper.style.right).toBe("20px");

    fireEvent.click(wrapper.querySelector(".close-btn")!);
    expect(wrapper.style.right).toBe("-80px");
    expect(window.Intercom).toHaveBeenCalledWith("hide");
  });

  it("uses iframe launcher parents and ignores non-hidden routes", async () => {
    mockUsePathname.mockReturnValue("/models");
    const parent = document.createElement("div");
    const iframe = document.createElement("iframe");
    iframe.className = "intercom-launcher-frame";
    parent.appendChild(iframe);
    document.body.appendChild(parent);

    render(<IntercomManager />);
    jest.advanceTimersByTime(500);

    expect(screen.queryByLabelText("open intercom")).not.toBeInTheDocument();
    expect(parent.style.right).toBe("");
    expect(document.body).not.toHaveClass("novita-llm-playground");
  });
});
