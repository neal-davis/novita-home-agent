import dayjs from "dayjs";
import { render } from "@testing-library/react";
import { DayjsRangePicker } from "@/components/ui/standard/dayjs-range-picker";

let captured: any = {};
jest.mock("@/components/ui/standard/date-range-picker", () => ({
  __esModule: true,
  default: (props: any) => {
    captured = props;
    return <div data-testid="drp" />;
  },
}));

beforeEach(() => {
  captured = {};
});

describe("DayjsRangePicker", () => {
  it("passes the dayjs values as native dates to the picker", () => {
    const from = dayjs("2024-01-01");
    const to = dayjs("2024-01-31");
    render(<DayjsRangePicker value={[from, to]} onChange={jest.fn()} />);
    expect(captured.startTime).toEqual(from.toDate());
    expect(captured.endTime).toEqual(to.toDate());
  });

  it("emits a dayjs tuple with end-of-day on a valid range change", () => {
    const onChange = jest.fn();
    render(
      <DayjsRangePicker
        value={[dayjs("2024-01-01"), dayjs("2024-01-31")]}
        onChange={onChange}
      />,
    );
    captured.onChange({
      from: new Date("2024-02-01"),
      to: new Date("2024-02-10"),
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    const [result] = onChange.mock.calls[0];
    expect(dayjs.isDayjs(result[0])).toBe(true);
    expect(result[1].format("HH:mm:ss")).toBe("23:59:59");
  });

  it("emits null when the range is incomplete", () => {
    const onChange = jest.fn();
    render(
      <DayjsRangePicker
        value={[dayjs("2024-01-01"), dayjs("2024-01-31")]}
        onChange={onChange}
      />,
    );
    captured.onChange({ from: null, to: null });
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
