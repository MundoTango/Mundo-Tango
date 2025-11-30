import { format, formatDistanceToNow } from "date-fns";
import { formatTimezoneAbbr } from "./timezoneUtils";

/**
 * Safely format a date with automatic fallback on error
 * Prevents RangeError: Invalid time value crashes
 */
export function safeDateFormat(
  date: string | Date | null | undefined,
  formatStr: string,
  fallback: string = "TBD",
  timezone?: string
): string {
  try {
    if (!date) return fallback;
    const formatted = format(new Date(date), formatStr);
    if (timezone) {
      const tzAbbr = formatTimezoneAbbr(timezone);
      return `${formatted} ${tzAbbr}`;
    }
    return formatted;
  } catch {
    return fallback;
  }
}

/**
 * Safely format distance to now with automatic fallback
 */
export function safeDateDistance(
  date: string | Date | null | undefined,
  options?: { addSuffix?: boolean },
  fallback: string = "recently"
): string {
  try {
    if (!date) return fallback;
    return formatDistanceToNow(new Date(date), options);
  } catch {
    return fallback;
  }
}
