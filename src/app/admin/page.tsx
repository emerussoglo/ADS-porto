import Link from "next/link";
import styles from "../../components/ContentPage.module.css";

export default function AdminPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>
          <span /> Administration ADS
        </p>
        <h1>
          Piloter le
          <br />
          <em>mouvement.</em>
        </h1>
        <p className={styles.intro}>
          Le panneau d&apos;administration permettra de gérer les membres,
          inscriptions, formations, événements, contenus et messages ADS.
        </p>
      </section>
      <section className={styles.grid}>
        {[
          {
            title: "Membres",
            text: "Suivre les profils, niveaux et cartes des jeunes.",
            icon: "fa-users",
          },
          {
            title: "Contenus",
            text: "Publier formations, agenda, documents et productions.",
            icon: "fa-layer-group",
          },
          {
            title: "Messages",
            text: "Communiquer avec les membres et gérer les demandes.",
            icon: "fa-paper-plane",
          },
        ].map((item) => (
          <article className={styles.card} key={item.title}>
            <div className={styles.icon}>
              <i className={`fa-solid ${item.icon}`} />
            </div>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <span className={styles.arrow}>
              <i className="fa-solid fa-circle-info" />
            </span>
          </article>
        ))}
      </section>
      <div style={{ padding: "0 8vw 90px" }}>
        <Link className={styles.button} href="/">
          Retour au site
        </Link>
      </div>
    </main>
  );
}
