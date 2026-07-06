import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { subscribeVehicles } from '../services/vehicles.js';
import { getChecksInRange } from '../services/checks.js';
import { buildInspectionPdf, downloadPdf, printInspectionPdf } from '../services/exportPdf.js';
import { checksWithFilledResults, flattenChecksForExport, downloadTextFile, rowsToCsv } from '../utils/exportShape.js';
import { sortChecksByDateDesc } from '../utils/weekStatus.js';
import { toDateKey } from '../utils/dates.js';
import { AppShell } from '../components/AppShell.jsx';
import { Header } from '../components/Header.jsx';
import { ExportControls } from '../components/ExportControls.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import styles from './History.module.css';

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toDateKey(d);
}

function defaultTo() {
  return toDateKey(new Date());
}

export function HistoryPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportBusy, setExportBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    return subscribeVehicles(
      user.uid,
      (list) => setVehicles(list),
      () => {}
    );
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const list = await getChecksInRange(user.uid, vehicleId || null, from, to);
        if (!cancelled) setChecks(sortChecksByDateDesc(list));
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load history');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, vehicleId, from, to]);

  const vehiclesById = useMemo(() => {
    const m = {};
    for (const v of vehicles) m[v.id] = v;
    return m;
  }, [vehicles]);

  const exportableChecks = useMemo(() => checksWithFilledResults(checks), [checks]);

  function exportMeta() {
    const vehicleLabel =
      vehicleId && vehiclesById[vehicleId] ? vehiclesById[vehicleId].name : 'All vehicles';
    return {
      title: 'Fleet Checklist — Inspection export',
      filters: { vehicleLabel, from, to },
      vehiclesById,
      checks: exportableChecks,
    };
  }

  function handleExportCsv() {
    const rows = flattenChecksForExport(vehiclesById, exportableChecks);
    const csv = rowsToCsv(rows);
    downloadTextFile(`fleet-checklist-${from}-${to}.csv`, csv);
  }

  function handleExportPdf() {
    setExportBusy(true);
    try {
      const doc = buildInspectionPdf(exportMeta());
      downloadPdf(doc, `fleet-checklist-${from}-${to}.pdf`);
    } finally {
      setExportBusy(false);
    }
  }

  function handlePrint() {
    setExportBusy(true);
    try {
      printInspectionPdf(exportMeta());
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <AppShell>
      <Header
        title="Export & print"
        left={
          <Link to="/" className={styles.back}>
            ← Home
          </Link>
        }
      />
      <main className={styles.main}>
        <p className={styles.lead}>
          Choose a date range and vehicle, then print or download saved checklists.
        </p>
        <ExportControls
          vehicles={vehicles}
          vehicleId={vehicleId}
          onVehicleChange={setVehicleId}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onExportCsv={handleExportCsv}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          recordCount={exportableChecks.length}
          busy={exportBusy}
        />

        {error ? <p className={styles.error}>{error}</p> : null}

        {loading ? <p className={styles.muted}>Loading…</p> : null}

        {!loading && !checks.length ? (
          <EmptyState title="No records" description="Try widening your date range or add a vehicle." />
        ) : null}

        {!loading && checks.length && !exportableChecks.length ? (
          <p className={styles.muted}>No completed checklist items in this range yet.</p>
        ) : null}

        {exportableChecks.length ? (
          <p className={styles.count}>
            {exportableChecks.length} saved checklist{exportableChecks.length === 1 ? '' : 's'} in range
          </p>
        ) : null}

        <h2 className={styles.h2}>Saved checklists</h2>
        <ul className={styles.list}>
          {checks.map((c) => {
            const v = vehiclesById[c.vehicleId];
            return (
              <li key={c.id}>
                <Link to={`/history/${c.id}`} className={styles.row}>
                  <div>
                    <div className={styles.rowTitle}>{v?.name || 'Vehicle'}</div>
                    <div className={styles.rowSub}>{c.dateKey}</div>
                  </div>
                  <span
                    className={
                      c.hasIssues ? styles.tagBad : c.overallStatus === 'good' ? styles.tagOk : styles.tagMid
                    }
                  >
                    {c.hasIssues ? 'Issue' : c.overallStatus === 'good' ? 'Good' : 'Partial'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </AppShell>
  );
}
