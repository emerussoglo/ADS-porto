"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./PrivateSpace.module.css";

const tabs = [
  ["dashboard", "Tableau de bord", "fa-gauge-high", "/espace-prive"],
  ["profile", "Mon profil", "fa-user", "/espace-prive/profil"],
  [
    "formations",
    "Mes formations",
    "fa-graduation-cap",
    "/espace-prive/formations",
  ],
  [
    "activities",
    "Mes activités",
    "fa-calendar-check",
    "/espace-prive/activites",
  ],
  [
    "evaluations",
    "Mes évaluations",
    "fa-clipboard-list",
    "/espace-prive/evaluations",
  ],
  ["documents", "Mes documents", "fa-file-lines", "/espace-prive/documents"],
  ["messages", "Messages admin", "fa-envelope", "/espace-prive/messages"],
  ["merits", "Mes mérites", "fa-medal", "/espace-prive/merites"],
  [
    "sanctions",
    "Mes sanctions",
    "fa-scale-balanced",
    "/espace-prive/sanctions",
  ],
] as const;

type MemberData = {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  personalNumber: string;
  firstName: string | null;
  lastName: string | null;
  parish: string | null;
  level: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  roles: Array<{
    roleName: string | null;
    isPrincipal: boolean | null;
    scope: string | null;
  }>;
};
type MemberMessage = {
  id: string;
  title: string;
  content: string;
  readAt: string | null;
  createdAt: string;
};

export default function MemberDashboard() {
  const pathname = usePathname();
  const routeSection = pathname.split("/").filter(Boolean)[1];
  const active =
    routeSection === "profil"
      ? "profile"
      : routeSection === "activites"
        ? "activities"
        : routeSection === "evaluations"
          ? "evaluations"
          : routeSection === "documents"
            ? "documents"
            : routeSection === "messages"
              ? "messages"
              : routeSection === "merites"
                ? "merits"
                : routeSection || "dashboard";
  const [menuOpen, setMenuOpen] = useState(false);
  const [member, setMember] = useState<MemberData | null>(null);
  const [messages, setMessages] = useState<MemberMessage[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        window.location.assign("/login");
        return;
      }
      const data = (await response.json()) as MemberData;
      setMember(data);

      const messagesResponse = await fetch("/api/auth/notifications", {
        cache: "no-store",
      });
      if (messagesResponse.ok) {
        const messageData = (await messagesResponse.json()) as {
          messages: MemberMessage[];
        };
        setMessages(messageData.messages);
      }
    };

    loadUser();
  }, []);

  const current = tabs.find(([id]) => id === active) ?? tabs[0];
  const initials =
    `${member?.firstName?.[0] ?? ""}${member?.lastName?.[0] ?? ""}`
      .trim()
      .toUpperCase() || "ADS";

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!member) return;

    const form = new FormData(event.currentTarget);
    const payload = {
      firstName: (form.get("firstName") ?? "").toString().trim(),
      lastName: (form.get("lastName") ?? "").toString().trim(),
      email: (form.get("email") ?? "").toString().trim(),
      phone: (form.get("phone") ?? "").toString().trim(),
      username: (form.get("username") ?? "").toString().trim(),
      parish: (form.get("parish") ?? "").toString().trim(),
      level: (form.get("level") ?? "").toString().trim(),
    };

    setSaving(true);
    setStatus("");

    const response = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { error?: string; ok?: boolean };
    setSaving(false);

    if (!response.ok) {
      setStatus(result.error || "La mise à jour a échoué.");
      return;
    }

    setStatus("Profil mis à jour avec succès.");
    const refreshed = await fetch("/api/auth/me", { cache: "no-store" });
    const data = (await refreshed.json()) as MemberData;
    setMember(data);
  };

  if (!member) {
    return (
      <main className={styles.dashboard}>
        <section className={styles.content}>
          <article className={styles.panel}>
            <h3>Chargement...</h3>
          </article>
        </section>
      </main>
    );
  }

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
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          {tabs.map(([id, label, icon, href]) => (
            <Link
              key={id}
              href={href}
              className={active === id ? styles.active : ""}
              onClick={() => setMenuOpen(false)}
            >
              <i className={`fa-solid ${icon}`} /> {label}
            </Link>
          ))}
        </nav>
        <div className={styles.sideBottom}>
          <Link href="/">
            <i className="fa-solid fa-house" /> Retour au site
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.assign("/login");
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
                <h2>Bienvenue, {member.firstName || member.username}</h2>
                <p>
                  Retrouve ici ton parcours, les mises à jour du mouvement et
                  les accès à ton profil ADS.
                </p>
              </div>
              <i className="fa-solid fa-star" />
            </section>

            <div className={styles.stats}>
              {[
                ["fa-calendar-check", "12", "Activités"],
                ["fa-graduation-cap", "08", "Formations"],
                ["fa-medal", "05", "Mérites"],
                [
                  "fa-envelope",
                  member.roles.length > 0 ? String(member.roles.length) : "01",
                  "Rôles",
                ],
              ].map(([icon, value, label]) => (
                <article className={styles.stat} key={label as string}>
                  <i className={`fa-solid ${icon as string}`} />
                  <strong>{value as string}</strong>
                  <span>{label as string}</span>
                </article>
              ))}
            </div>

            <div className={styles.overview}>
              <article className={styles.memberCard}>
                <small>Carte membre officielle</small>
                <h2>ADS · {member.username}</h2>
                <p>
                  {member.level || "Membre"} ·{" "}
                  {member.parish || "Paroisse à préciser"}
                </p>
                <span className={styles.memberId}>{member.personalNumber}</span>
              </article>

              <article className={styles.panel}>
                <h3>Mes accès</h3>
                <div className={styles.list}>
                  {member.roles.length > 0 ? (
                    member.roles.map((role) => (
                      <div
                        className={styles.row}
                        key={`${role.roleName ?? "role"}-${role.scope ?? "all"}`}
                      >
                        <div>
                          <strong>{role.roleName ?? "Rôle"}</strong>
                          <small>{role.scope || "Tous"}</small>
                        </div>
                        <span className={styles.tag}>
                          {role.isPrincipal ? "Principal" : "Section"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className={styles.row}>
                      <div>
                        <strong>Compte membre standard</strong>
                        <small>Pas d’accès administrateur</small>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </div>
          </>
        )}

        {active === "profile" && (
          <article className={styles.panel}>
            <h3>Informations personnelles</h3>
            <form
              onSubmit={handleSaveProfile}
              style={{ display: "grid", gap: 12 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <input
                  name="firstName"
                  defaultValue={member.firstName ?? ""}
                  placeholder="Prénom"
                />
                <input
                  name="lastName"
                  defaultValue={member.lastName ?? ""}
                  placeholder="Nom"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <input
                  name="username"
                  defaultValue={member.username ?? ""}
                  placeholder="Nom d'utilisateur"
                />
                <input
                  name="email"
                  type="email"
                  defaultValue={member.email ?? ""}
                  placeholder="E-mail"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <input
                  name="phone"
                  defaultValue={member.phone ?? ""}
                  placeholder="Téléphone"
                />
                <input
                  name="parish"
                  defaultValue={member.parish ?? ""}
                  placeholder="Paroisse"
                />
                <input
                  name="level"
                  defaultValue={member.level ?? ""}
                  placeholder="Niveau"
                />
              </div>

              {status && (
                <p
                  style={{
                    color: status.startsWith("Profil") ? "#2e7d32" : "#d75d48",
                    fontSize: 12,
                  }}
                >
                  {status}
                </p>
              )}

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </article>
        )}

        {active === "sanctions" && (
          <article className={styles.panel}>
            <h3>Historique des sanctions</h3>
            <p className={styles.empty}>
              <i className="fa-solid fa-circle-check" /> Aucune sanction
              enregistrée pour le moment. Les décisions et leur suivi seront
              visibles ici lorsqu&apos;ils seront ajoutés par
              l&apos;administration.
            </p>
          </article>
        )}

        {active === "messages" && (
          <article className={styles.panel}>
            <h3>Messages de l&apos;administration</h3>
            {messages.length === 0 ? (
              <p className={styles.empty}>
                <i className="fa-solid fa-envelope-open" /> Aucun message reçu
                pour le moment.
              </p>
            ) : (
              <div className={styles.list}>
                {messages.map((message) => (
                  <div className={styles.row} key={message.id}>
                    <div>
                      <strong>{message.title}</strong>
                      <small>{message.content}</small>
                    </div>
                    <span className={styles.tag}>
                      {message.readAt ? "Lu" : "Nouveau"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        )}

        {active !== "dashboard" &&
          active !== "profile" &&
          active !== "sanctions" &&
          active !== "messages" && (
            <article className={styles.panel}>
              <h3>{current[1]}</h3>
              <p className={styles.empty}>
                <i className="fa-solid fa-circle-info" /> Cette rubrique est
                prête à recevoir tes données ADS. Les éléments seront alimentés
                par l’administration.
              </p>
            </article>
          )}
      </section>
    </main>
  );
}
