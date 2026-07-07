import { fireEvent, render, screen } from "@testing-library/react";
import { LoadingState } from "@/app/models-console/multimodal-playground/components/ResultPanel/LoadingState";

beforeAll(() => {
  if (!document.elementsFromPoint) {
    (
      document as unknown as { elementsFromPoint: () => Element[] }
    ).elementsFromPoint = () => [];
  }
});

describe("LoadingState", () => {
  it("shows the submitting copy for the creating status", () => {
    render(<LoadingState status="creating" />);
    expect(screen.getByText("Submitting task...")).toBeInTheDocument();
  });

  it("shows the generating copy for the polling status", () => {
    render(<LoadingState status="polling" />);
    expect(screen.getByText("Generating...")).toBeInTheDocument();
  });

  it("renders the task id when provided", () => {
    render(<LoadingState status="polling" taskId="t-99" />);
    expect(screen.getByText("Task ID: t-99")).toBeInTheDocument();
  });

  it("renders no cancel button when onCancel is absent", () => {
    render(<LoadingState status="polling" />);
    expect(
      screen.queryByRole("button", { name: "Cancel" }),
    ).not.toBeInTheDocument();
  });

  it("opens the confirm dialog and fires onCancel on confirm", () => {
    const onCancel = jest.fn();
    render(<LoadingState status="polling" onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.getByText("Cancellation may still incur charges"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
