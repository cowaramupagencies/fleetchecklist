import { getShortWeekdayLabels, isTodayDateKey } from '../utils/dates.js';
import styles from './DayStatusRow.module.css';

export function DayStatusRow({ weekDayKeys, statusByDay, selectedDateKey, onSelectDay }) {
  const labels = getShortWeekdayLabels();
  return (
    <div className={styles.row}>
      {weekDayKeys.map((key, i) => {
        const st = statusByDay[key] || 'empty';
        const isSelected = key === selectedDateKey;
        const isToday = isTodayDateKey(key);
        return (
          <button
            key={key}
            type="button"
            className={[
              styles.dayBtn,
              st === 'good' && styles.good,
              st === 'issue' && styles.issue,
              st === 'empty' && styles.empty,
              isSelected && styles.selected,
              isToday && styles.today,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelectDay?.(key)}
            aria-label={`${labels[i]} ${key}`}
          >
            <span className={styles.circle} />
            <span className={styles.dow}>{labels[i]}</span>
            <span className={styles.num}>{key.slice(8)}</span>
          </button>
        );
      })}
    </div>
  );
}
