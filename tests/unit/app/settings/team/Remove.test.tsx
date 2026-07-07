import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const removeTeamMember = jest.fn();
jest.mock("@/api/team", () => ({
  removeTeamMember: (...a: unknown[]) => removeTeamMember(...a),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

import Remove from "@/app/settings/team/Remove";
import { message } from "@/components/ui/standard/notify";

const onOpenChange = jest.fn();
const onSuccess = jest.fn();

function renderRemove() {
  return render(
    <Remove
      open
      memID="mem-1"
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />,
  );
}

describe("Remove", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the confirmation copy", () => {
    renderRemove();
    expect(
      screen.getByText("Are you sure you want to remove this member?"),
    ).toBeInTheDocument();
  });

  it("removes the member and reports success", async () => {
    removeTeamMember.mockResolvedValueOnce({});
    renderRemove();
    fireEvent.click(screen.getByText("Remove"));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(removeTeamMember).toHaveBeenCalledWith("mem-1");
    expect(message.success).toHaveBeenCalledWith("Member removed");
  });

  it("reports an error on failure", async () => {
    removeTeamMember.mockRejectedValueOnce(new Error("nope"));
    renderRemove();
    fireEvent.click(screen.getByText("Remove"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Failed to remove member"),
    );
  });
});
