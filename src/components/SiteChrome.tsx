"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./SiteChrome.module.css";

const links = [
  ["Accueil", "/", "fa-house"],
  ["À propos", "/about", "fa-circle-info"],
  ["Formations", "/learning", "fa-graduation-cap"],
  ["Agenda", "/agenda", "fa-calendar-days"],
  ["Plus", "/plus", "fa-star"],
];

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <span className={styles.mark}>ADS</span>
          <span>
            <strong>ADS</strong>
            <small>Fraternité, Jeunes Leaders</small>
          </span>
        </Link>
        <nav className={`${styles.nav} ${open ? styles.open : ""}`}>
          {links.map(([label, href, icon]) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
              {label}
            </Link>
          ))}
          <Link
            href="/inscription"
            className={styles.join}
            onClick={() => setOpen(false)}
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" /> Rejoindre
            ADS
          </Link>
          <Link
            href="/login"
            className={styles.mobileMember}
            onClick={() => setOpen(false)}
          >
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />{" "}
            Espace membre
          </Link>
        </nav>
        <div className={styles.actions}>
          <Link
            href="/login"
            className={`${styles.login} ${styles.desktopMember}`}
          >
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />{" "}
            Espace membre
          </Link>
          <button
            className={styles.menu}
            onClick={() => setOpen(!open)}
            aria-label="Ouvrir le menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </header>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.mark}>ADS</span>
          <div>
            <strong>ADS</strong>
            <small>Fraternité, Jeunes Leaders</small>
          </div>
        </div>
        <div className={styles.footerLinks}>
          {links.slice(1).map(([label, href, icon]) => (
            <Link href={href} key={href}>
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
        <div className={styles.socials}>
          <a href="mailto:edahbriand1@gmail.com">
            <i className="fa-solid fa-envelope" /> Email
          </a>
          <a href="https://wa.me/2290153513734">
            <i className="fa-brands fa-whatsapp" /> WhatsApp
          </a>
          <a href="tel:+2290153513734">
            <i className="fa-solid fa-phone" /> 01 53 51 37 34
          </a>
        </div>
        <p>© 2026 ADS · Porto-Novo, Bénin</p>
      </footer>
    </div>
  );
}
