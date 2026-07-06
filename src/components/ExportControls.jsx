import styles from './ExportControls.module.css';

export function ExportControls({
  vehicles,
  vehicleId,
  onVehicleChange,
  from,
  to,
  onFromChange,
  onToChange,
  onExportCsv,
  onExportPdf,
  onPrint,
  recordCount,
  busy,
}) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Date range</h2>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="exp-veh">
          Vehicle
        </label>
        <select
          id="exp-veh"
          className={styles.select}
          value={vehicleId}
          onChange={(e) => onVehicleChange(e.target.value)}
        >
          <option value="">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.grid2}>
        <div>
          <label className={styles.label} htmlFor="exp-from">
            From
          </label>
          <input
            id="exp-from"
            type="date"
            className={styles.input}
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="exp-to">
            To
          </label>
          <input
            id="exp-to"
            type="date"
            className={styles.input}
            value={to}
            onChange={(e) => onToChange(e.target.value)}
          />
        </div>
      </div>
      {typeof recordCount === 'number' ? (
        <p className={styles.hint}>
          {recordCount
            ? `${recordCount} saved checklist${recordCount === 1 ? '' : 's'} ready to export`
            : 'No saved checklists in this range yet'}
        </p>
      ) : null}
      <div className={styles.btns}>
        <button type="button" className={styles.btnPrint} disabled={busy || recordCount === 0} onClick={onPrint}>
          Print
        </button>
        <button type="button" className={styles.btn} disabled={busy || recordCount === 0} onClick={onExportCsv}>
          Download CSV
        </button>
        <button type="button" className={styles.btnPrimary} disabled={busy || recordCount === 0} onClick={onExportPdf}>
          Download PDF
        </button>
      </div>
    </div>
  );
}
