import { jsPDF } from 'jspdf';
import { flattenChecksForExport } from '../utils/exportShape.js';

export function buildInspectionPdf({ title, filters, vehiclesById, checks }) {
  const rows = flattenChecksForExport(vehiclesById, checks);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += 24;

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Vehicle: ${filters.vehicleLabel}`, margin, y);
  y += 14;
  doc.text(`From: ${filters.from}  To: ${filters.to}`, margin, y);
  y += 24;

  doc.setTextColor(30);
  if (!rows.length) {
    doc.text('No records for this range.', margin, y);
    return doc;
  }

  const lineHeight = 12;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (const row of rows) {
    const block = [
      `${row.date} · ${row.vehicleName} (${row.vehicleType})`,
      `${row.categoryName} — ${row.itemLabel}`,
      `State: ${row.itemState}${row.note ? ` · Note: ${row.note}` : ''}`,
      row.photoUrl ? `Photo: ${row.photoUrl}` : '',
    ].filter(Boolean);

    const needed = block.length * lineHeight + 8;
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(9);
    block.forEach((line, i) => {
      doc.text(line, margin, y + i * lineHeight, { maxWidth: 520 });
    });
    y += needed;
  }

  return doc;
}

export function downloadPdf(doc, filename) {
  doc.save(filename);
}

/** Opens the system print dialog for an inspection export PDF. */
export function printInspectionPdf({ title, filters, vehiclesById, checks }) {
  const doc = buildInspectionPdf({ title, filters, vehiclesById, checks });
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  const win = window.open(blobUrl, '_blank');
  if (!win) {
    doc.save(`fleet-checklist-${filters.from}-${filters.to}.pdf`);
  }
}
