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
  busy,
}) {
  return (
    <div className={styles.card}>
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
      <div className={styles.btns}>
        <button type="button" className={styles.btn} disabled={busy} onClick={onExportCsv}>
          Export CSV
        </button>
        <button type="button" className={styles.btnPrimary} disabled={busy} onClick={onExportPdf}>
          Export PDF
        </button>
      </div>
    </div>
  );
}
