import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteField } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth.js';
import { getVehicle, updateVehicle } from '../services/vehicles.js';
import { buildEmbeddedChecklistTemplateForType } from '../utils/vehicleTemplate.js';
import { AppShell } from '../components/AppShell.jsx';
import { Header } from '../components/Header.jsx';
import { EmojiPicker } from '../components/EmojiPicker.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import styles from './AddVehicle.module.css';

export function VehicleEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState('truck');
  const [registrationId, setRegistrationId] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [emoji, setEmoji] = useState('');
  const [initialType, setInitialType] = useState('truck');
  const [vehicleLoaded, setVehicleLoaded] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || !id) return;
      setLoading(true);
      setError('');
      setVehicleLoaded(false);
      try {
        const v = await getVehicle(id);
        if (cancelled) return;
        if (!v || v.createdBy !== user.uid) {
          setError('Vehicle not found');
        } else {
          setName(v.name || '');
          setType(v.type === 'forklift' ? 'forklift' : 'truck');
          setInitialType(v.type === 'forklift' ? 'forklift' : 'truck');
          setRegistrationId(v.registrationId || '');
          setNotes(v.notes || '');
          setImageUrl(v.imageUrl || '');
          setEmoji(typeof v.emoji === 'string' ? v.emoji : '');
          setVehicleLoaded(true);
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

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Vehicle name is required.');
      return;
    }
    if (!user || !id) return;
    setBusy(true);
    try {
      const nextType = type;
      const patch = {
        name: name.trim(),
        type: nextType,
        registrationId: registrationId.trim(),
        notes: notes.trim(),
        imageUrl: imageUrl.trim() ? imageUrl.trim() : deleteField(),
        emoji: emoji.trim() ? emoji.trim() : deleteField(),
      };
      if (nextType !== initialType) {
        patch.checklistTemplate = buildEmbeddedChecklistTemplateForType(nextType);
      }
      await updateVehicle(id, patch);
      navigate(`/vehicles/${id}`);
    } catch (err) {
      setError(err.message || 'Could not save changes');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <Header title="Edit vehicle" left={<Link to={id ? `/vehicles/${id}` : '/'}>← Back</Link>} />
        <p className={styles.error} style={{ margin: '16px', color: 'var(--color-text-muted)' }}>
          Loading…
        </p>
      </AppShell>
    );
  }

  if (!loading && !vehicleLoaded) {
    return (
      <AppShell>
        <Header title="Edit vehicle" left={<Link to="/">← Home</Link>} />
        <EmptyState
          title="Could not open vehicle"
          description={error || 'This vehicle does not exist or you don’t have access.'}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title="Edit vehicle"
        left={
          <Link to={`/vehicles/${id}`} className={styles.back}>
            ← Back
          </Link>
        }
      />
      <main className={styles.main}>
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label} htmlFor="evname">
            Vehicle name
          </label>
          <input
            id="evname"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className={styles.label} htmlFor="evtype">
            Type
          </label>
          <select
            id="evtype"
            className={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="truck">Truck</option>
            <option value="forklift">Forklift</option>
          </select>

          <label className={styles.label} htmlFor="evreg">
            Registration / ID
          </label>
          <input
            id="evreg"
            className={styles.input}
            value={registrationId}
            onChange={(e) => setRegistrationId(e.target.value)}
          />

          <label className={styles.label} htmlFor="evnotes">
            Notes
          </label>
          <textarea
            id="evnotes"
            className={styles.textarea}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <label className={styles.label} htmlFor="evimgurl">
            Image URL (optional)
          </label>
          <input
            id="evimgurl"
            type="url"
            className={styles.input}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
            inputMode="url"
          />

          <span className={styles.label} id="evemoji-label">
            Emoji (optional)
          </span>
          <EmojiPicker id="evemoji" value={emoji} onChange={setEmoji} type={type} />

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.save} disabled={busy}>
            Save changes
          </button>
        </form>
      </main>
    </AppShell>
  );
}
