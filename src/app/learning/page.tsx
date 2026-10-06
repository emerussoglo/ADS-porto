"use client";

import { useEffect, useState } from "react";
import styles from "../../components/Showcase.module.css";

type Training = {
  id: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  videoUrl: string | null;
  priceCfa: number;
  whatsappUrl: string | null;
};

export default function LearningPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTrainings() {
      try {
        const response = await fetch("/api/trainings", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Impossible de charger les formations publiées.");
        }
        const result = (await response.json()) as { trainings: Training[] };
        if (!cancelled) setTrainings(result.trainings);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Une erreur est survenue.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTrainings();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>
          <span /> Formations et apprentissage
        </p>
        <h1>
          Apprendre pour
          <br />
          <em>mieux servir.</em>
        </h1>
        <p className={styles.lead}>
          Des formations, rapports, photos, vidéos et témoignages qui
          accompagnent le parcours de chaque jeune ADS.
        </p>
      </section>
      <section className={styles.section}>
        {loading && <p className={styles.notice}>Chargement des formations…</p>}
        {error && (
          <p className={styles.notice} role="alert">
            {error}
          </p>
        )}
        {!loading && !error && trainings.length === 0 && (
          <p className={styles.notice}>
            Aucune formation n’est publiée pour le moment. Les prochaines
            formations apparaîtront ici.
          </p>
        )}
        {trainings.map((training) => {
          const contactUrl =
            training.whatsappUrl ||
            `https://wa.me/2290153513734?text=${encodeURIComponent(
              `Bonjour ADS, je souhaite obtenir la formation : ${training.title}.`,
            )}`;
          return (
            <article className={styles.formation} key={training.id}>
              <div
                className={styles.thumb}
                style={{
                  backgroundImage: `linear-gradient(135deg, #d75d48bb, #e8bd62bb), url("${training.coverUrl || "/img/hero-1.jpg"}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-hidden="true"
              >
                <i className="fa-solid fa-graduation-cap" />
              </div>
              <div>
                <small>
                  {training.priceCfa
                    ? `${training.priceCfa.toLocaleString("fr-FR")} FCFA`
                    : "Gratuit"}
                </small>
                <h3>{training.title}</h3>
                <p>{training.summary}</p>
                {training.videoUrl && (
                  <video
                    controls
                    preload="metadata"
                    style={{
                      display: "block",
                      width: "min(100%, 520px)",
                      maxHeight: 320,
                      marginTop: 14,
                      borderRadius: 10,
                      background: "#102d2b",
                    }}
                  >
                    <source src={training.videoUrl} />
                    Votre navigateur ne peut pas lire cette vidéo.
                  </video>
                )}
              </div>
              <a
                className={styles.button}
                target="_blank"
                rel="noreferrer"
                href={contactUrl}
              >
                Obtenir <i className="fa-brands fa-whatsapp" />
              </a>
            </article>
          );
        })}
      </section>
      <section className={styles.sectionAlt}>
        <div className={styles.heading}>
          <h2>Ils partagent leur expérience</h2>
          <p>Les avis et témoignages seront liés à chaque formation publiée.</p>
        </div>
        <div className={styles.cards}>
          {[
            ["fa-quote-left", "Une formation utile", "Des repères pour prendre sa place dans son équipe."],
            ["fa-star", "Un parcours concret", "Des supports et des échanges pour avancer."],
            ["fa-heart", "Grandir ensemble", "Servir avec plus de joie et de confiance."],
          ].map(([icon, title, text]) => (
            <article className={styles.card} key={title}>
              <i className={`fa-solid ${icon}`} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
