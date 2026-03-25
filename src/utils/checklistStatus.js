/**
 * Derive overall status from item results.
 */

export function computeOverallFromResults(results) {
  const hasIssue = results.some((r) => r.state === 'issue');
  if (hasIssue) {
    return { overallStatus: 'issue', hasIssues: true, completed: true };
  }
  const allGood = results.length > 0 && results.every((r) => r.state === 'good');
  const anyChecked = results.some((r) => r.state === 'good' || r.state === 'issue');
  if (allGood) {
    return { overallStatus: 'good', hasIssues: false, completed: true };
  }
  if (anyChecked) {
    return { overallStatus: 'partial', hasIssues: false, completed: false };
  }
  return { overallStatus: 'partial', hasIssues: false, completed: false };
}

export function cycleItemState(current) {
  if (current === 'unchecked') return 'good';
  if (current === 'good') return 'issue';
  return 'unchecked';
}
