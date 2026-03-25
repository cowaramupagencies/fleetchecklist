import { parseDateKey } from './dates.js';

/**
 * @param {Array<{ dateKey: string, updatedAt?: *, hasIssues: boolean }>} checks
 * @param {string[]} weekDayKeys Mon–Sun keys
 * @returns {Record<string, 'empty' | 'good' | 'issue'>}
 */
export function aggregateWeekDayStatus(checks, weekDayKeys) {
  const byDay = {};
  weekDayKeys.forEach((k) => {
    byDay[k] = [];
  });
  for (const c of checks) {
    if (byDay[c.dateKey]) byDay[c.dateKey].push(c);
  }
  const out = {};
  for (const key of weekDayKeys) {
    const list = byDay[key];
    if (!list.length) {
      out[key] = 'empty';
      continue;
    }
    list.sort((a, b) => {
      const ta = a.updatedAt?.toMillis?.() ?? a.updatedAt ?? 0;
      const tb = b.updatedAt?.toMillis?.() ?? b.updatedAt ?? 0;
      return tb - ta;
    });
    const latest = list[0];
    out[key] = latest.hasIssues ? 'issue' : 'good';
  }
  return out;
}

export function sortChecksByDateDesc(checks) {
  return [...checks].sort((a, b) => {
    const da = parseDateKey(a.dateKey).getTime();
    const db = parseDateKey(b.dateKey).getTime();
    if (db !== da) return db - da;
    const ta = a.updatedAt?.toMillis?.() ?? 0;
    const tb = b.updatedAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
}
