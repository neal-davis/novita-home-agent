import { fireEvent, render, screen } from "@testing-library/react";
import MigrateJobCreateSuccess from "@/app/gpus-console/instances/components/migrateJobCreateSuccess";

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

describe("MigrateJobCreateSuccess modal", () => {
  it("renders the created job id", () => {
    render(
      <MigrateJobCreateSuccess
        jobInfoObj={{ jobId: "mjob-7" }}
        finishForm={jest.fn()}
      />,
    );
    expect(screen.getByText("mjob-7")).toBeInTheDocument();
  });

  it("navigates to the jobs page", () => {
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: "" };

    render(
      <MigrateJobCreateSuccess
        jobInfoObj={{ jobId: "mjob-7" }}
        finishForm={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "To [Jobs]" }));
    expect(window.location.href).toContain("/en");

    (window as any).location = originalLocation;
  });

  it("closes via the close button", () => {
    const finishForm = jest.fn();
    render(
      <MigrateJobCreateSuccess
        jobInfoObj={{ jobId: "mjob-7" }}
        finishForm={finishForm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(finishForm).toHaveBeenCalledWith(false);
  });
});
