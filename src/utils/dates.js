/**
 * Week is Monday–Sunday. dateKey is YYYY-MM-DD in local time.
 */

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function toDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function getWeekRangeLabel(weekStart) {
  const start = new Date(weekStart);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const opts = { day: 'numeric', month: 'long' };
  const startStr = start.toLocaleDateString(undefined, opts);
  const endStr = end.toLocaleDateString(
    undefined,
    sameMonth ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' }
  );
  return `${startStr}–${endStr}`;
}

export function getWeekDayKeys(weekStart) {
  const keys = [];
  for (let i = 0; i < 7; i += 1) {
    keys.push(toDateKey(addDays(weekStart, i)));
  }
  return keys;
}

export function getShortWeekdayLabels() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export function isTodayDateKey(dateKey) {
  return dateKey === toDateKey(new Date());
}

/** Whole weeks between `dateKey`'s Monday and the Monday of `referenceDate`. */
export function weekOffsetForDateKey(dateKey, referenceDate = new Date()) {
  const targetStart = startOfWeekMonday(parseDateKey(dateKey));
  const refStart = startOfWeekMonday(referenceDate);
  const diffDays = Math.round((targetStart - refStart) / (24 * 60 * 60 * 1000));
  return Math.round(diffDays / 7);
}

/** First and last calendar day (YYYY-MM-DD) for a given month (monthIndex 0–11). */
export function getMonthDateRangeKeys(year, monthIndex) {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  return { startKey: toDateKey(start), endKey: toDateKey(end) };
}

/**
 * Monday-first month grid. Each cell is null (padding) or { dateKey, dayOfMonth }.
 */
export function getMonthCalendarCells(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const sun0 = first.getDay();
  const mondayFirstPad = sun0 === 0 ? 6 : sun0 - 1;
  const cells = [];
  for (let i = 0; i < mondayFirstPad; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dt = new Date(year, monthIndex, d);
    cells.push({ dateKey: toDateKey(dt), dayOfMonth: d });
  }
  return cells;
}
