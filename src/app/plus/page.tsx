"use client";

import { useEffect, useState } from "react";
import styles from "../../components/Showcase.module.css";

type Merit = {
  id: string;
  title: string;
  reason: string;
  distinction: string | null;
  imageUrl: string | null;
  memberName: string | null;
};

export default function PlusPage() {
  const [merits, setMerits] = useState<Merit[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadMerits() {
      try {
        const response = await fetch("/api/public/content", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les distinctions ADS.");
        const result = (await response.json()) as { merits: Merit[] };
        if (!cancelled) setMerits(result.merits);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      }
    }
    void loadMerits();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}><p className={styles.eyebrow}><span /> Notre rayonnement</p><h1>L&apos;ADS<br /><em>au-delà.</em></h1><p className={styles.lead}>Œuvres, créations, projets et distinctions : tout ce qui prolonge l&apos;engagement des jeunes leaders dans la société.</p></section>
      <section className={styles.section}><div className={styles.cards}>{[["fa-hands-holding-heart", "Nos œuvres", "Les actions caritatives et sociales menées avec les communautés."], ["fa-film", "Nos créations", "Musique, vidéo, art et productions portées par les talents ADS."], ["fa-diagram-project", "Nos projets", "Les projets en cours et ceux déjà réalisés par nos équipes."]].map(([icon,title,text]) => <article className={styles.card} key={title}><i className={`fa-solid ${icon}`} /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className={styles.sectionAlt}>
        <div className={styles.heading}><h2>Hall of Fame</h2><p>Parcours, services et distinctions publiés par l’administration ADS.</p></div>
        {error && <p className={styles.notice} role="alert">{error}</p>}
        {!error && merits.length === 0 && <p className={styles.notice}>Aucune distinction publique n’a encore été publiée.</p>}
        <div className={styles.people}>
          {merits.map((merit) => (
            <article className={styles.person} key={merit.id}>
              {merit.imageUrl ? (
                <div className={styles.avatar} style={{ backgroundImage: `url("${merit.imageUrl}")`} } />
              ) : (
                <div className={styles.avatar}><i className="fa-solid fa-award" /></div>
              )}
              <h3>{merit.title}</h3>
              {merit.distinction && <p>{merit.distinction}</p>}
              <small>{merit.reason}</small>
              {merit.memberName && <p>{merit.memberName}</p>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
