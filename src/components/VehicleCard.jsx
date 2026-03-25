import { vehicleDisplayEmoji } from '../utils/vehicleAvatar.js';
import styles from './VehicleCard.module.css';

function statusLabel(status, hasIssues) {
  if (!status) return 'No check yet';
  if (hasIssues || status === 'issue') return 'Issue reported';
  if (status === 'good') return 'All good';
  return 'In progress';
}

export function VehicleCard({ vehicle, onClick, asLink }) {
  const typeLabel = vehicle.type === 'forklift' ? 'Forklift' : 'Truck';
  const Wrapper = asLink ? 'div' : 'button';
  const wrapProps = asLink
    ? { className: styles.card, role: 'presentation' }
    : { type: 'button', className: styles.card, onClick };
  return (
    <Wrapper {...wrapProps}>
      <div className={styles.imageWrap}>
        {vehicle.imageUrl ? (
          <img src={vehicle.imageUrl} alt="" className={styles.img} />
        ) : (
          <div className={styles.placeholder} aria-hidden>
            {vehicleDisplayEmoji(vehicle)}
          </div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{vehicle.name}</div>
        <div className={styles.meta}>
          <span className={styles.badge}>{typeLabel}</span>
          <span className={styles.reg}>{vehicle.registrationId || '—'}</span>
        </div>
        <div className={styles.footer}>
          <span
            className={
              vehicle.lastCheckHasIssues
                ? styles.dotIssue
                : vehicle.lastCheckStatus
                  ? styles.dotOk
                  : styles.dotGrey
            }
          />
          <span className={styles.statusText}>
            {statusLabel(vehicle.lastCheckStatus, vehicle.lastCheckHasIssues)}
          </span>
          {vehicle.lastCheckDate ? (
            <span className={styles.date}>{vehicle.lastCheckDate}</span>
          ) : null}
        </div>
      </div>
    </Wrapper>
  );
}
