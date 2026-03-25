import { defaultEmojiForVehicleType } from '../utils/vehicleAvatar.js';
import styles from './EmojiPicker.module.css';

const PRESETS = ['🚛', '🚜', '🚚', '🚐', '🧰', '⛏️', '⚙️', '🛠️', '📦', '🚧', '🏗️', '🚤', '✈️'];

export function EmojiPicker({ id, value, onChange, type }) {
  const def = defaultEmojiForVehicleType(type);
  return (
    <div className={styles.wrap}>
      <p className={styles.hint} id={id ? `${id}-hint` : undefined}>
        Used when there’s no photo. Default for this type:{' '}
        <button type="button" className={styles.inline} onClick={() => onChange(def)}>
          {def}
        </button>
      </p>
      <div className={styles.grid} role="group" aria-label="Vehicle emoji">
        {PRESETS.map((e) => (
          <button
            key={e}
            type="button"
            className={value === e ? styles.cellActive : styles.cell}
            onClick={() => onChange(e)}
            aria-pressed={value === e}
          >
            <span className={styles.emoji}>{e}</span>
          </button>
        ))}
      </div>
      <button type="button" className={styles.clear} onClick={() => onChange('')}>
        Clear custom emoji
      </button>
    </div>
  );
}
