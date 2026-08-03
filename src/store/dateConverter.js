import { formatDhakaDate } from "../utils/dateUtils";

export function formatDate(isoString, time = false) {
  return formatDhakaDate(isoString, time, true);
}

