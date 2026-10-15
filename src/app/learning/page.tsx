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

type Testimonial = {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  trainingTitle: string;
};

export default function LearningPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTrainings() {
      try {
        const [response, contentResponse] = await Promise.all([
          fetch("/api/trainings", { cache: "no-store" }),
          fetch("/api/public/content", { cache: "no-store" }),
        ]);
        if (!response.ok || !contentResponse.ok) {
          throw new Error("Impossible de charger les contenus de formation.");
        }
        const [result, content] = await Promise.all([
          response.json() as Promise<{ trainings: Training[] }>,
          contentResponse.json() as Promise<{ testimonials: Testimonial[] }>,
        ]);
        if (!cancelled) {
          setTrainings(result.trainings);
          setTestimonials(content.testimonials);
        }
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
          const contactUrl = training.whatsappUrl || "/#contact";
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
                target={training.whatsappUrl ? "_blank" : undefined}
                rel={training.whatsappUrl ? "noreferrer" : undefined}
                href={contactUrl}
              >
                {training.whatsappUrl ? "Obtenir via WhatsApp" : "Demander les informations"}
                {training.whatsappUrl && <i className="fa-brands fa-whatsapp" />}
              </a>
            </article>
          );
        })}
      </section>
      <section className={styles.sectionAlt}>
        <div className={styles.heading}>
          <h2>Ils partagent leur expérience</h2>
          <p>Les témoignages vérifiés associés aux formations publiées.</p>
        </div>
        {testimonials.length > 0 ? (
          <div className={styles.cards}>
            {testimonials.map((item) => (
              <article className={styles.card} key={item.id}>
                <div aria-label={`${item.rating} étoiles`}>
                  {Array.from({ length: Math.min(5, Math.max(0, item.rating)) }, (_, index) => (
                    <i className="fa-solid fa-star" key={index} />
                  ))}
                </div>
                <h3>{item.authorName}</h3>
                <p>« {item.content} »</p>
                <small>{item.trainingTitle}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.notice}>Aucun témoignage n’a encore été publié.</p>
        )}
      </section>
    </main>
  );
}
