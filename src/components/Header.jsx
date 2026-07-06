import styles from './Header.module.css';

const LOGO_SRC = `${import.meta.env.BASE_URL}cowag-logo.png`;

export function Header({ title, left, right, subtitle, showBrand = true }) {
  return (
    <header className={styles.header}>
      {showBrand ? (
        <div className={styles.brandRow}>
          <img src={LOGO_SRC} alt="Cowaramup Agencies" className={styles.logo} />
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
