import styles from './ChecklistItemRow.module.css';

export function ChecklistItemRow({ label, state, hasAttachment, onTap }) {
  return (
    <button type="button" className={styles.row} onClick={onTap}>
      <span
        className={[
          styles.stateIcon,
          state === 'good' && styles.good,
          state === 'issue' && styles.issue,
          state === 'unchecked' && styles.unchecked,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden
      />
      <span className={styles.label}>{label}</span>
      {hasAttachment ? <span className={styles.clip}>📎</span> : null}
    </button>
  );
}
