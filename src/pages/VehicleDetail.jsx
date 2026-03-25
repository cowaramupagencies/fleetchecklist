import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getVehicle } from '../services/vehicles.js';
import { getChecksInRange, getRecentChecksForVehicle } from '../services/checks.js';
import { MonthCheckCalendar } from '../components/MonthCheckCalendar.jsx';
import { AppShell } from '../components/AppShell.jsx';
import { Header } from '../components/Header.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { getMonthCalendarCells, getMonthDateRangeKeys } from '../utils/dates.js';
import { buildDayStatusMapFromChecks } from '../utils/monthCheckStatus.js';
import { vehicleDisplayEmoji } from '../utils/vehicleAvatar.js';
import styles from './VehicleDetail.module.css';

function statusText(c) {
  if (c.hasIssues) return 'Issue';
  if (c.overallStatus === 'good') return 'All good';
  return 'Partial';
}

export function VehicleDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [checks, setChecks] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthChecks, setMonthChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const viewDate = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth();
  const monthTitle = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const cells = useMemo(() => getMonthCalendarCells(year, monthIndex), [year, monthIndex]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || !id) return;
      setLoading(true);
      try {
        const v = await getVehicle(id);
        if (cancelled) return;
        if (!v || v.createdBy !== user.uid) {
          setError('Vehicle not found');
          setVehicle(null);
        } else {
          setVehicle(v);
          const list = await getRecentChecksForVehicle(user.uid, id, 20);
          if (!cancelled) setChecks(list);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  useEffect(() => {
    let cancelled = false;
    async function loadMonth() {
      if (!user || !id) return;
      const { startKey, endKey } = getMonthDateRangeKeys(year, monthIndex);
      try {
        const list = await getChecksInRange(user.uid, id, startKey, endKey);
        if (!cancelled) setMonthChecks(list);
      } catch {
        if (!cancelled) setMonthChecks([]);
      }
    }
    loadMonth();
    return () => {
      cancelled = true;
    };
  }, [user, id, year, monthIndex]);

  const statusByDateKey = useMemo(() => {
    const dayMap = buildDayStatusMapFromChecks(monthChecks);
    const out = {};
    for (const cell of cells) {
      if (!cell) continue;
      out[cell.dateKey] = dayMap[cell.dateKey] ?? 'empty';
    }
    return out;
  }, [cells, monthChecks]);

  if (loading) {
    return (
      <AppShell>
        <Header title="Vehicle" left={<Link to="/">← Back</Link>} />
        <p className={styles.pad}>Loading…</p>
      </AppShell>
    );
  }

  if (error || !vehicle) {
    return (
      <AppShell>
        <Header title="Vehicle" left={<Link to="/">← Back</Link>} />
        <EmptyState title="Not found" description={error || 'This vehicle does not exist.'} />
      </AppShell>
    );
  }

  const typeLabel = vehicle.type === 'forklift' ? 'Forklift' : 'Truck';

  return (
    <AppShell>
      <Header
        title={vehicle.name}
        left={
          <Link to="/" className={styles.back}>
            ← Back
          </Link>
        }
        right={
          <Link to={`/vehicles/${vehicle.id}/edit`} className={styles.editLink}>
            Edit
          </Link>
        }
      />
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.imageWrap}>
            {vehicle.imageUrl ? (
              <img src={vehicle.imageUrl} alt="" className={styles.img} />
            ) : (
              <div className={styles.ph}>{vehicleDisplayEmoji(vehicle)}</div>
            )}
          </div>
          <div className={styles.badge}>{typeLabel}</div>
          <p className={styles.reg}>{vehicle.registrationId || '—'}</p>
          {vehicle.notes ? <p className={styles.notes}>{vehicle.notes}</p> : null}
        </div>

        <button
          type="button"
          className={styles.primary}
          onClick={() => navigate(`/vehicles/${vehicle.id}/checklist`)}
        >
          Start checklist
        </button>

        <MonthCheckCalendar
          monthTitle={monthTitle}
          cells={cells}
          statusByDateKey={statusByDateKey}
          onPrevMonth={() => setMonthOffset((m) => m - 1)}
          onNextMonth={() => setMonthOffset((m) => m + 1)}
          onSelectDay={(dateKey) =>
            navigate(`/vehicles/${vehicle.id}/checklist?date=${encodeURIComponent(dateKey)}`)
          }
        />

        <h2 className={styles.h2}>Recent checks</h2>
        {!checks.length ? (
          <p className={styles.muted}>No saved checks yet.</p>
        ) : (
          <ul className={styles.list}>
            {checks.map((c) => (
              <li key={c.id}>
                <Link to={`/history/${c.id}`} className={styles.row}>
                  <span className={styles.date}>{c.dateKey}</span>
                  <span
                    className={
                      c.hasIssues ? styles.tagBad : c.overallStatus === 'good' ? styles.tagOk : styles.tagMid
                    }
                  >
                    {statusText(c)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
