import styles from './ChecklistCategory.module.css';

export function ChecklistCategory({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.list}>{children}</div>
    </section>
  );
}
