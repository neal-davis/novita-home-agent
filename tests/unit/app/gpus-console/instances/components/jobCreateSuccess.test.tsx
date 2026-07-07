import { fireEvent, render, screen } from "@testing-library/react";
import JobCreateSuccess from "@/app/gpus-console/instances/components/jobCreateSuccess";

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

describe("JobCreateSuccess modal", () => {
  it("renders the created job id", () => {
    render(
      <JobCreateSuccess
        jobInfoObj={{ jobId: "job-42" }}
        finishForm={jest.fn()}
      />,
    );
    expect(screen.getByText("job-42")).toBeInTheDocument();
    expect(screen.getByText(/A job has been created/)).toBeInTheDocument();
  });

  it("navigates to the jobs page", () => {
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: "" };

    render(
      <JobCreateSuccess
        jobInfoObj={{ jobId: "job-42" }}
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
      <JobCreateSuccess
        jobInfoObj={{ jobId: "job-42" }}
        finishForm={finishForm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(finishForm).toHaveBeenCalledWith(false);
  });
});
