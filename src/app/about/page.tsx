"use client";

import { useEffect, useState } from "react";
import styles from "../../components/Showcase.module.css";

type Leader = {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  imageUrl: string | null;
  type: "founder" | "spiritual" | "variable";
};

export default function AboutPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadLeaders() {
      try {
        const response = await fetch("/api/public/content", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les responsables ADS.");
        const result = (await response.json()) as { leaders: Leader[] };
        if (!cancelled) setLeaders(result.leaders);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      }
    }
    void loadLeaders();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}><p className={styles.eyebrow}><span /> Notre histoire et nos valeurs</p><h1>Une fraternité<br /><em>qui fait grandir.</em></h1><p className={styles.lead}>ADS, Fraternité, Jeunes Leaders est un mouvement catholique de jeunesse du Diocèse de Porto-Novo, enraciné dans la foi, le service et l&apos;excellence chrétienne.</p></section>
      <section className={styles.section}><div className={styles.video}><div className={styles.videoFrame} role="img" aria-label="Jeunes et engagement du mouvement ADS" /><div className={styles.videoCopy}><h2>Découvrir le groupe ADS</h2><p>Un mouvement de jeunes enraciné dans la foi, la fraternité et le service du diocèse de Porto-Novo.</p></div></div></section>
      <section className={styles.sectionAlt}><div className={styles.heading}><h2>Notre mission</h2><p>Former des jeunes responsables, fraternels et capables de mettre leurs talents au service des autres.</p></div><div className={styles.cards}>{[["fa-cross","Foi vivante","Grandir dans une relation personnelle avec Dieu."],["fa-hand-holding-heart","Service","Agir concrètement pour sa communauté."],["fa-people-group","Union","Avancer ensemble dans une fraternité exigeante."]].map(([icon,title,text])=><article className={styles.card} key={title}><i className={`fa-solid ${icon}`} /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className={styles.section}>
        <div className={styles.heading}><h2>Les autorités du mouvement</h2><p>Les responsables affichés sont ceux publiés par l’administration ADS.</p></div>
        {error && <p className={styles.notice} role="alert">{error}</p>}
        {!error && leaders.length === 0 && <p className={styles.notice}>Les profils des responsables seront affichés dès leur publication.</p>}
        <div className={styles.people}>
          {leaders.map((leader) => (
            <article className={styles.person} key={leader.id}>
              {leader.imageUrl ? (
                <div className={styles.avatar} style={{ backgroundImage: `url("${leader.imageUrl}")` }} />
              ) : (
                <div className={styles.avatar}>{leader.name.slice(0, 1).toUpperCase()}</div>
              )}
              <h3>{leader.name}</h3>
              <p>{leader.title}</p>
              {leader.bio && <small>{leader.bio}</small>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
