export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const DEFAULT_MONTHS = 12;

export const DATE_RANGE_PRESETS = {
  LAST_30_DAYS: "last30Days",
  LAST_90_DAYS: "last90Days",
  THIS_MONTH: "thisMonth",
  LAST_MONTH: "lastMonth",
  THIS_YEAR: "thisYear",
  LAST_YEAR: "lastYear",
} as const;

export function getDateRangeForPreset(
  preset: string,
): { startDate: string; endDate: string } | null {
  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);

  switch (preset) {
    case DATE_RANGE_PRESETS.LAST_30_DAYS: {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString().slice(0, 10), endDate };
    }
    case DATE_RANGE_PRESETS.LAST_90_DAYS: {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString().slice(0, 10), endDate };
    }
    case DATE_RANGE_PRESETS.THIS_MONTH:
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
        endDate,
      };
    case DATE_RANGE_PRESETS.LAST_MONTH: {
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: firstOfLastMonth.toISOString().slice(0, 10),
        endDate: lastOfLastMonth.toISOString().slice(0, 10),
      };
    }
    case DATE_RANGE_PRESETS.THIS_YEAR:
      return {
        startDate: new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10),
        endDate,
      };
    case DATE_RANGE_PRESETS.LAST_YEAR:
      return {
        startDate: new Date(now.getFullYear() - 1, 0, 1).toISOString().slice(0, 10),
        endDate: new Date(now.getFullYear() - 1, 11, 31).toISOString().slice(0, 10),
      };
    default:
      return null;
  }
}
