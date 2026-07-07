import * as React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
}));

import ActivityEndedModal from "@/app/referral/components/ActivityEndedModal";

describe("referral ActivityEndedModal", () => {
  it("renders the ended message and discord link when shown", () => {
    render(<ActivityEndedModal show={true} />);
    expect(screen.getByText("Referral Ended")).toBeInTheDocument();
    expect(screen.getByText("Join Discord")).toBeInTheDocument();
  });

  it("renders nothing when hidden", () => {
    render(<ActivityEndedModal show={false} />);
    expect(screen.queryByText("Referral Ended")).not.toBeInTheDocument();
  });
});
