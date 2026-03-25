import { getShortWeekdayLabels, isTodayDateKey } from '../utils/dates.js';
import styles from './MonthCheckCalendar.module.css';

const dowLabels = getShortWeekdayLabels();

/**
 * @param {Record<string, 'empty' | 'good' | 'issue'>} statusByDateKey
 */
export function MonthCheckCalendar({
  monthTitle,
  cells,
  statusByDateKey,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}) {
  return (
    <section className={styles.wrap} aria-label="Inspection calendar">
      <div className={styles.toolbar}>
        <button type="button" className={styles.arrow} onClick={onPrevMonth} aria-label="Previous month">
          ‹
        </button>
        <h2 className={styles.monthTitle}>{monthTitle}</h2>
        <button type="button" className={styles.arrow} onClick={onNextMonth} aria-label="Next month">
          ›
        </button>
      </div>
      <p className={styles.hint}>
        Green = inspection saved with no issues. Red = issue noted. Grey = no check that day — skipped days are
        fine.
      </p>
      <div className={styles.grid}>
        {dowLabels.map((d) => (
          <div key={d} className={styles.dow}>
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`pad-${i}`} className={styles.cellPad} />;
          }
          const st = statusByDateKey[cell.dateKey] || 'empty';
          const today = isTodayDateKey(cell.dateKey);
          return (
            <button
              key={cell.dateKey}
              type="button"
              className={[
                styles.day,
                st === 'good' && styles.dayGood,
                st === 'issue' && styles.dayIssue,
                st === 'empty' && styles.dayEmpty,
                today && styles.dayToday,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectDay?.(cell.dateKey)}
            >
              {cell.dayOfMonth}
            </button>
          );
        })}
      </div>
    </section>
  );
}
