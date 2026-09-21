"use client";

import { useState } from "react";
import styles from "../../components/Showcase.module.css";

export default function LearningPage() {
  const [filter, setFilter] = useState("Toutes");
  const formations = [
    ["Spiritualité", "Grandir dans la foi", "Un parcours pour approfondir la prière, la parole de Dieu et la vie fraternelle.", "fa-book-bible"],
    ["Leadership", "Servir et conduire une équipe", "Des repères concrets pour exercer une responsabilité avec écoute et méthode.", "fa-people-group"],
    ["Vie ADS", "Les fondements du mouvement", "Histoire, valeurs et engagements qui rassemblent les jeunes leaders ADS.", "fa-flag"],
  ];
  const visible = filter === "Toutes" ? formations : formations.filter(([type]) => type === filter);
  return <main className={styles.page}>
    <section className={styles.hero}><p className={styles.eyebrow}><span /> Formations et apprentissage</p><h1>Apprendre pour<br /><em>mieux servir.</em></h1><p className={styles.lead}>Des formations, rapports, photos, vidéos et témoignages qui accompagnent le parcours de chaque jeune ADS.</p></section>
    <section className={styles.section}><div className={styles.filters}>{["Toutes", "Spiritualité", "Leadership", "Vie ADS"].map((type) => <button key={type} onClick={() => setFilter(type)} className={filter === type ? styles.selected : ""}>{type}</button>)}</div>{visible.map(([type,title,text,icon]) => <article className={styles.formation} key={title}><div className={styles.thumb}><i className={`fa-solid ${icon}`} /></div><div><small>{type} · Formation payante</small><h3>{title}</h3><p>{text}</p></div><a className={styles.button} target="_blank" rel="noreferrer" href={`https://wa.me/2290153513734?text=${encodeURIComponent(`Bonjour ADS, je souhaite obtenir la formation : ${title}.`)}`}>Obtenir <i className="fa-brands fa-whatsapp" /></a></article>)}</section>
    <section className={styles.sectionAlt}><div className={styles.heading}><h2>Ils partagent leur expérience</h2><p>Les avis et témoignages seront liés à chaque formation publiée.</p></div><div className={styles.cards}>{[["fa-quote-left", "Une formation utile", "J’ai découvert une autre façon de prendre ma place dans mon équipe."], ["fa-star", "Un parcours concret", "Les supports et les échanges nous aident à avancer chaque semaine."], ["fa-heart", "Grandir ensemble", "C’est un espace qui donne envie de servir avec plus de joie."]].map(([icon,title,text]) => <article className={styles.card} key={title}><i className={`fa-solid ${icon}`} /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  </main>;
  /*
  return (
    <ContentPage
      eyebrow="Formations et apprentissage"
      title="Apprendre pour"
      accent="mieux servir."
      intro="Retrouve les formations, documents pédagogiques et témoignages qui nourrissent le parcours des jeunes leaders ADS."
      sections={[
        {
          title: "Foi & spiritualité",
          text: "Des temps de formation pour approfondir sa foi et faire grandir son discernement.",
          icon: "fa-book-bible",
        },
        {
          title: "Leadership",
          text: "Des outils concrets pour prendre des responsabilités avec écoute, courage et méthode.",
          icon: "fa-graduation-cap",
        },
        {
          title: "Ressources",
          text: "Supports, comptes rendus et documents à consulter selon ton niveau ADS.",
          icon: "fa-file-lines",
        },
      ]}
    />
  ); */
}
