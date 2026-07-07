"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  format,
  parse,
  addSeconds,
  subDays,
  addDays,
  startOfDay,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import debounce from "lodash/debounce";
import clsx from "clsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import styles from "./date-range-picker.module.scss";
import { enUS } from "date-fns/locale";
const commonDateRangePicker = {
  today: "Today",
  past7days: "Past 7 Days",
  lastweek: "Last Week",
  lastmonth: "Last Month",
  thisweek: "This Week",
  thismonth: "This Month",
  pickADate: "Pick a Date",
  startPlaceholder: "Start Date",
  endPlaceholder: "End Date",
};
interface DateRangePickerProps {
  startTime: Date | undefined;
  endTime: Date | undefined;
  dateFormat?: string;
  allowEmpty?: boolean;
  onChange: (dates: { from: Date | undefined; to: Date | undefined }) => void;
  className?: string;
  style?: React.CSSProperties;
  quickSelectList?: (
    | "today"
    | "past7days"
    | "lastweek"
    | "lastmonth"
    | "thisweek"
    | "thismonth"
  )[];
}
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startTime,
  endTime,
  dateFormat = "MM/dd/yyyy",
  onChange,
  className,
  style,
  quickSelectList,
  allowEmpty,
}) => {
  const [open, setOpen] = useState(false);
  const [inputStartTime, setInputStartTime] = useState(
    startTime ? format(startTime, dateFormat) : "",
  );
  const [inputEndTime, setInputEndTime] = useState(
    endTime ? format(endTime, dateFormat) : "",
  );
  useEffect(() => {
    setInputStartTime(startTime ? format(startTime, dateFormat) : "");
    setInputEndTime(endTime ? format(endTime, dateFormat) : "");
  }, [startTime, endTime, dateFormat]);
  const debouncedOnChange = useMemo(
    () =>
      debounce(
        (dates: { from: Date | undefined; to: Date | undefined }) =>
          onChange(dates),
        1500,
      ),
    [onChange],
  );
  const handleInputClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();
      setOpen(true);
      setTimeout(() => (e.target as HTMLInputElement).focus(), 200);
    },
    [],
  );
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
      if (type === "start") {
        setInputStartTime(e.target.value);
        const parsedDate = parse(e.target.value, dateFormat, new Date());
        if (!isNaN(parsedDate.getTime())) {
          debouncedOnChange({
            from: parsedDate,
            to: endTime,
          });
        } else {
          debouncedOnChange({
            from: startTime,
            to: endTime,
          });
        }
      } else {
        setInputEndTime(e.target.value);
        const parsedDate = parse(e.target.value, dateFormat, new Date());
        if (!isNaN(parsedDate.getTime())) {
          debouncedOnChange({
            from: startTime,
            to: parsedDate,
          });
        } else {
          debouncedOnChange({
            from: startTime,
            to: endTime,
          });
        }
      }
    },
    [startTime, endTime, dateFormat, debouncedOnChange],
  );
  const handleQuickSelect = useCallback(
    (item: string) => {
      setOpen(false);
      const now = startOfDay(new Date());
      let from = now;
      let to = now;
      switch (item) {
        case "today":
          break;
        case "past7days":
          from = subDays(now, 6);
          to = new Date();
          break;
        case "lastweek":
          from = addDays(startOfWeek(subWeeks(now, 1)), 1);
          to = addSeconds(endOfWeek(subWeeks(now, 1)), 1);
          break;
        case "lastmonth":
          from = startOfMonth(subMonths(now, 1));
          to = addSeconds(subDays(endOfMonth(subMonths(now, 1)), 1), 1);
          break;
        case "thisweek":
          from = addDays(startOfWeek(now), 1);
          to = addSeconds(endOfWeek(now), 1);
          break;
        case "thismonth":
          from = startOfMonth(now);
          to = addSeconds(subDays(endOfMonth(now), 1), 1);
          break;
        default:
          break;
      }
      onChange({ from, to });
    },
    [onChange],
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={clsx(
          "w-[300px] justify-start text-left font-normal",
          !startTime && "text-muted-foreground",
          styles.date_button,
          open ? styles.date_button_active : "",
          (!startTime || !endTime) &&
            !open &&
            !allowEmpty &&
            styles.date_button_warning,
          className,
        )}
        style={style}
      >
        <span
          className={`iconfont icon-calendar w-6 mr-2 ${styles.calendar_icon}`}
        ></span>
        {open || (startTime && endTime) ? (
          <>
            <input
              type="text"
              value={inputStartTime}
              placeholder={"Start Date"}
              className={styles.date_input}
              onClick={handleInputClick}
              onChange={(e) => handleInputChange(e, "start")}
            />
            <span
              className="iconfont icon-calendar-right mx-2"
              style={{ fontSize: 18 }}
            ></span>
            <input
              type="text"
              value={inputEndTime}
              className={styles.date_input}
              placeholder={"End Date"}
              onClick={handleInputClick}
              onChange={(e) => handleInputChange(e, "end")}
            ></input>
          </>
        ) : (
          <span className={allowEmpty ? "" : styles.empty_date_tips}>
            {"Pick a Date"}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-1000" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={startTime}
          selected={{
            from: startTime,
            to: endTime,
          }}
          onSelect={(range) => {
            onChange({ from: range?.from, to: range?.to });
          }}
          numberOfMonths={2}
          locale={enUS}
        />
        <div className={styles.date_footer}>
          {(
            quickSelectList || [
              "today",
              "past7days",
              "lastweek",
              "lastmonth",
              "thisweek",
              "thismonth",
            ]
          ).map((item) => (
            <span key={item} onClick={() => handleQuickSelect(item)}>
              {commonDateRangePicker[item]}
            </span>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
export default DateRangePicker;
