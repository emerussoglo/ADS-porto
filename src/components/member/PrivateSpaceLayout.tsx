"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { MemberContext, MemberData, MemberNotification } from "./MemberContext";
import styles from "../../app/espace-prive/PrivateSpace.module.css";

const tabs = [
  ["dashboard", "Tableau de bord", "fa-gauge-high", "/espace-prive"],
  ["profil", "Mon profil", "fa-user", "/espace-prive/profil"],
  ["formations", "Mes formations", "fa-graduation-cap", "/espace-prive/formations"],
  ["activites", "Mes activités", "fa-calendar-check", "/espace-prive/activites"],
  ["evaluations", "Mes évaluations", "fa-clipboard-list", "/espace-prive/evaluations"],
  ["documents", "Mes documents", "fa-file-lines", "/espace-prive/documents"],
  ["messages", "Messages admin", "fa-envelope", "/espace-prive/messages"],
  ["merites", "Mes mérites", "fa-medal", "/espace-prive/merites"],
  ["sanctions", "Mes sanctions", "fa-scale-balanced", "/espace-prive/sanctions"],
] as const;

export default function PrivateSpaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [member, setMember] = useState<MemberData | null>(null);
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const [memberResponse, notificationsResponse] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/auth/notifications", { cache: "no-store" }),
        ]);
        if (memberResponse.status === 401) {
          window.location.assign("/login?redirect=/espace-prive");
          return;
        }
        if (!memberResponse.ok) {
          throw new Error("Impossible de charger les informations du compte.");
        }
        if (!notificationsResponse.ok) {
          throw new Error("Impossible de charger les notifications.");
        }

        const memberData = (await memberResponse.json()) as MemberData;
        const notificationData = (await notificationsResponse.json()) as {
          messages: MemberNotification[];
        };
        if (!cancelled) {
          setMember(memberData);
          setNotifications(notificationData.messages);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors du chargement.",
          );
        }
      }
    }

    void loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const section = pathname.split("/").filter(Boolean)[1] ?? "dashboard";
  const currentTab = tabs.find(([id]) => id === section) ?? tabs[0];
  const initials =
    `${member?.firstName?.[0] ?? ""}${member?.lastName?.[0] ?? ""}`
      .trim()
      .toUpperCase() || "ADS";

  if (!member) {
    return (
      <main className={styles.dashboard}>
        <section className={styles.content}>
          <article className={styles.panel}>
            <h3>{loadError || "Chargement de ton espace ADS..."}</h3>
          </article>
        </section>
      </main>
    );
  }

  return (
    <MemberContext.Provider value={{ member, setMember, notifications }}>
      <main className={styles.dashboard}>
        <aside className={styles.sidebar}>
          <div className={styles.sideBrand}>
            <span className={styles.mark} aria-label="ADS">ADS</span>
            <div>
              <strong>Espace membre</strong>
              <small>Service · Union · Vie exemplaire</small>
            </div>
            <button
              className={styles.mobileMenu}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="member-navigation"
            >
              <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} />
            </button>
          </div>
          <div
            className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}
            id="member-navigation"
          >
            <div className={styles.profile}>
              <span className={styles.avatar}>{initials}</span>
              <div>
                <strong>
                  {member.firstName && member.lastName
                    ? `${member.firstName} ${member.lastName}`
                    : member.username}
                </strong>
                <small>{member.isAdmin ? "Administrateur" : "Membre ADS"}</small>
              </div>
            </div>
            <nav className={styles.nav} aria-label="Navigation de l’espace membre">
              {tabs.map(([id, label, icon, href]) => (
                <Link
                  key={id}
                  href={href}
                  className={section === id ? styles.active : ""}
                  aria-current={section === id ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <i className={`fa-solid ${icon}`} aria-hidden="true" /> {label}
                </Link>
              ))}
            </nav>
            <div className={styles.sideBottom}>
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <i className="fa-solid fa-house" aria-hidden="true" /> Retour au site
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.assign("/login");
                }}
              >
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />{" "}
                Déconnexion
              </button>
            </div>
          </div>
        </aside>
        {menuOpen && (
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <section className={styles.content}>
          <header className={styles.top}>
            <div>
              <h1>{currentTab[1]}</h1>
              <p>Ton espace personnel ADS</p>
            </div>
            <span className={styles.status}>
              <i className="fa-solid fa-circle-check" aria-hidden="true" /> Session active
            </span>
          </header>
          {children}
        </section>
      </main>
    </MemberContext.Provider>
  );
}
