import styles from './AppShell.module.css';

export function AppShell({ children }) {
  return <div className={styles.shell}>{children}</div>;
}
