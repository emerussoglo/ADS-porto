"use client";
import { useState } from "react";
import styles from "../../components/AdminPanel.module.css";

export default function AdminPage() {
  const [tab, setTab] = useState("Vue d’ensemble");
  const [query, setQuery] = useState("");
  const sections = ["Vue d’ensemble", "Membres", "À propos", "Formations", "Agenda", "Hall of Fame", "Administrateurs"];
  const members = [["Afi K.", "ADS-2026-001", "Junior / Porto-Novo", "Actif"], ["Jean M.", "ADS-2026-014", "Senior / Saint Michel", "Actif"], ["Sarah D.", "ADS-2026-021", "Aspirant / Porto-Novo", "À vérifier"]].filter((m) => m.join(" ").toLowerCase().includes(query.toLowerCase()));
  return <main className={styles.page}><div className={styles.top}><div><h1>Administration ADS</h1><p>Gérez les contenus, les membres et les accès selon les responsabilités de chacun.</p></div></div><div className={styles.layout}><nav className={styles.nav}>{sections.map((section) => <button onClick={() => setTab(section)} className={tab === section ? styles.active : ""} key={section}><i className="fa-solid fa-chevron-right" /> {section}</button>)}</nav><section><div className={styles.intro}><h2>{tab}</h2><p>{tab === "Vue d’ensemble" ? "Bienvenue. Cette interface regroupe les espaces de publication et de suivi du mouvement." : `Gérez les éléments liés à la rubrique « ${tab} ». Les données seront enregistrées dans la base ADS lors de la prochaine étape.`}</p><div className={styles.actions}><button className={styles.primary}><i className="fa-solid fa-plus" /> Ajouter</button><button className={styles.secondary}><i className="fa-solid fa-file-arrow-up" /> Déposer un fichier</button></div>{tab === "Membres" && <input className={styles.search} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par nom, prénom, identifiant ou numéro personnel" />}{tab === "Administrateurs" && <p className={styles.warning}><i className="fa-solid fa-shield-halved" /> À connecter au futur système de rôles : jusqu&apos;à trois administrateurs principaux, puis des accès limités par rubrique.</p>}</div><div className={styles.table}>{(tab === "Membres" ? members : [[tab === "À propos" ? "Présentation du mouvement" : `Contenu ${tab}`, "Dernière mise à jour", "Administration ADS", "Brouillon"], ["Élément publié", "À planifier", "Responsable ADS", "Actif"]]).map(([name,detail,owner,status]) => <div className={styles.row} key={name}><div><strong>{name}</strong><small>{detail}</small></div><small>{owner}</small><small>Gestionnaire de rubrique</small><span className={styles.badge}>{status}</span></div>)}</div></section></div></main>;
  /*
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
  ); */
}
