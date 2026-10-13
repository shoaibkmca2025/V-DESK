/**
 * Period arithmetic in Asia/Kolkata (rules.md §14): a period of n months ends on the same IST wall-clock time n
 * calendar months later, clamped to the month's last day (31 Jan + 1 month → 28/29 Feb). India has no DST, so a
 * fixed +05:30 offset is exact.
 */
const OFFSET_MS = 330 * 60_000;
export const DAY_MS = 86_400_000;

export function addMonthsIst(instant, months) {
  const local = new Date(instant.getTime() + OFFSET_MS);
  const day = local.getUTCDate();
  local.setUTCDate(1);
  local.setUTCMonth(local.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 0)).getUTCDate();
  local.setUTCDate(Math.min(day, lastDay));
  return new Date(local.getTime() - OFFSET_MS);
}

export const addDays = (instant, days) => new Date(instant.getTime() + days * DAY_MS);
