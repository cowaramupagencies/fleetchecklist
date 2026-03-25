import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { subscribeVehicles } from '../services/vehicles.js';
import { AppShell } from '../components/AppShell.jsx';
import { Header } from '../components/Header.jsx';
import { VehicleCard } from '../components/VehicleCard.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import styles from './Home.module.css';

export function HomePage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    const unsub = subscribeVehicles(
      user.uid,
      (list) => {
        setVehicles(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load vehicles');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  return (
    <AppShell>
      <Header
        title="Fleet Checklist"
        right={
          <Link to="/settings" className={styles.iconLink}>
            ⚙︎
          </Link>
        }
      />
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <Link to="/vehicles/new" className={styles.addBtn}>
            + Add vehicle
          </Link>
          <Link to="/history" className={styles.link}>
            History
          </Link>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        {loading ? <p className={styles.muted}>Loading vehicles…</p> : null}

        {!loading && !vehicles.length ? (
          <EmptyState
            title="No vehicles yet"
            description="Add your first truck or forklift to start daily inspections."
            action={
              <Link to="/vehicles/new" className={styles.addBtn}>
                Add vehicle
              </Link>
            }
          />
        ) : null}

        <div className={styles.list}>
          {vehicles.map((v) => (
            <div key={v.id} className={styles.cardRow}>
              <Link to={`/vehicles/${v.id}`} className={styles.cardLink}>
                <VehicleCard vehicle={v} asLink />
              </Link>
              <Link to={`/vehicles/${v.id}/edit`} className={styles.editLink} aria-label={`Edit ${v.name}`}>
                Edit
              </Link>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
