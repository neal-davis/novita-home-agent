"use client";

import dayjs, { type Dayjs } from "dayjs";
import DateRangePicker from "./date-range-picker";

type DayjsRangePickerProps = {
  value: [Dayjs, Dayjs];
  className?: string;
  onChange: (dates: [Dayjs, Dayjs] | null) => void;
};

// i18n-disable-next-line
const displayDateFormat = "yyyy/MM/dd";

export function DayjsRangePicker({
  value,
  className,
  onChange,
}: DayjsRangePickerProps) {
  return (
    <DateRangePicker
      startTime={value[0]?.toDate()}
      endTime={value[1]?.toDate()}
      dateFormat={displayDateFormat}
      allowEmpty
      className={className}
      onChange={(dates) => {
        if (!dates.from || !dates.to) {
          onChange(null);
          return;
        }
        onChange([
          dayjs(dates.from),
          dayjs(dayjs(dates.to).format("YYYY-MM-DD") + " 23:59:59"),
        ]);
      }}
    />
  );
}
