import styles from './WeekNavigator.module.css';

export function WeekNavigator({ label, onPrev, onNext }) {
  return (
    <div className={styles.bar}>
      <button type="button" className={styles.arrow} onClick={onPrev} aria-label="Previous week">
        ‹
      </button>
      <div className={styles.label}>{label}</div>
      <button type="button" className={styles.arrow} onClick={onNext} aria-label="Next week">
        ›
      </button>
    </div>
  );
}
