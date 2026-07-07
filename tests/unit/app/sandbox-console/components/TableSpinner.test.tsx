import * as React from "react";
import { render } from "@testing-library/react";
import TableSpinner from "@/app/sandbox-console/components/TableSpinner";

describe("TableSpinner", () => {
  it("renders a standalone span spinner with the requested size", () => {
    const { container } = render(<TableSpinner standalone size={32} />);
    const span = container.querySelector("span.icon-loader") as HTMLElement;
    expect(span).toBeInTheDocument();
    expect(span.style.fontSize).toBe("32px");
  });

  it("renders a table-row spinner spanning the given column count", () => {
    const { container } = render(
      <table>
        <tbody>
          <TableSpinner tdColNum={5} />
        </tbody>
      </table>,
    );
    const td = container.querySelector("td")!;
    expect(td.getAttribute("colspan")).toBe("5");
    expect(td.className).toContain("icon-loader");
  });
});
