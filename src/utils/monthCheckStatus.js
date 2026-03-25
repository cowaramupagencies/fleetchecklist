/**
 * Latest check per dateKey wins. 'good' = no issues; 'issue' = any issue.
 */
export function buildDayStatusMapFromChecks(checks) {
  const byDay = {};
  for (const c of checks) {
    if (!byDay[c.dateKey]) byDay[c.dateKey] = [];
    byDay[c.dateKey].push(c);
  }
  const out = {};
  for (const key of Object.keys(byDay)) {
    const list = byDay[key].sort((a, b) => {
      const tb = b.updatedAt?.toMillis?.() ?? 0;
      const ta = a.updatedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    const latest = list[0];
    out[key] = latest.hasIssues ? 'issue' : 'good';
  }
  return out;
}
