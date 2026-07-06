/**
 * Flatten checks for CSV / PDF export.
 */

/** Checks with at least one item marked good or issue (saved inspections). */
export function checksWithFilledResults(checks) {
  return checks.filter((c) =>
    (c.results || []).some((r) => r.state === 'good' || r.state === 'issue')
  );
}

export function flattenChecksForExport(vehiclesById, checks) {
  const rows = [];
  for (const check of checks) {
    const v = vehiclesById[check.vehicleId];
    const vehicleName = v?.name ?? 'Unknown';
    const vehicleType = v?.type ?? check.vehicleType ?? '';
    const reg = v?.registrationId ?? '';
    for (const r of check.results || []) {
      rows.push({
        date: check.dateKey,
        vehicleName,
        vehicleType,
        registrationId: reg,
        overallStatus: check.overallStatus,
        categoryName: r.categoryName,
        itemLabel: r.itemLabel,
        itemState: r.state,
        note: r.note || '',
        photoUrl: r.photoUrl || '',
      });
    }
  }
  return rows;
}

export function rowsToCsv(rows) {
  const headers = [
    'Date',
    'Vehicle Name',
    'Vehicle Type',
    'Registration/ID',
    'Overall Status',
    'Category',
    'Checklist Item',
    'Item State',
    'Note',
    'Photo URL',
  ];
  const escape = (val) => {
    const s = String(val ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.date,
        row.vehicleName,
        row.vehicleType,
        row.registrationId,
        row.overallStatus,
        row.categoryName,
        row.itemLabel,
        row.itemState,
        row.note,
        row.photoUrl,
      ]
        .map(escape)
        .join(',')
    );
  }
  return lines.join('\n');
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTextFile(filename, text) {
  downloadBlob(filename, new Blob([text], { type: 'text/csv;charset=utf-8' }));
}
