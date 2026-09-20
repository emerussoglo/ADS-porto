import Link from "next/link";
import styles from "./ContentPage.module.css";

type Section = { title: string; text: string; icon: string };

export default function ContentPage({
  eyebrow,
  title,
  accent,
  intro,
  sections,
  action,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  sections: Section[];
  action?: { label: string; href: string };
}) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>
          <span /> {eyebrow}
        </p>
        <h1>
          {title}
          <br />
          <em>{accent}</em>
        </h1>
        <p className={styles.intro}>{intro}</p>
        {action && (
          <Link className={styles.button} href={action.href}>
            <i className="fa-solid fa-arrow-right" /> {action.label}
          </Link>
        )}
      </section>
      <section className={styles.grid}>
        {sections.map((section) => (
          <article className={styles.card} key={section.title}>
            <div className={styles.icon}>
              <i className={`fa-solid ${section.icon}`} />
            </div>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
            <span className={styles.arrow}>
              <i className="fa-solid fa-circle-info" />
            </span>
          </article>
        ))}
      </section>
    </main>
  );
}
