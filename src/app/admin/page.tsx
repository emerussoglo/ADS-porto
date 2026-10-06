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
  members: Array<{
    userId: string;
    username: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    status: string;
  }>;
};

type AdminTraining = {
  id: string;
  title: string;
  summary: string;
  status: "draft" | "published";
  priceCfa: number;
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
  const [messageRecipient, setMessageRecipient] = useState("all");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [trainingTitle, setTrainingTitle] = useState("");
  const [trainingSummary, setTrainingSummary] = useState("");
  const [trainingCoverUrl, setTrainingCoverUrl] = useState("");
  const [trainingVideoUrl, setTrainingVideoUrl] = useState("");
  const [trainingPrice, setTrainingPrice] = useState("0");
  const [trainingStatus, setTrainingStatus] = useState<"draft" | "published">(
    "published",
  );
  const [trainingSaving, setTrainingSaving] = useState(false);
  const [trainings, setTrainings] = useState<AdminTraining[]>([]);

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
        if (membersData.members.length > 0) {
          setMessageRecipient(
            (current) => current || membersData.members[0].id,
          );
        }
      }
      if (data.members.length > 0) {
        setSelectedMemberId((current) => current || data.members[0].userId);
      }
      setLoading(false);
    };

    loadSummary();
  }, []);

  const loadTrainings = async () => {
    const response = await fetch("/api/admin/trainings", { cache: "no-store" });
    const result = (await response.json()) as {
      trainings?: AdminTraining[];
      error?: string;
    };
    if (!response.ok) {
      setError(result.error || "Impossible de charger les formations.");
      return;
    }
    setTrainings(result.trainings ?? []);
  };

  const handleCreateTraining = async () => {
    const priceCfa = Number(trainingPrice);
    if (!trainingTitle.trim() || !trainingSummary.trim() || !Number.isSafeInteger(priceCfa) || priceCfa < 0) {
      setError("Renseigne le titre, les informations et un prix valide.");
      return;
    }

    setTrainingSaving(true);
    setError("");
    setInfo("");
    const response = await fetch("/api/admin/trainings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trainingTitle,
        summary: trainingSummary,
        coverUrl: trainingCoverUrl || undefined,
        videoUrl: trainingVideoUrl || undefined,
        priceCfa,
        status: trainingStatus,
      }),
    });
    const result = (await response.json()) as {
      error?: string;
      notifiedMembers?: number;
    };
    setTrainingSaving(false);
    if (!response.ok) {
      setError(result.error || "Impossible d’enregistrer la formation.");
      return;
    }
    setTrainingTitle("");
    setTrainingSummary("");
    setTrainingCoverUrl("");
    setTrainingVideoUrl("");
    setTrainingPrice("0");
    setInfo(
      trainingStatus === "published"
        ? `Formation publiée. ${result.notifiedMembers ?? 0} membre(s) ont été notifiés.`
        : "Formation enregistrée en brouillon.",
    );
    await loadTrainings();
  };

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

  const filteredMembers = (summary?.members ?? []).filter((member) =>
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
              onClick={() => {
                setTab(section);
                setError("");
                setInfo("");
                if (section === "Formations") void loadTrainings();
              }}
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

            {tab === "Formations" && (
              <div className={styles.editor}>
                <h3>Ajouter une formation</h3>
                <p>
                  Une formation publiée est enregistrée dans ADS et déclenche une
                  notification dans l’espace de chaque membre actif.
                </p>
                <input
                  value={trainingTitle}
                  onChange={(event) => setTrainingTitle(event.target.value)}
                  placeholder="Titre de la formation"
                  aria-label="Titre de la formation"
                />
                <textarea
                  value={trainingSummary}
                  onChange={(event) => setTrainingSummary(event.target.value)}
                  placeholder="Informations, objectifs et détails pratiques"
                  aria-label="Informations de la formation"
                  rows={4}
                />
                <input
                  type="url"
                  value={trainingCoverUrl}
                  onChange={(event) => setTrainingCoverUrl(event.target.value)}
                  placeholder="Lien HTTPS de l’image (facultatif)"
                  aria-label="Lien de l’image de couverture"
                />
                <input
                  type="url"
                  value={trainingVideoUrl}
                  onChange={(event) => setTrainingVideoUrl(event.target.value)}
                  placeholder="Lien HTTPS de la vidéo (facultatif)"
                  aria-label="Lien de la vidéo"
                />
                <div className={styles.editorFields}>
                  <label>
                    Prix en FCFA
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={trainingPrice}
                      onChange={(event) => setTrainingPrice(event.target.value)}
                    />
                  </label>
                  <label>
                    Publication
                    <select
                      value={trainingStatus}
                      onChange={(event) =>
                        setTrainingStatus(event.target.value as "draft" | "published")
                      }
                    >
                      <option value="published">Publier et notifier les membres</option>
                      <option value="draft">Enregistrer comme brouillon</option>
                    </select>
                  </label>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.primary}
                    onClick={handleCreateTraining}
                    disabled={trainingSaving}
                  >
                    {trainingSaving ? "Enregistrement..." : "Enregistrer la formation"}
                  </button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                {info && <p className={styles.success}>{info}</p>}
                <h3 className={styles.listTitle}>Formations enregistrées</h3>
                {trainings.length ? (
                  trainings.map((training) => (
                    <div className={styles.trainingRow} key={training.id}>
                      <div>
                        <strong>{training.title}</strong>
                        <small>{training.summary}</small>
                      </div>
                      <span className={styles.badge}>
                        {training.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className={styles.muted}>Aucune formation enregistrée.</p>
                )}
              </div>
            )}

            {tab === "Administrateurs" && (
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                <p className={styles.warning}>
                  <i className="fa-solid fa-shield-halved" /> Jusqu&apos;à{" "}
                  {summary.principalLimit} administrateurs principaux. Les
                  autres accès sont limités à une page ou une section.
                </p>

                <div className={styles.adminFields}>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                  >
                    <option value="">Choisir un membre</option>
                    {summary.members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.firstName || member.username} {member.lastName || ""}
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
                  <option value="all">Tous les membres actifs</option>
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
            {tab !== "Membres" && tab !== "Administrateurs" && (
              <p className={styles.muted}>
                Cette rubrique ne contient pas encore de données publiées.
              </p>
            )}
            {tab === "Membres" && filteredMembers.length === 0 && (
              <p className={styles.muted}>Aucun membre ne correspond à cette recherche.</p>
            )}
            {tab === "Administrateurs" && summary.assignedUsers.length === 0 && (
              <p className={styles.muted}>Aucun rôle administrateur n’est attribué.</p>
            )}
            {(tab === "Membres"
              ? filteredMembers
              : tab === "Administrateurs"
                ? summary.assignedUsers
                : []
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

              if (tab === "Membres") {
                const member = row as AdminSummary["members"][number];
                return (
                  <div className={styles.row} key={member.userId}>
                    <div>
                      <strong>
                        {member.firstName || member.username}{" "}
                        {member.lastName || ""}
                      </strong>
                      <small>{member.username}</small>
                    </div>
                    <small>{member.email || "—"}</small>
                    <small>{member.status}</small>
                    <span className={styles.badge}>
                      {member.status === "active" ? "Actif" : member.status}
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
