import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const resendInvite = jest.fn();
jest.mock("@/api/team", () => ({
  resendInvite: (...a: unknown[]) => resendInvite(...a),
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

import Resend from "@/app/settings/team/Resend";
import { message } from "@/components/ui/standard/notify";

const onOpenChange = jest.fn();
const onSuccess = jest.fn();

function renderResend() {
  return render(
    <Resend
      open
      inviteID="inv-1"
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />,
  );
}

describe("Resend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
  });

  it("closes without calling the api on cancel", () => {
    renderResend();
    fireEvent.click(screen.getByText("Cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(resendInvite).not.toHaveBeenCalled();
  });

  it("resends, copies the link, and reports success", async () => {
    resendInvite.mockResolvedValueOnce({ invite_url: "https://x/invite" });
    renderResend();
    fireEvent.click(screen.getByText("Resend Invitation"));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(resendInvite).toHaveBeenCalledWith("inv-1");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://x/invite",
    );
    expect(message.success).toHaveBeenCalledWith(
      "Invitation email sent successfully!",
    );
  });

  it("reports an error toast on failure", async () => {
    resendInvite.mockRejectedValueOnce(new Error("nope"));
    renderResend();
    fireEvent.click(screen.getByText("Resend Invitation"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Failed to resend invitation"),
    );
  });
});
