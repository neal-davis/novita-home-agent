import {
  convertHoursToYearsMonthsDaysHours,
  formatRelativeTime,
  formatSeconds,
  getDateDisplay,
  getDateRangeDisplay,
  getDateString,
  getTimestampByTimezone,
  getUTCTimestampByTimezoneToDate,
  sliceDateString,
  sliceUTCString,
} from "@/lib/utils/date";

describe("date utils", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("slices UTC strings by day, hour, minute and second", () => {
    const utc = "Fri, 05 Jun 2026 09:08:07 GMT";

    expect(sliceUTCString(utc, "day")).toBe("05 Jun 2026");
    expect(sliceUTCString(utc, "hour")).toBe("05 Jun 2026, 09:08");
    expect(sliceUTCString(utc, "minute")).toBe("05 Jun 2026, 09:08");
    expect(sliceUTCString(utc, "second")).toBe("05 Jun 2026, 09:08:07");
    expect(sliceUTCString(utc, "unknown")).toBe("");
    expect(sliceUTCString("not a utc string", "day")).toBe("");
  });

  it("formats local Date objects by mode", () => {
    const date = new Date(2026, 0, 2, 3, 4, 5);

    expect(sliceDateString(date, "day")).toBe("2026/01/02");
    expect(sliceDateString(date, "hour")).toBe("2026/01/02 03:04");
    expect(sliceDateString(date, "second")).toBe("2026/01/02 03:04:05");
    expect(sliceDateString(date, "unknown")).toBe("");
    expect(sliceDateString(null as unknown as Date, "day")).toBe("");
  });

  it("calculates timestamps for target timezones", () => {
    const date = new Date("2026-06-05T00:00:00.000Z");
    const expected = Math.floor(
      (date.getTime() + (-(8 * 60) - date.getTimezoneOffset()) * 60 * 1000) /
        1000,
    );

    expect(getTimestampByTimezone(8, date)).toBe(expected);
    expect(getUTCTimestampByTimezoneToDate(date)).toBe(1780617600);
  });

  it("generates timezone-adjusted date strings with padded fields", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-05T01:02:03.000Z"));
    const now = new Date();
    const expectedDate = new Date(
      now.getTime() + (-(0 * 60) - now.getTimezoneOffset()) * 60 * 1000,
    );
    const expected = `${expectedDate.getFullYear()}-${String(
      expectedDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(expectedDate.getDate()).padStart(
      2,
      "0",
    )} ${String(expectedDate.getHours()).padStart(2, "0")}:${String(
      expectedDate.getMinutes(),
    ).padStart(2, "0")}:${String(expectedDate.getSeconds()).padStart(2, "0")}`;

    expect(getDateString(0)).toBe(expected);
  });

  it("converts hour totals into years, months, days and remaining hours", () => {
    expect(convertHoursToYearsMonthsDaysHours(365 * 24 + 32 * 24 + 5)).toEqual({
      days: 2,
      months: 1,
      remainingHours: 5,
      years: 1,
    });
  });

  it("formats date displays and ranges from Unix timestamps", () => {
    const start = Date.UTC(2026, 5, 5, 9, 8, 7) / 1000;
    const end = Date.UTC(2026, 5, 6, 10, 9, 8) / 1000;

    expect(getDateDisplay(start, "hour")).toBe("05 Jun 2026, 09:08");
    expect(getDateDisplay(start, "day")).toBe("05 Jun 2026");
    expect(getDateDisplay(start, "week")).toBe("05 Jun 2026");
    expect(getDateRangeDisplay("Hour", start, end)).toBe(
      "05 Jun 2026, 09:08 - 06 Jun 2026, 10:09",
    );
    expect(getDateRangeDisplay("Day", start, end)).toBe("05 Jun 2026");
    expect(getDateRangeDisplay("Month", start, end)).toBe(
      "05 Jun 2026 - 06 Jun 2026",
    );
    expect(getDateRangeDisplay("Hour")).toBe("/");
  });

  it("formats durations and relative times", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));

    expect(formatSeconds(3661)).toBe("01:01:01");
    expect(
      formatRelativeTime(Date.parse("2026-06-05T11:59:45.000Z") / 1000),
    ).toBe("just now");
    expect(
      formatRelativeTime(Date.parse("2026-06-05T11:58:00.000Z") / 1000),
    ).toBe("2 minutes ago");
    expect(
      formatRelativeTime(Date.parse("2026-06-05T10:00:00.000Z") / 1000),
    ).toBe("2 hours ago");
    expect(
      formatRelativeTime(Date.parse("2026-06-03T12:00:00.000Z") / 1000),
    ).toBe("2 days ago");
    expect(
      formatRelativeTime(Date.parse("2026-04-05T12:00:00.000Z") / 1000),
    ).toBe("2 months ago");
    expect(
      formatRelativeTime(Date.parse("2024-06-05T12:00:00.000Z") / 1000),
    ).toBe("2 years ago");
  });
});
