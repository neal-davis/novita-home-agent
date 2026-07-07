import { render, screen } from "@testing-library/react";
import {
  ConsentProvider,
  useCookiebotEnabled,
} from "@/app/components/consent/ConsentProvider";

jest.mock("@/lib/consent/cookiebot", () => ({
  isCookiebotConfigured: () => false,
}));

function Probe() {
  const enabled = useCookiebotEnabled();
  return <div data-testid="probe">{enabled ? "on" : "off"}</div>;
}

describe("ConsentProvider", () => {
  it("provides the enabled value to consumers", () => {
    render(
      <ConsentProvider enabled={true}>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("on");
  });

  it("propagates a disabled value", () => {
    render(
      <ConsentProvider enabled={false}>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("off");
  });

  it("falls back to the configured default outside a provider", () => {
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("off");
  });
});
