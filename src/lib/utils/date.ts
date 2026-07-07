export function sliceUTCString(utcStr: string, mode: any) {
  const dateParts: any =
    /^(\S+), (\d+) (\S+) (\d+) (\d+):(\d+):(\d+) (\S+)$/.exec(utcStr);
  if (dateParts?.length >= 8) {
    if (mode === "day") {
      return dateParts[2] + " " + dateParts[3] + " " + dateParts[4];
    } else if (mode === "hour") {
      return (
        dateParts[2] +
        " " +
        dateParts[3] +
        " " +
        dateParts[4] +
        ", " +
        dateParts[5] +
        ":" +
        dateParts[6]
      );
    } else if (mode === "second") {
      return (
        dateParts[2] +
        " " +
        dateParts[3] +
        " " +
        dateParts[4] +
        ", " +
        dateParts[5] +
        ":" +
        dateParts[6] +
        ":" +
        dateParts[7]
      );
    } else if (mode === "minute") {
      return (
        dateParts[2] +
        " " +
        dateParts[3] +
        " " +
        dateParts[4] +
        ", " +
        dateParts[5] +
        ":" +
        dateParts[6]
      );
    }
    return "";
  }
  return "";
}
export function sliceDateString(dateObj: Date, mode: string) {
  if (dateObj) {
    const year: number = dateObj.getFullYear();
    const month: number = dateObj.getMonth() + 1;
    const day: number = dateObj.getDate();
    const hours: number = dateObj.getHours();
    const minutes: number = dateObj.getMinutes();
    const seconds: number = dateObj.getSeconds();
    const monthStr: any = month < 10 ? "0" + month : month;
    const dayStr: any = day < 10 ? "0" + day : day;
    const hoursStr: any = hours < 10 ? "0" + hours : hours;
    const minutesStr: any = minutes < 10 ? "0" + minutes : minutes;
    const secondsStr: any = seconds < 10 ? "0" + seconds : seconds;
    if (mode === "day") {
      return year + "/" + monthStr + "/" + dayStr;
    } else if (mode === "hour") {
      return (
        year + "/" + monthStr + "/" + dayStr + " " + hoursStr + ":" + minutesStr
      );
    } else if (mode === "second") {
      return (
        year +
        "/" +
        monthStr +
        "/" +
        dayStr +
        " " +
        hoursStr +
        ":" +
        minutesStr +
        ":" +
        secondsStr
      );
    }
  }
  return "";
}

/**
 * get timestamp (seconds) with specific timezone
 */
export function getTimestampByTimezone(
  timezone: number,
  date: Date = new Date(),
) {
  const currentTimezoneOffset = date.getTimezoneOffset();
  const targetTimezoneOffset = -(timezone * 60);
  const timezoneOffsetDiff = targetTimezoneOffset - currentTimezoneOffset;
  const targetDate = new Date(date.getTime() + timezoneOffsetDiff * 60 * 1000);
  return Math.floor(targetDate.getTime() / 1000);
}

export function getUTCTimestampByTimezoneToDate(date: Date = new Date()) {
  const targetDate = new Date(date.getTime());
  return Math.floor(targetDate.getTime() / 1000);
}

/**
 * generate date string like `{year}-{month}-{day} {hours}:{minutes}:{seconds}`
 * @param timezone
 * @returns
 */

export function getDateString(timezone: number): string {
  const now = new Date();
  const currentTimezoneOffset = now.getTimezoneOffset();
  const targetTimezoneOffset = -(timezone * 60); // UTC+x
  const timezoneOffsetDiff = targetTimezoneOffset - currentTimezoneOffset;
  const targetDate = new Date(now.getTime() + timezoneOffsetDiff * 60 * 1000);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const hours = String(targetDate.getHours()).padStart(2, "0");
  const minutes = String(targetDate.getMinutes()).padStart(2, "0");
  const seconds = String(targetDate.getSeconds()).padStart(2, "0");
  const formattedDateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDateTimeString;
}

export function convertHoursToYearsMonthsDaysHours(totalHours: number): {
  years: number;
  months: number;
  days: number;
  remainingHours: number;
} {
  const hoursInYear = 365 * 24;
  const hoursInMonth = 30 * 24;

  const years = Math.floor(totalHours / hoursInYear);
  const remainingHoursAfterYears = totalHours % hoursInYear;

  const months = Math.floor(remainingHoursAfterYears / hoursInMonth);
  const remainingHoursAfterMonths = remainingHoursAfterYears % hoursInMonth;

  const days = Math.floor(remainingHoursAfterMonths / 24);
  const remainingHours = remainingHoursAfterMonths % 24;

  return {
    years,
    months,
    days,
    remainingHours,
  };
}

export function getDateDisplay(timestamp: number, cycleType: string) {
  const utcStr = new Date(timestamp * 1000).toUTCString();
  switch (cycleType) {
    case "hour":
      return sliceUTCString(utcStr, "hour");
    case "day":
      return sliceUTCString(utcStr, "day");
    default:
      return sliceUTCString(utcStr, "day");
  }
}

export function getDateRangeDisplay(
  cycleType: string,
  startTime?: number,
  endTime?: number,
) {
  if (!startTime || !endTime) return "/";

  if (cycleType === "Hour") {
    return `${getDateDisplay(Number(startTime), "hour")} - ${getDateDisplay(
      Number(endTime),
      "hour",
    )}`;
  }

  if (cycleType === "Day") {
    return getDateDisplay(Number(startTime), "day");
  }

  return `${getDateDisplay(Number(startTime), "day")} - ${getDateDisplay(
    Number(endTime),
    "day",
  )}`;
}

export function formatSeconds(seconds: number): string {
  const hours: number = Math.floor(seconds / 3600);
  const minutes: number = Math.floor((seconds % 3600) / 60);
  const remainingSeconds: number = seconds % 60;
  const hoursStr: string = hours.toString().padStart(2, "0");
  const minutesStr: string = minutes.toString().padStart(2, "0");
  const secondsStr: string = remainingSeconds.toString().padStart(2, "0");
  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

/**
 * Format a timestamp as a relative time string in English.
 * @param timestamp Timestamp in seconds
 * @returns Relative time string, e.g. "5 minutes ago", "2 hours ago"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else if (days > 0) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else {
    return "just now";
  }
}
