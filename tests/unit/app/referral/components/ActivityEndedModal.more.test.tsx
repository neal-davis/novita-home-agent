import * as React from "react";
import { render, screen } from "@testing-library/react";

const interactOutside = jest.fn();
const escapeKeyDown = jest.fn();

// DialogContent mock that exercises the guard handlers so the
// preventDefault branches are covered.
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children, onInteractOutside, onEscapeKeyDown }: any) => {
    onInteractOutside?.({ preventDefault: interactOutside });
    onEscapeKeyDown?.({ preventDefault: escapeKeyDown });
    return <div>{children}</div>;
  },
}));

import ActivityEndedModal from "@/app/referral/components/ActivityEndedModal";

describe("referral ActivityEndedModal (more)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("prevents closing on outside interaction and escape key", () => {
    render(<ActivityEndedModal show={true} />);
    expect(screen.getByText("Referral Ended")).toBeInTheDocument();
    expect(interactOutside).toHaveBeenCalled();
    expect(escapeKeyDown).toHaveBeenCalled();
  });
});
