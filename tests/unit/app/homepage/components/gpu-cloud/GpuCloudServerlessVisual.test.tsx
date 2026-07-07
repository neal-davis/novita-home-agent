import { act, cleanup, render, screen } from "@testing-library/react";
import { GpuCloudServerlessVisual } from "@/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual";
import {
  SERVERLESS_JOB_PHASES,
  SERVERLESS_STEP_DWELL_MS,
} from "@/app/homepage/components/gpu-cloud/serverlessJobPhases";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: { alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt ?? ""} data-testid="mock-next-image" />
  ),
}));

describe("GpuCloudServerlessVisual", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("shows first phase metrics and advances to second phase after dwell", () => {
    render(<GpuCloudServerlessVisual />);

    expect(screen.getByTestId("serverless-duration-value")).toHaveTextContent(
      SERVERLESS_JOB_PHASES[0].durationLabel,
    );
    expect(screen.getByTestId("serverless-progress-pct")).toHaveTextContent(
      `${SERVERLESS_JOB_PHASES[0].progressPercent}%`,
    );

    act(() => {
      jest.advanceTimersByTime(SERVERLESS_STEP_DWELL_MS);
    });

    expect(screen.getByTestId("serverless-duration-value")).toHaveTextContent(
      SERVERLESS_JOB_PHASES[1].durationLabel,
    );
    expect(screen.getByTestId("serverless-progress-pct")).toHaveTextContent(
      `${SERVERLESS_JOB_PHASES[1].progressPercent}%`,
    );
  });
});
