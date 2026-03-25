import styles from './Header.module.css';

export function Header({ title, left, right, subtitle, showBrand = true }) {
  return (
    <header className={styles.header}>
      {showBrand ? (
        <div className={styles.brandRow}>
          <img
            src="/cowag-logo.png"
            alt="Cowaramup Agencies"
            className={styles.logo}
            onError={(e) => {
              const el = e.currentTarget;
              el.onerror = null;
              if (!el.src.endsWith('cowag-logo.svg')) {
                el.src = '/cowag-logo.svg';
              }
            }}
          />
        </div>
      ) : null}
      <div className={styles.row}>
        <div className={styles.left}>{left}</div>
        <div className={styles.center}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className={styles.right}>{right}</div>
      </div>
    </header>
  );
}
