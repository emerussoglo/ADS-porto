"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./SiteChrome.module.css";

const links = [
  ["Accueil", "/", "fa-house"],
  ["À propos", "/about", "fa-circle-info"],
  ["Espace privé", "/espace-prive", "fa-shield-halved"],
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
  const pathname = usePathname();
  const isAppArea = pathname.startsWith("/espace-prive") || pathname.startsWith("/admin");

  if (isAppArea || pathname === "/login") return <>{children}</>;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <Image
            className={styles.brandLogo}
            src="/img/logo.jpeg"
            alt="Logo ADS"
            width={42}
            height={42}
            priority
          />
          <span>
            <strong>ADS</strong>
            <small>Fraternité, Jeunes Leaders</small>
          </span>
        </Link>
        <nav className={`${styles.nav} ${open ? styles.open : ""}`}>
          {links.filter(([, href]) => href !== "/espace-prive").map(([label, href, icon]) => (
            <Link
              href={href}
              key={href}
              className={pathname === href ? styles.active : ""}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
              {label}
            </Link>
          ))}
          <Link
            href="/inscription"
            className={styles.join}
            onClick={() => setOpen(false)}
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" /> S&apos;inscrire
          </Link>
          <Link
            href="/login"
            className={`${styles.mobileMember} ${pathname.startsWith("/espace-prive") ? styles.active : ""}`}
            onClick={() => setOpen(false)}
          >
            <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Espace Privé
          </Link>
        </nav>
        <div className={styles.actions}>
          <Link
            href="/login"
            className={`${styles.login} ${styles.desktopMember} ${pathname.startsWith("/espace-prive") ? styles.active : ""}`}
          >
            <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Espace Privé
          </Link>
          <button
            className={styles.menu}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </header>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image
            className={styles.brandLogo}
            src="/img/logo.jpeg"
            alt="Logo ADS"
            width={42}
            height={42}
          />
          <div>
            <strong>ADS</strong>
            <small>Fraternité, Jeunes Leaders</small>
          </div>
        </div>
        <div className={styles.footerLinks}>
          <h2>Navigation</h2>
          {links.filter(([, href]) => href !== "/espace-prive").map(([label, href, icon]) => (
            <Link href={href} key={href}>
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
        <div className={styles.socials}>
          <h2>Contact</h2>
          <Link href="/#contact">
            <i className="fa-solid fa-envelope" /> Écrire à l’administration
          </Link>
          <a href="https://maps.google.com/?q=Porto-Novo,+Benin">
            <i className="fa-solid fa-location-dot" /> Diocèse de Porto-Novo, Bénin
          </a>
        </div>
        <div className={styles.socials}>
          <h2>Liens utiles</h2>
          <Link href="/login">Connexion</Link>
          <Link href="/inscription">Adhérer au mouvement</Link>
          <Link href="/admin">Administration</Link>
        </div>
        <p>© {new Date().getFullYear()} ADS, Fraternité, Jeunes Leaders — Diocèse de Porto-Novo. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
