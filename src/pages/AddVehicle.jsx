import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { createVehicle } from '../services/vehicles.js';
import { buildEmbeddedChecklistTemplateForType } from '../utils/vehicleTemplate.js';
import { AppShell } from '../components/AppShell.jsx';
import { Header } from '../components/Header.jsx';
import { EmojiPicker } from '../components/EmojiPicker.jsx';
import styles from './AddVehicle.module.css';

export function AddVehiclePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('truck');
  const [registrationId, setRegistrationId] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [emoji, setEmoji] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Vehicle name is required.');
      return;
    }
    if (!user) return;
    setBusy(true);
    try {
      const checklistTemplate = await buildEmbeddedChecklistTemplateForType(user.uid, type);
      const emojiTrim = emoji.trim();
      const id = await createVehicle(user.uid, {
        name: name.trim(),
        type,
        registrationId: registrationId.trim(),
        notes: notes.trim(),
        imageUrl: imageUrl.trim(),
        ...(emojiTrim ? { emoji: emojiTrim } : {}),
        checklistTemplate,
      });
      navigate(`/vehicles/${id}`);
    } catch (err) {
      setError(err.message || 'Could not save vehicle');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <Header
        title="Add vehicle"
        left={
          <Link to="/" className={styles.back}>
            ← Back
          </Link>
        }
      />
      <main className={styles.main}>
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label} htmlFor="vname">
            Vehicle name
          </label>
          <input
            id="vname"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className={styles.label} htmlFor="vtype">
            Type
          </label>
          <select
            id="vtype"
            className={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="truck">Truck</option>
            <option value="forklift">Forklift</option>
          </select>

          <label className={styles.label} htmlFor="vreg">
            Registration / ID
          </label>
          <input
            id="vreg"
            className={styles.input}
            value={registrationId}
            onChange={(e) => setRegistrationId(e.target.value)}
          />

          <label className={styles.label} htmlFor="vnotes">
            Notes
          </label>
          <textarea
            id="vnotes"
            className={styles.textarea}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <label className={styles.label} htmlFor="vimgurl">
            Image URL (optional)
          </label>
          <input
            id="vimgurl"
            type="url"
            className={styles.input}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
            inputMode="url"
          />

          <span className={styles.label} id="vemoji-label">
            Emoji (optional)
          </span>
          <EmojiPicker id="vemoji" value={emoji} onChange={setEmoji} type={type} />

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.save} disabled={busy}>
            Save vehicle
          </button>
        </form>
      </main>
    </AppShell>
  );
}
