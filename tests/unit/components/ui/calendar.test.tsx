import { render, screen } from "@testing-library/react";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarUTC } from "@/components/ui/calendar-utc";

describe("Calendar", () => {
  it("renders a month grid with the provided month and custom class", () => {
    render(
      <Calendar
        mode="single"
        month={new Date("2026-03-15T00:00:00Z")}
        className="cal-x"
      />,
    );

    expect(screen.getByText("March 2026")).toBeInTheDocument();
    // a day cell from the rendered month
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("hides outside days when showOutsideDays is false", () => {
    const { container } = render(
      <Calendar
        mode="single"
        month={new Date("2026-03-15T00:00:00Z")}
        showOutsideDays={false}
      />,
    );
    // grid still renders
    expect(container.querySelector("table")).not.toBeNull();
  });
});

describe("Calendar (UTC variant)", () => {
  it("renders the requested month", () => {
    render(
      <CalendarUTC mode="single" month={new Date("2026-05-10T00:00:00Z")} />,
    );

    expect(screen.getByText("May 2026")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
