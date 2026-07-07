import { render } from "@testing-library/react";
import UsageBarChart from "@/app/billing/coding-plan/components/DailyUsageSection/UsageBarChart";

const mockSetOption = jest.fn();
const mockResize = jest.fn();
const mockInit = jest.fn();
const mockGetInstance = jest.fn();

jest.mock("echarts", () => {
  const instance = {
    setOption: (...args: any[]) => mockSetOption(...args),
    resize: (...args: any[]) => mockResize(...args),
  };
  return {
    init: (...args: any[]) => {
      mockInit(...args);
      return instance;
    },
    getInstanceByDom: (...args: any[]) => mockGetInstance(...args),
    graphic: {
      LinearGradient: class {
        constructor(..._args: any[]) {}
      },
    },
  };
});

const data = [
  { timestamp: 1700000000, tokens: 1500 },
  { timestamp: 1700086400, tokens: 2_500_000 },
];

describe("UsageBarChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInstance.mockReturnValue(undefined);
  });

  it("initializes a chart and sets options with mapped series data", () => {
    render(<UsageBarChart data={data} />);
    expect(mockInit).toHaveBeenCalled();
    expect(mockSetOption).toHaveBeenCalledTimes(1);

    const option = mockSetOption.mock.calls[0][0];
    // x-axis dates formatted M/D in UTC
    expect(option.xAxis.data).toEqual(["11/14", "11/15"]);
    // series tokens passed through
    expect(option.series[0].data).toEqual([1500, 2_500_000]);
  });

  it("reuses an existing chart instance instead of re-initializing", () => {
    const existing = { setOption: mockSetOption, resize: mockResize };
    mockGetInstance.mockReturnValue(existing);
    render(<UsageBarChart data={data} />);
    expect(mockInit).not.toHaveBeenCalled();
    expect(mockSetOption).toHaveBeenCalled();
  });

  it("tooltip formatter renders date and formatted tokens", () => {
    render(<UsageBarChart data={data} />);
    const option = mockSetOption.mock.calls[0][0];
    const html = option.tooltip.formatter([{ dataIndex: 1 }]);
    expect(html).toContain("2.5M tokens");
    expect(html).toContain("11-15");
  });

  it("resizes on window resize", () => {
    render(<UsageBarChart data={data} />);
    window.dispatchEvent(new Event("resize"));
    expect(mockResize).toHaveBeenCalled();
  });
});
