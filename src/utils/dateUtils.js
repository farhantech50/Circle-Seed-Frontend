/**
 * Date & Time Utility for Dhaka Timezone (Asia/Dhaka / UTC+6)
 */

export const DHAKA_TIMEZONE = "Asia/Dhaka";

/**
 * Format ISO string or Date object into Asia/Dhaka date string.
 * @param {string | Date | number} dateVal - Input date
 * @param {boolean} includeTime - Include time in output
 * @param {boolean} use12Hour - Use 12-hour AM/PM format (default: true)
 * @returns {string} e.g. "28 Jul 2026" or "28 Jul 2026, 11:59 AM"
 */
export const formatDhakaDate = (dateVal, includeTime = false, use12Hour = true) => {
  if (!dateVal) return "-";
  try {
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "-";

    const options = {
      timeZone: DHAKA_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.hour12 = use12Hour;
    }

    return new Intl.DateTimeFormat("en-GB", options).format(date);
  } catch (err) {
    console.error("formatDhakaDate error:", err);
    return "-";
  }
};

/**
 * Format date & time in Dhaka timezone with 12-hour AM/PM format.
 * @param {string | Date | number} dateVal
 * @returns {string} e.g. "28 Jul 2026, 11:59 AM"
 */
export const formatDhakaDateTime = (dateVal) => {
  return formatDhakaDate(dateVal, true, true);
};

/**
 * Format time only in Dhaka timezone.
 * @param {string | Date | number} dateVal
 * @param {boolean} use12Hour
 * @returns {string} e.g. "11:59 AM" or "11:59"
 */
export const formatDhakaTime = (dateVal, use12Hour = true) => {
  if (!dateVal) return "-";
  try {
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("en-US", {
      timeZone: DHAKA_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: use12Hour,
    }).format(date);
  } catch (err) {
    return "-";
  }
};

/**
 * Format date into YYYY-MM-DD format in Dhaka timezone (ideal for HTML date inputs).
 * @param {string | Date | number} dateVal
 * @returns {string} e.g. "2026-07-28"
 */
export const formatDhakaYYYYMMDD = (dateVal) => {
  if (!dateVal) return "";
  try {
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-CA", {
      timeZone: DHAKA_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (err) {
    return "";
  }
};

/**
 * Backwards compatibility helper matching legacy formatDate signature.
 */
export function formatDate(isoString, time = false) {
  return formatDhakaDate(isoString, time, true);
}

export default formatDhakaDate;
