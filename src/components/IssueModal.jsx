import { useState } from 'react';
import styles from './IssueModal.module.css';

/**
 * Warns when an item is marked failed (issue). onSave receives { note }.
 * Checklist state remains "issue" in Firestore (existing fail state).
 */
export function IssueModal({ open, itemLabel, initialNote, onSave, onClose }) {
  const [note, setNote] = useState(initialNote || '');

  if (!open) return null;

  function handleSave() {
    onSave?.({ note: note.trim() });
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="issue-title">
      <div className={styles.panel}>
        <h2 id="issue-title" className={styles.title}>
          ⚠️ Issue Detected
        </h2>
        <p className={styles.warningBody}>
          This item has failed inspection. Please speak to management immediately before using this
          vehicle.
        </p>
        {itemLabel ? <p className={styles.itemName}>{itemLabel}</p> : null}

        <label className={styles.label} htmlFor="issue-note">
          Note (optional)
        </label>
        <textarea
          id="issue-note"
          className={styles.textarea}
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add details here…"
        />

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.primary} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
