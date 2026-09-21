"use client";
import { useState } from "react";
import styles from "../../components/Showcase.module.css";

export default function AgendaPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const events = [["18", "Oct", "Veillée de prière", "Paroisse Saint Michel · 19 h 00", "Public"], ["02", "Nov", "Formation Leadership", "Maison ADS, Porto-Novo · 09 h 00", "Membres ADS"], ["16", "Nov", "Journée des jeunes leaders", "Diocèse de Porto-Novo · 08 h 30", "Public"]];
  return <main className={styles.page}>
    <section className={styles.hero}><p className={styles.eyebrow}><span /> Événements et activités</p><h1>Les prochains<br /><em>rendez-vous.</em></h1><p className={styles.lead}>Retrouve les formations, célébrations, activités sociales et temps forts qui font vivre la fraternité ADS.</p></section>
    <section className={styles.section}><div className={styles.filters}><button className={view === "list" ? styles.selected : ""} onClick={() => setView("list")}><i className="fa-solid fa-list" /> Vue liste</button><button className={view === "calendar" ? styles.selected : ""} onClick={() => setView("calendar")}><i className="fa-solid fa-calendar-days" /> Calendrier</button></div>{view === "list" ? events.map(([day,month,title,place,audience]) => <article className={styles.event} key={title}><div className={styles.date}><strong>{day}</strong>{month}</div><div><h3>{title}</h3><p><i className="fa-solid fa-location-dot" /> {place}</p></div><span className={styles.tag}>{audience}</span></article>) : <div className={styles.calendar}><div className={styles.heading}><h2>Novembre</h2><p>Sélectionne une date colorée pour voir son aperçu.</p></div><div className={styles.days}>{[...Array(30)].map((_, i) => <div className={`${styles.day} ${[2,16].includes(i + 1) ? styles.dayActive : ""}`} key={i}>{i + 1}{[2,16].includes(i + 1) && <span className={styles.dot} />}</div>)}</div></div>}</section>
    <section className={styles.sectionAlt}><p className={styles.notice}><i className="fa-solid fa-lock" /> Certaines activités peuvent être réservées à un groupe de membres. Leur visibilité est décidée lors de la publication par l&apos;administration.</p></section>
  </main>;
  /*
  return (
    <ContentPage
      eyebrow="Événements et activités"
      title="Les prochains"
      accent="rendez-vous."
      intro="Formations, réunions, célébrations et activités pastorales : retrouve ici les moments qui font vivre la fraternité ADS."
      action={{ label: "Proposer une activité", href: "/about#contact" }}
      sections={[
        {
          title: "18 octobre · Veillée",
          text: "Paroisse Saint Michel · Une soirée de prière et de fraternité.",
          icon: "fa-moon",
        },
        {
          title: "02 novembre · Formation",
          text: "Maison ADS, Porto-Novo · Leadership et service communautaire.",
          icon: "fa-calendar-days",
        },
        {
          title: "16 novembre · Journée ADS",
          text: "Diocèse de Porto-Novo · Une journée pour se retrouver et célébrer.",
          icon: "fa-people-group",
        },
      ]}
    />
  ); */
}
