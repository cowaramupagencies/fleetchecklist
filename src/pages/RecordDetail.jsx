import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getCheckById } from '../services/checks.js';
import { getVehicle } from '../services/vehicles.js';
import { AppShell } from '../components/AppShell.jsx';
import { Header } from '../components/Header.jsx';
import { ChecklistCategory } from '../components/ChecklistCategory.jsx';
import styles from './RecordDetail.module.css';

export function RecordDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [check, setCheck] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || !id) return;
      setLoading(true);
      try {
        const c = await getCheckById(id);
        if (cancelled) return;
        if (!c || c.createdBy !== user.uid) {
          setError('Record not found');
          setCheck(null);
          return;
        }
        setCheck(c);
        const v = await getVehicle(c.vehicleId);
        if (!cancelled) setVehicle(v);
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

  if (loading) {
    return (
      <AppShell>
        <Header title="Record" left={<Link to="/history">← History</Link>} />
        <p className={styles.pad}>Loading…</p>
      </AppShell>
    );
  }

  if (error || !check) {
    return (
      <AppShell>
        <Header title="Record" left={<Link to="/history">← History</Link>} />
        <p className={styles.pad}>{error || 'Not found'}</p>
      </AppShell>
    );
  }

  const byCat = {};
  for (const r of check.results || []) {
    const name = r.categoryName || 'General';
    if (!byCat[name]) byCat[name] = [];
    byCat[name].push(r);
  }

  return (
    <AppShell>
      <Header
        title="Inspection record"
        left={
          <Link to="/history" className={styles.back}>
            ← History
          </Link>
        }
      />
      <main className={styles.main}>
        <div className={styles.meta}>
          <h2 className={styles.vname}>{vehicle?.name || 'Vehicle'}</h2>
          <p className={styles.line}>
            {vehicle?.type === 'forklift' ? 'Forklift' : 'Truck'} ·{' '}
            {vehicle?.registrationId || '—'}
          </p>
          <p className={styles.date}>{check.dateKey}</p>
          <p className={styles.status}>
            Overall:{' '}
            <strong>
              {check.hasIssues ? 'Issue' : check.overallStatus === 'good' ? 'Good' : 'Partial'}
            </strong>
          </p>
        </div>

        {Object.entries(byCat).map(([catName, rows]) => (
          <ChecklistCategory key={catName} title={catName}>
            {rows.map((r) => (
              <div key={r.itemId} className={styles.item}>
                <div className={styles.itemTop}>
                  <span
                    className={
                      r.state === 'issue'
                        ? styles.dotBad
                        : r.state === 'good'
                          ? styles.dotOk
                          : styles.dotGrey
                    }
                  />
                  <span className={styles.itemLabel}>{r.itemLabel}</span>
                  <span className={styles.stateBadge}>{r.state}</span>
                </div>
                {r.note ? <p className={styles.note}>{r.note}</p> : null}
                {r.photoUrl ? (
                  <img src={r.photoUrl} alt="" className={styles.photo} />
                ) : null}
              </div>
            ))}
          </ChecklistCategory>
        ))}
      </main>
    </AppShell>
  );
}
