"use client";

import { useEffect, useState } from "react";
import styles from "../../components/AdminPanel.module.css";

const rolesList = [
  "Principal admin",
  "À propos",
  "Médias",
  "Formations",
  "Agenda",
  "Membres",
];

type AdminSummary = {
  principalLimit: number;
  principalCount: number;
  roles: Array<{
    id: string;
    name: string;
    isPrincipal: boolean;
    assignedUsers: number;
  }>;
  assignedUsers: Array<{
    userId: string;
    username: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    roleName: string | null;
    isPrincipal: boolean | null;
    scope: string | null;
  }>;
};

export default function AdminPage() {
  const [tab, setTab] = useState("Vue d’ensemble");
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Principal admin");
  const [scope, setScope] = useState("all");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageMembers, setMessageMembers] = useState<
    Array<{
      id: string;
      username: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
    }>
  >([]);
  const [messageRecipient, setMessageRecipient] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageSending, setMessageSending] = useState(false);

  const sections = [
    "Vue d’ensemble",
    "Membres",
    "À propos",
    "Formations",
    "Agenda",
    "Hall of Fame",
    "Administrateurs",
    "Messages",
  ];

  useEffect(() => {
    const loadSummary = async () => {
      const response = await fetch("/api/admin/summary", { cache: "no-store" });
      if (!response.ok) {
        window.location.assign("/login?redirect=/admin");
        return;
      }

      const data = (await response.json()) as AdminSummary;
      setSummary(data);
      const membersResponse = await fetch("/api/admin/messages", {
        cache: "no-store",
      });
      if (membersResponse.ok) {
        const membersData = (await membersResponse.json()) as {
          members: Array<{
            id: string;
            username: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
          }>;
        };
        setMessageMembers(membersData.members);
        if (membersData.members.length > 0 && !messageRecipient) {
          setMessageRecipient(membersData.members[0].id);
        }
      }
      if (data.assignedUsers.length > 0 && !selectedMemberId) {
        setSelectedMemberId(data.assignedUsers[0].userId);
      }
      setLoading(false);
    };

    loadSummary();
  }, [selectedMemberId]);

  const handleAssign = async () => {
    if (!selectedMemberId || !selectedRole) {
      setError("Choisis un membre et un rôle.");
      return;
    }

    setError("");
    setInfo("");

    const response = await fetch("/api/admin/assign-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedMemberId,
        roleName: selectedRole,
        scope,
      }),
    });

    const result = (await response.json()) as { error?: string; ok?: boolean };
    if (!response.ok) {
      setError(result.error || "Impossible d’attribuer ce rôle.");
      return;
    }

    setInfo("Rôle mis à jour avec succès.");
    const refreshed = await fetch("/api/admin/summary", { cache: "no-store" });
    const data = (await refreshed.json()) as AdminSummary;
    setSummary(data);
  };

  const handleSendMessage = async () => {
    if (!messageRecipient || !messageTitle.trim() || !messageContent.trim()) {
      setError("Choisis un utilisateur et remplis le titre et le message.");
      return;
    }

    setMessageSending(true);
    setError("");
    setInfo("");
    const response = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: messageRecipient,
        title: messageTitle,
        content: messageContent,
      }),
    });
    const result = (await response.json()) as { error?: string };
    setMessageSending(false);

    if (!response.ok) {
      setError(result.error || "Impossible d’envoyer le message.");
      return;
    }

    setMessageTitle("");
    setMessageContent("");
    setInfo("Message envoyé avec succès.");
  };

  const members = (summary?.assignedUsers ?? []).filter((member) =>
    `${member.firstName ?? ""} ${member.lastName ?? ""} ${member.username} ${member.email ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  if (loading || !summary) {
    return (
      <main className={styles.page}>
        <div className={styles.top}>
          <div>
            <h1>Administration ADS</h1>
            <p>Chargement du tableau de bord…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div>
          <h1>Administration ADS</h1>
          <p>
            Gérez les contenus, les membres et les accès selon les
            responsabilités de chacun.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <nav className={styles.nav}>
          {sections.map((section) => (
            <button
              onClick={() => setTab(section)}
              className={tab === section ? styles.active : ""}
              key={section}
            >
              <i className="fa-solid fa-chevron-right" /> {section}
            </button>
          ))}
        </nav>

        <section>
          <div className={styles.intro}>
            <h2>{tab}</h2>
            <p>
              {tab === "Vue d’ensemble"
                ? "Bienvenue. Cette interface regroupe les espaces de publication et le suivi des permissions du mouvement."
                : `Gérez les éléments liés à la rubrique « ${tab} ».`}
            </p>

            {tab === "Membres" && (
              <input
                className={styles.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un membre"
              />
            )}

            {tab === "Administrateurs" && (
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                <p className={styles.warning}>
                  <i className="fa-solid fa-shield-halved" /> Jusqu&apos;à{" "}
                  {summary.principalLimit} administrateurs principaux. Les
                  autres accès sont limités à une page ou une section.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                    gap: 12,
                  }}
                >
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                  >
                    <option value="">Choisir un membre</option>
                    {summary.assignedUsers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.firstName || member.username}{" "}
                        {member.lastName || ""}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {rolesList.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  >
                    <option value="all">Tout le site</option>
                    <option value="about">Page À propos</option>
                    <option value="media">Médias</option>
                    <option value="formations">Formations</option>
                    <option value="agenda">Agenda</option>
                    <option value="members">Membres</option>
                  </select>
                </div>

                <div className={styles.actions}>
                  <button className={styles.primary} onClick={handleAssign}>
                    Attribuer le rôle
                  </button>
                </div>

                {error && (
                  <p style={{ color: "#d75d48", fontSize: 12 }}>{error}</p>
                )}
                {info && (
                  <p style={{ color: "#2e7d32", fontSize: 12 }}>{info}</p>
                )}
              </div>
            )}

            {tab === "Messages" && (
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                <select
                  value={messageRecipient}
                  onChange={(event) => setMessageRecipient(event.target.value)}
                >
                  <option value="">Choisir un utilisateur</option>
                  {messageMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName || member.username}{" "}
                      {member.lastName || ""}
                    </option>
                  ))}
                </select>
                <input
                  value={messageTitle}
                  onChange={(event) => setMessageTitle(event.target.value)}
                  placeholder="Titre du message"
                />
                <textarea
                  value={messageContent}
                  onChange={(event) => setMessageContent(event.target.value)}
                  placeholder="Écrire un message à l'utilisateur"
                  rows={5}
                />
                <div className={styles.actions}>
                  <button
                    className={styles.primary}
                    onClick={handleSendMessage}
                    disabled={messageSending}
                  >
                    {messageSending ? "Envoi..." : "Envoyer le message"}
                  </button>
                </div>
                {error && (
                  <p style={{ color: "#d75d48", fontSize: 12 }}>{error}</p>
                )}
                {info && (
                  <p style={{ color: "#2e7d32", fontSize: 12 }}>{info}</p>
                )}
              </div>
            )}
          </div>

          <div className={styles.table}>
            {(tab === "Membres"
              ? members
              : tab === "Administrateurs"
                ? summary.assignedUsers
                : [
                    [
                      tab === "À propos"
                        ? "Présentation du mouvement"
                        : `Contenu ${tab}`,
                      "Dernière mise à jour",
                      "Administration ADS",
                      "Brouillon",
                    ],
                    [
                      "Élément publié",
                      "À planifier",
                      "Responsable ADS",
                      "Actif",
                    ],
                  ]
            ).map((row, index) => {
              if (tab === "Administrateurs") {
                const admin = row as {
                  userId: string;
                  username: string;
                  email: string | null;
                  firstName: string | null;
                  lastName: string | null;
                  roleName: string | null;
                  isPrincipal: boolean | null;
                  scope: string | null;
                };

                return (
                  <div
                    className={styles.row}
                    key={`${admin.userId}-${admin.roleName}-${index}`}
                  >
                    <div>
                      <strong>
                        {admin.firstName || admin.username}{" "}
                        {admin.lastName || ""}
                      </strong>
                      <small>{admin.roleName || "Rôle non attribué"}</small>
                    </div>
                    <small>{admin.email || "—"}</small>
                    <small>{admin.scope || "all"}</small>
                    <span className={styles.badge}>
                      {admin.isPrincipal ? "Principal" : "Section"}
                    </span>
                  </div>
                );
              }

              const [name, detail, owner, status] =
                Array.isArray(row) && row.length >= 4
                  ? [row[0], row[1], row[2], row[3]]
                  : [String(row ?? ""), "", "", ""];

              return (
                <div className={styles.row} key={`${name}-${detail}-${index}`}>
                  <div>
                    <strong>{String(name)}</strong>
                    <small>{String(detail)}</small>
                  </div>
                  <small>{String(owner)}</small>
                  <small>Gestionnaire de rubrique</small>
                  <span className={styles.badge}>{String(status)}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
