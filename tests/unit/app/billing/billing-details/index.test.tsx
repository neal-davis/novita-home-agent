import React from "react";
import { render, screen } from "@testing-library/react";
import Content from "@/app/billing/billing-details/index";

jest.mock("@/app/components/Permission/PermissionWrapper", () => ({
  __esModule: true,
  default: ({ children }: any) => (
    <div data-testid="permission">{children}</div>
  ),
}));

jest.mock("@/app/billing/billing-details/components/DetailContent", () => ({
  __esModule: true,
  default: ({ copy }: any) => <div data-testid="detail">{String(copy)}</div>,
}));

jest.mock("@/constants/constants", () => ({
  PERMISSION: {
    RESOURCE_GROUP: { billing: "billing" },
    RESOURCE: { details: "details" },
    ACTION: { read: "read" },
  },
}));

describe("billing-details Content", () => {
  it("renders DetailContent inside the permission wrapper once mounted on client", () => {
    render(<Content copy="hello" />);

    expect(screen.getByTestId("permission")).toBeInTheDocument();
    // isClient becomes true after mount effect, so DetailContent renders
    const detail = screen.getByTestId("detail");
    expect(detail).toBeInTheDocument();
    expect(detail).toHaveTextContent("hello");
  });
});
