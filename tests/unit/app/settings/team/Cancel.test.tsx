import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const cancelInvite = jest.fn();
jest.mock("@/api/team", () => ({
  cancelInvite: (...a: unknown[]) => cancelInvite(...a),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

import Cancel from "@/app/settings/team/Cancel";
import { message } from "@/components/ui/standard/notify";

const onOpenChange = jest.fn();
const onSuccess = jest.fn();

function renderCancel() {
  return render(
    <Cancel
      open
      inviteID="inv-1"
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />,
  );
}

describe("Cancel", () => {
  beforeEach(() => jest.clearAllMocks());

  it("dismisses without calling the api when clicking No", () => {
    renderCancel();
    fireEvent.click(screen.getByText("No"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(cancelInvite).not.toHaveBeenCalled();
  });

  it("cancels the invite and reports success", async () => {
    cancelInvite.mockResolvedValueOnce({});
    renderCancel();
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(cancelInvite).toHaveBeenCalledWith("inv-1");
    expect(message.success).toHaveBeenCalledWith("Invitation canceled");
  });

  it("reports an error on failure", async () => {
    cancelInvite.mockRejectedValueOnce(new Error("nope"));
    renderCancel();
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Failed to cancel invitation"),
    );
  });
});
