"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./PrivateSpace.module.css";

const tabs = [
  ["dashboard", "Tableau de bord", "fa-gauge-high"],
  ["profile", "Mon profil", "fa-user"],
  ["formations", "Mes formations", "fa-graduation-cap"],
  ["activities", "Mes activités", "fa-calendar-check"],
  ["evaluations", "Mes évaluations", "fa-clipboard-list"],
  ["documents", "Mes documents", "fa-file-lines"],
  ["messages", "Messages admin", "fa-envelope"],
  ["merits", "Mes mérites", "fa-medal"],
];

export default function PrivateSpacePage() {
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = tabs.find(([id]) => id === active) ?? tabs[0];
  const changeTab = (id: string) => {
    setActive(id);
    setMenuOpen(false);
  };

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sideBrand}>
          <span className={styles.mark}>ADS</span>
          <div>
            <strong>Espace membre</strong>
            <small>Service · Union · Vie exemplaire</small>
          </div>
          <button
            className={styles.mobileMenu}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Ouvrir le menu"
          >
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
        <div className={styles.profile}>
          <span className={styles.avatar}>A</span>
          <div>
            <strong>Admin</strong>
            <small>Identifiant ADS vérifié</small>
          </div>
        </div>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          {tabs.map(([id, label, icon]) => (
            <button
              key={id}
              className={active === id ? styles.active : ""}
              onClick={() => changeTab(id)}
            >
              <i className={`fa-solid ${icon}`} /> {label}
            </button>
          ))}
        </nav>
        <div className={styles.sideBottom}>
          <Link href="/">
            <i className="fa-solid fa-house" /> Retour au site
          </Link>
          <button
            onClick={() => {
              document.cookie = "user_session=; Max-Age=0; path=/";
              window.location.href = "/login";
            }}
          >
            <i className="fa-solid fa-right-from-bracket" /> Déconnexion
          </button>
        </div>
      </aside>
      <section className={styles.content}>
        <header className={styles.top}>
          <div>
            <h1>{current[1]}</h1>
            <p>Ton espace personnel ADS</p>
          </div>
          <span className={styles.status}>
            <i className="fa-solid fa-circle-check" /> Session active
          </span>
        </header>
        {active === "dashboard" && (
          <>
            <section className={styles.welcome}>
              <div>
                <h2>Bienvenue, Admin</h2>
                <p>
                  Retrouve ici tout ton parcours et les actualités de la famille
                  ADS.
                </p>
              </div>
              <i className="fa-solid fa-star" />
            </section>
            <div className={styles.stats}>
              {[
                ["fa-calendar-check", "12", "Activités"],
                ["fa-graduation-cap", "08", "Formations"],
                ["fa-medal", "05", "Mérites"],
                ["fa-envelope", "02", "Messages"],
              ].map(([icon, value, label]) => (
                <article className={styles.stat} key={label}>
                  <i className={`fa-solid ${icon}`} />
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
            <div className={styles.overview}>
              <article className={styles.memberCard}>
                <small>Carte membre officielle</small>
                <h2>ADS · Admin</h2>
                <p>Junior / Noyau · Porto-Novo</p>
                <span className={styles.memberId}>ADS-2026-001</span>
              </article>
              <article className={styles.panel}>
                <h3>Prochain rendez-vous</h3>
                <div className={styles.list}>
                  <div className={styles.row}>
                    <div>
                      <strong>Leadership & service</strong>
                      <small>02 novembre · Maison ADS</small>
                    </div>
                    <span className={styles.tag}>À venir</span>
                  </div>
                  <div className={styles.row}>
                    <div>
                      <strong>Journée des jeunes leaders</strong>
                      <small>16 novembre · Diocèse</small>
                    </div>
                    <span className={styles.tag}>À venir</span>
                  </div>
                </div>
              </article>
            </div>
          </>
        )}
        {active === "profile" && (
          <article className={styles.panel}>
            <h3>Informations personnelles</h3>
            <div className={styles.list}>
              <div className={styles.row}>
                <div>
                  <small>Nom complet</small>
                  <strong>Administrateur ADS</strong>
                </div>
              </div>
              <div className={styles.row}>
                <div>
                  <small>Identifiant</small>
                  <strong>Admin</strong>
                </div>
              </div>
              <div className={styles.row}>
                <div>
                  <small>Contact</small>
                  <strong>01 53 51 37 34</strong>
                </div>
              </div>
              <div className={styles.row}>
                <div>
                  <small>Email</small>
                  <strong>edahbriand1@gmail.com</strong>
                </div>
              </div>
            </div>
          </article>
        )}
        {active !== "dashboard" && active !== "profile" && (
          <article className={styles.panel}>
            <h3>{current[1]}</h3>
            <p className={styles.empty}>
              <i className="fa-solid fa-circle-info" /> Cette rubrique est prête
              à recevoir tes données ADS. Les éléments seront alimentés par
              l’administration.
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
