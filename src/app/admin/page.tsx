"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../../components/AdminPanel.module.css";

type Member = {
  userId: string;
  username: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  createdAt: string | null;
  level: string | null;
  approvedNextLevel: string | null;
  parish: string | null;
  gender: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string | null;
  motherPhone: string | null;
  avatarUrl: string | null;
};

type MembershipPayment = {
  id: string;
  userId: string;
  applicationType: "new" | "renewal";
  membershipYear: number;
  amountCfa: number;
  status: "pending_review" | "approved" | "rejected";
  reference: string | null;
  proofUrl: string | null;
  nextLevel: string | null;
  username: string;
  personalNumber: string;
  firstName: string;
  lastName: string;
  level: string | null;
  parish: string | null;
};

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
  members: Member[];
};

type MembershipData = {
  feeCfa: number;
  levels: string[];
  payments: MembershipPayment[];
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  content: string;
  status: "new" | "read" | "replied";
  createdAt: string;
};

type AdminTraining = {
  id: string;
  title: string;
  summary: string;
  status: "draft" | "published";
  priceCfa: number;
  category: string;
};

export default function AdminPage() {
  const [tab, setTab] = useState<
    "overview" | "validations" | "members" | "membership" | "trainings" | "messages" | "admins"
  >("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [trainings, setTrainings] = useState<AdminTraining[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState<"all" | "pending" | "active" | "suspended">("all");

  // Form states
  const [membershipFee, setMembershipFee] = useState("2000");
  const [levelMemberId, setLevelMemberId] = useState("");
  const [nextLevel, setNextLevel] = useState("Cadet");
  const [trainingTitle, setTrainingTitle] = useState("");
  const [trainingSummary, setTrainingSummary] = useState("");
  const [trainingPrice, setTrainingPrice] = useState("0");
  const [trainingCategory, setTrainingCategory] = useState("general");
  const [actionLoading, setActionLoading] = useState(false);

  // Role assignment state
  const [adminAssignUserId, setAdminAssignUserId] = useState("");
  const [adminAssignRole, setAdminAssignRole] = useState("Principal admin");

  const loadData = async () => {
    try {
      const [sumRes, memRes, trainRes, msgRes] = await Promise.all([
        fetch("/api/admin/summary", { cache: "no-store" }),
        fetch("/api/admin/membership", { cache: "no-store" }),
        fetch("/api/admin/trainings", { cache: "no-store" }),
        fetch("/api/admin/contact", { cache: "no-store" }),
      ]);

      if (sumRes.status === 401) {
        window.location.assign("/login?redirect=/admin");
        return;
      }

      if (sumRes.ok) {
        const sumData = (await sumRes.json()) as AdminSummary;
        setSummary(sumData);
        if (sumData.members.length > 0 && !adminAssignUserId) {
          setAdminAssignUserId(sumData.members[0].userId);
        }
      }

      if (memRes.ok) {
        const memData = (await memRes.json()) as MembershipData;
        setMembership(memData);
        setMembershipFee(String(memData.feeCfa));
      }

      if (trainRes.ok) {
        const trainData = (await trainRes.json()) as { trainings: AdminTraining[] };
        setTrainings(trainData.trainings || []);
      }

      if (msgRes.ok) {
        const msgData = (await msgRes.json()) as { messages: ContactMessage[] };
        setContactMessages(msgData.messages || []);
      }
    } catch {
      setError("Impossible de charger les données du dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Pending members waiting for admin approval
  const pendingMembers = useMemo(() => {
    return (summary?.members || []).filter((m) => m.status === "pending");
  }, [summary]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    const list = summary?.members || [];
    return list.filter((m) => {
      if (memberFilter !== "all" && m.status !== memberFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const name = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
      const username = (m.username || "").toLowerCase();
      const parish = (m.parish || "").toLowerCase();
      const phone = (m.phone || "").toLowerCase();
      return name.includes(q) || username.includes(q) || parish.includes(q) || phone.includes(q);
    });
  }, [summary, memberFilter, searchQuery]);

  // 1-Click Validate User Account
  const handleValidateUser = async (userId: string, decision: "approve" | "reject") => {
    setError("");
    setInfo("");
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/membership", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate_user",
          userId,
          decision,
        }),
      });

      const result = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok) {
        setError(result.error || "Impossible de mettre à jour le statut du membre.");
        return;
      }

      setInfo(
        decision === "approve"
          ? "Compte validé et activé avec succès ! L'utilisateur peut se connecter."
          : "Compte refusé ou suspendu.",
      );
      await loadData();
    } catch {
      setError("Erreur de communication avec le serveur.");
    } finally {
      setActionLoading(false);
    }
  };

  // Review membership payment
  const handleReviewPayment = async (paymentId: string, decision: "approve" | "reject") => {
    setError("");
    setInfo("");
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/membership", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          decision,
        }),
      });

      const result = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok) {
        setError(result.error || "Impossible de valider ce paiement.");
        return;
      }

      setInfo(decision === "approve" ? "Paiement validé avec succès." : "Dossier de paiement rejeté.");
      await loadData();
    } catch {
      setError("Erreur de communication avec le serveur.");
    } finally {
      setActionLoading(false);
    }
  };

  // Save annual fee
  const handleSaveFee = async () => {
    setError("");
    setInfo("");
    const amount = Number(membershipFee);
    if (!Number.isSafeInteger(amount) || amount < 0) {
      setError("Montant invalide.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/membership", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_fee", amountCfa: amount }),
      });
      if (!res.ok) throw new Error("Échec de la sauvegarde.");
      setInfo("Montant de la cotisation annuelle mis à jour.");
      await loadData();
    } catch {
      setError("Erreur lors de l'enregistrement de la cotisation.");
    } finally {
      setActionLoading(false);
    }
  };

  // Grant next level
  const handleGrantLevel = async () => {
    if (!levelMemberId) return;
    setError("");
    setInfo("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/membership", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "grant_level", userId: levelMemberId, nextLevel }),
      });
      const result = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(result.error || "Impossible d'accorder ce niveau.");
        return;
      }
      setInfo(`Passage au niveau ${nextLevel} accordé.`);
      await loadData();
    } catch {
      setError("Erreur serveur.");
    } finally {
      setActionLoading(false);
    }
  };

  // Publish training
  const handleCreateTraining = async () => {
    if (!trainingTitle.trim() || !trainingSummary.trim()) {
      setError("Renseigne le titre et le résumé de la formation.");
      return;
    }
    setError("");
    setInfo("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trainingTitle,
          summary: trainingSummary,
          priceCfa: Number(trainingPrice) || 0,
          category: trainingCategory,
          status: "published",
        }),
      });
      if (!res.ok) throw new Error("Échec de création.");
      setInfo("Formation publiée avec succès sur le site public.");
      setTrainingTitle("");
      setTrainingSummary("");
      await loadData();
    } catch {
      setError("Impossible d'enregistrer la formation.");
    } finally {
      setActionLoading(false);
    }
  };

  // Update contact message
  const handleUpdateMessage = async (id: string, status: "read" | "replied") => {
    try {
      await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setInfo("Statut du message mis à jour.");
      await loadData();
    } catch {
      setError("Impossible de mettre à jour le message.");
    }
  };

  // Assign admin role
  const handleAssignRole = async () => {
    if (!adminAssignUserId || !adminAssignRole) return;
    setError("");
    setInfo("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: adminAssignUserId, roleName: adminAssignRole }),
      });
      const result = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(result.error || "Impossible d'attribuer ce rôle.");
        return;
      }
      setInfo("Rôle administrateur attribué.");
      await loadData();
    } catch {
      setError("Erreur lors de l'attribution du rôle.");
    } finally {
      setActionLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.assign("/login");
    }
  };

  return (
    <div className={styles.shell}>
      {/* SIDEBAR NAVIGATION */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <Image
            src="/img/logo.jpeg"
            alt="Logo ADS"
            width={40}
            height={40}
            className={styles.logoImage}
            priority
          />
          <div className={styles.brandText}>
            <strong>ADS Admin</strong>
            <span className={styles.brandBadge}>Console Diocésaine</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {/* Section: Prioritaire */}
          <div className={styles.navGroup}>
            <span className={styles.groupLabel}>Gestion Principale</span>
            <button
              className={`${styles.navItem} ${tab === "overview" ? styles.navItemActive : ""}`}
              onClick={() => { setTab("overview"); setSidebarOpen(false); }}
            >
              <span className={styles.navItemLeft}>
                <i className="fa-solid fa-chart-pie" /> Vue d’ensemble
              </span>
            </button>

            <button
              className={`${styles.navItem} ${tab === "validations" ? styles.navItemActive : ""}`}
              onClick={() => { setTab("validations"); setSidebarOpen(false); }}
            >
              <span className={styles.navItemLeft}>
                <i className="fa-solid fa-user-clock" /> Validations
              </span>
              {pendingMembers.length > 0 && (
                <span className={styles.countPill}>{pendingMembers.length}</span>
              )}
            </button>

            <button
              className={`${styles.navItem} ${tab === "members" ? styles.navItemActive : ""}`}
              onClick={() => { setTab("members"); setSidebarOpen(false); }}
            >
              <span className={styles.navItemLeft}>
                <i className="fa-solid fa-users" /> Répertoire Membres
              </span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{summary?.members.length ?? 0}</span>
            </button>

            <button
              className={`${styles.navItem} ${tab === "membership" ? styles.navItemActive : ""}`}
              onClick={() => { setTab("membership"); setSidebarOpen(false); }}
            >
              <span className={styles.navItemLeft}>
                <i className="fa-solid fa-id-card" /> Adhésions & Cotisations
              </span>
            </button>
          </div>

          {/* Section: Contenus */}
          <div className={styles.navGroup}>
            <span className={styles.groupLabel}>Contenus & Événements</span>
            <button
              className={`${styles.navItem} ${tab === "trainings" ? styles.navItemActive : ""}`}
              onClick={() => { setTab("trainings"); setSidebarOpen(false); }}
            >
              <span className={styles.navItemLeft}>
                <i className="fa-solid fa-graduation-cap" /> Formations
              </span>
            </button>

            <button
              className={`${styles.navItem} ${tab === "messages" ? styles.navItemActive : ""}`}
              onClick={() => { setTab("messages"); setSidebarOpen(false); }}
            >
              <span className={styles.navItemLeft}>
                <i className="fa-solid fa-envelope" /> Messages du site
              </span>
              {contactMessages.filter((m) => m.status === "new").length > 0 && (
                <span className={styles.countPill}>
                  {contactMessages.filter((m) => m.status === "new").length}
                </span>
              )}
            </button>
          </div>

          {/* Section: Sécurité */}
          <div className={styles.navGroup}>
            <span className={styles.groupLabel}>Système</span>
            <button
              className={`${styles.navItem} ${tab === "admins" ? styles.navItemActive : ""}`}
              onClick={() => { setTab("admins"); setSidebarOpen(false); }}
            >
              <span className={styles.navItemLeft}>
                <i className="fa-solid fa-shield-halved" /> Administrateurs
              </span>
            </button>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.publicLink} target="_blank">
            <i className="fa-solid fa-arrow-up-right-from-square" /> Voir le site public
          </Link>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>AD</div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>Administration</span>
                <span className={styles.userRole}>Diocèse de Porto-Novo</span>
              </div>
            </div>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        {/* TOPBAR */}
        <header className={styles.topbar}>
          <button
            className={styles.mobileToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Menu"
          >
            <i className="fa-solid fa-bars" />
          </button>

          <div className={styles.topbarTitle}>
            <h1>
              {tab === "overview" && "Tableau de Bord Exécutif"}
              {tab === "validations" && "Validation des Inscriptions en attente"}
              {tab === "members" && "Répertoire des Membres ADS"}
              {tab === "membership" && "Adhésions, Cotisations & Niveaux"}
              {tab === "trainings" && "Gestion des Formations & Ateliers"}
              {tab === "messages" && "Messages & Contacts reçus"}
              {tab === "admins" && "Rôles et Accès Administrateur"}
            </h1>
            <p>Diocèse de Porto-Novo — Fraternité, Jeunes Leaders</p>
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.searchBox}>
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Link href="/" className={styles.btnSecondary} target="_blank">
              <i className="fa-solid fa-house" /> Public
            </Link>
          </div>
        </header>

        {/* CANVAS CONTENT */}
        <div className={styles.canvas}>
          {/* ALERTS */}
          {error && (
            <div className={styles.noticeError} role="alert">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}
          {info && (
            <div className={styles.noticeSuccess}>
              <i className="fa-solid fa-circle-check" /> {info}
            </div>
          )}

          {/* QUICK BANNER FOR PENDING VALIDATIONS */}
          {pendingMembers.length > 0 && tab !== "validations" && (
            <div className={styles.bannerAlert}>
              <div className={styles.bannerAlertLeft}>
                <i className="fa-solid fa-bell" />
                <span>
                  <strong>{pendingMembers.length} nouvelle(s) inscription(s)</strong> en attente de validation par l&apos;administrateur.
                </span>
              </div>
              <button className={styles.bannerBtn} onClick={() => setTab("validations")}>
                Examiner et Valider
              </button>
            </div>
          )}

          {/* TAB: VUE D'ENSEMBLE */}
          {tab === "overview" && (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statCardTop}>
                    <span>Membres Inscrits</span>
                    <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                      <i className="fa-solid fa-users" />
                    </div>
                  </div>
                  <div className={styles.statValue}>{summary?.members.length ?? 0}</div>
                  <div className={styles.statSubtext}>
                    {(summary?.members || []).filter((m) => m.status === "active").length} membres actifs
                  </div>
                </div>

                <div className={styles.statCard} style={{ borderColor: pendingMembers.length > 0 ? "rgba(245, 158, 11, 0.4)" : "" }}>
                  <div className={styles.statCardTop}>
                    <span>Inscriptions en attente</span>
                    <div className={`${styles.statIcon} ${styles.iconAmber}`}>
                      <i className="fa-solid fa-user-clock" />
                    </div>
                  </div>
                  <div className={styles.statValue} style={{ color: pendingMembers.length > 0 ? "#fbbf24" : "#ffffff" }}>
                    {pendingMembers.length}
                  </div>
                  <div className={styles.statSubtext}>Nécessitent la validation admin</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statCardTop}>
                    <span>Cotisation Annuelle</span>
                    <div className={`${styles.statIcon} ${styles.iconGold}`}>
                      <i className="fa-solid fa-coins" />
                    </div>
                  </div>
                  <div className={styles.statValue}>
                    {membership?.feeCfa ? membership.feeCfa.toLocaleString("fr-FR") : "2 000"} FCFA
                  </div>
                  <div className={styles.statSubtext}>Tarif unique diocésain</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statCardTop}>
                    <span>Formations Actives</span>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                      <i className="fa-solid fa-graduation-cap" />
                    </div>
                  </div>
                  <div className={styles.statValue}>{trainings.length}</div>
                  <div className={styles.statSubtext}>Disponibles sur le portail</div>
                </div>
              </div>

              {/* Action Rapide: Derniers dossiers en attente */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2><i className="fa-solid fa-bolt" /> Inscriptions récentes à valider</h2>
                    <p>Validez les nouveaux comptes pour leur donner accès à leur Espace Privé.</p>
                  </div>
                  <button className={styles.btnPrimary} onClick={() => setTab("validations")}>
                    Voir tous les dossiers ({pendingMembers.length})
                  </button>
                </div>

                {pendingMembers.length === 0 ? (
                  <div className={styles.emptyState}>
                    <i className="fa-solid fa-circle-check" style={{ color: "#10b981" }} />
                    <p>Tous les comptes sont à jour ! Aucune inscription en attente de validation.</p>
                  </div>
                ) : (
                  <div className={styles.validationGrid}>
                    {pendingMembers.slice(0, 4).map((member) => (
                      <div className={styles.validationCard} key={member.userId}>
                        <div className={styles.cardTop}>
                          <div className={styles.cardApplicant}>
                            <div className={styles.applicantAvatar}>
                              {member.firstName?.[0] || member.username[0].toUpperCase()}
                            </div>
                            <div className={styles.applicantInfo}>
                              <h3>{member.firstName} {member.lastName}</h3>
                              <small>@{member.username}</small>
                            </div>
                          </div>
                          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                            En attente
                          </span>
                        </div>

                        <div className={styles.infoDetails}>
                          <div className={styles.infoItem}>
                            <small>Paroisse</small>
                            <span>{member.parish || "Non renseignée"}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <small>Téléphone</small>
                            <span>{member.phone || "—"}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <small>Mère / Contact</small>
                            <span>{member.motherName || "—"} ({member.motherPhone || "—"})</span>
                          </div>
                          <div className={styles.infoItem}>
                            <small>Père / Contact</small>
                            <span>{member.fatherName || "—"} ({member.fatherPhone || "—"})</span>
                          </div>
                        </div>

                        <div className={styles.cardActions}>
                          <button
                            className={styles.btnApprove}
                            disabled={actionLoading}
                            onClick={() => void handleValidateUser(member.userId, "approve")}
                          >
                            <i className="fa-solid fa-check" /> Valider & Activer
                          </button>
                          <button
                            className={styles.btnReject}
                            disabled={actionLoading}
                            onClick={() => void handleValidateUser(member.userId, "reject")}
                          >
                            <i className="fa-solid fa-ban" /> Refuser
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB: VALIDATION DES COMPTES */}
          {tab === "validations" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2><i className="fa-solid fa-user-check" /> Centre de Validation des Comptes</h2>
                  <p>
                    L&apos;administrateur doit vérifier et valider chaque inscription avant que le membre ne puisse accéder à son Espace Privé.
                  </p>
                </div>
                <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                  {pendingMembers.length} dossier(s) en attente
                </span>
              </div>

              {pendingMembers.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fa-solid fa-clipboard-check" style={{ color: "#10b981" }} />
                  <h3>Aucun dossier en attente</h3>
                  <p>Toutes les inscriptions ont été traitées et validées par l&apos;administration.</p>
                </div>
              ) : (
                <div className={styles.validationGrid}>
                  {pendingMembers.map((member) => {
                    // Check if there is an associated payment proof
                    const payment = membership?.payments.find((p) => p.userId === member.userId);

                    return (
                      <div className={styles.validationCard} key={member.userId}>
                        <div className={styles.cardTop}>
                          <div className={styles.cardApplicant}>
                            <div
                              className={styles.applicantAvatar}
                              style={member.avatarUrl ? { backgroundImage: `url("${member.avatarUrl}")` } : undefined}
                            >
                              {!member.avatarUrl && (member.firstName?.[0] || member.username[0].toUpperCase())}
                            </div>
                            <div className={styles.applicantInfo}>
                              <h3>{member.firstName} {member.lastName}</h3>
                              <small>Identifiant : <b>{member.username}</b></small>
                            </div>
                          </div>
                          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                            À valider
                          </span>
                        </div>

                        <div className={styles.infoDetails}>
                          <div className={styles.infoItem}>
                            <small>Paroisse & Diocèse</small>
                            <span>{member.parish || "Non renseignée"}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <small>Téléphone</small>
                            <span>{member.phone || "—"}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <small>Date & Lieu Naiss.</small>
                            <span>{member.birthDate || "—"} ({member.birthPlace || "—"})</span>
                          </div>
                          <div className={styles.infoItem}>
                            <small>Genre</small>
                            <span>{member.gender || "—"}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <small>Mère / Tutrice</small>
                            <span>{member.motherName || "—"} ({member.motherPhone || "—"})</span>
                          </div>
                          <div className={styles.infoItem}>
                            <small>Père / Tuteur</small>
                            <span>{member.fatherName || "—"} ({member.fatherPhone || "—"})</span>
                          </div>
                        </div>

                        {payment && (
                          <div className={styles.proofArea}>
                            <div>
                              <strong style={{ display: "block" }}>Cotisation {payment.membershipYear}</strong>
                              <small style={{ color: "#94a3b8" }}>Réf : {payment.reference || "En attente"}</small>
                            </div>
                            {payment.proofUrl ? (
                              <a href={payment.proofUrl} target="_blank" rel="noreferrer">
                                <i className="fa-solid fa-file-image" /> Voir justificatif
                              </a>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Sans fichier</span>
                            )}
                          </div>
                        )}

                        <div className={styles.cardActions}>
                          <button
                            className={styles.btnApprove}
                            disabled={actionLoading}
                            onClick={() => void handleValidateUser(member.userId, "approve")}
                          >
                            <i className="fa-solid fa-circle-check" /> Valider & Activer le compte
                          </button>
                          <button
                            className={styles.btnReject}
                            disabled={actionLoading}
                            onClick={() => void handleValidateUser(member.userId, "reject")}
                          >
                            <i className="fa-solid fa-circle-xmark" /> Refuser
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: REPERTOIRE DES MEMBRES */}
          {tab === "members" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2><i className="fa-solid fa-users" /> Annuaire Complet des Membres</h2>
                  <p>Consultez la liste, recherchez un membre et gérez son statut d&apos;accès.</p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["all", "active", "pending", "suspended"] as const).map((filter) => (
                    <button
                      key={filter}
                      className={memberFilter === filter ? styles.btnPrimary : styles.btnSecondary}
                      onClick={() => setMemberFilter(filter)}
                    >
                      {filter === "all" && "Tous"}
                      {filter === "active" && "Actifs"}
                      {filter === "pending" && "En attente"}
                      {filter === "suspended" && "Suspendus"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Membre</th>
                      <th>Paroisse</th>
                      <th>Téléphone</th>
                      <th>Niveau</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.userId}>
                        <td>
                          <div className={styles.tableMember}>
                            <div
                              className={styles.tableAvatar}
                              style={member.avatarUrl ? { backgroundImage: `url("${member.avatarUrl}")` } : undefined}
                            >
                              {!member.avatarUrl && (member.firstName?.[0] || member.username[0].toUpperCase())}
                            </div>
                            <div className={styles.tableMemberText}>
                              <strong>{member.firstName} {member.lastName}</strong>
                              <small>{member.username}</small>
                            </div>
                          </div>
                        </td>
                        <td>{member.parish || "—"}</td>
                        <td>{member.phone || "—"}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: "#d1ae4e" }}>
                            {member.level || "Minime"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              member.status === "active"
                                ? styles.statusActive
                                : member.status === "pending"
                                  ? styles.statusPending
                                  : styles.statusSuspended
                            }`}
                          >
                            {member.status === "active" ? "Actif" : member.status === "pending" ? "En attente" : "Suspendu"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {member.status !== "active" ? (
                              <button
                                className={styles.btnApprove}
                                style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                                disabled={actionLoading}
                                onClick={() => void handleValidateUser(member.userId, "approve")}
                              >
                                Activer
                              </button>
                            ) : (
                              <button
                                className={styles.btnReject}
                                style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                                disabled={actionLoading}
                                onClick={() => void handleValidateUser(member.userId, "reject")}
                              >
                                Suspendre
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                          Aucun membre ne correspond aux critères de recherche.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ADHESIONS ET COTISATIONS */}
          {tab === "membership" && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2><i className="fa-solid fa-coins" /> Paramètres de la Cotisation Annuelle</h2>
                    <p>Le montant est uniforme pour tous les membres du mouvement.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div className={styles.formField} style={{ width: "240px" }}>
                    <label>Montant en FCFA</label>
                    <input
                      type="number"
                      min="0"
                      value={membershipFee}
                      onChange={(e) => setMembershipFee(e.target.value)}
                    />
                  </div>
                  <button className={styles.btnPrimary} onClick={handleSaveFee} disabled={actionLoading}>
                    Enregistrer le tarif
                  </button>
                </div>
              </div>

              {/* Passage de niveau */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2><i className="fa-solid fa-award" /> Accorder un Passage de Niveau</h2>
                    <p>Autorisez un membre actif à passer au niveau supérieur (Cadet, Junior, Spirituel).</p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label>Choisir un membre actif</label>
                    <select value={levelMemberId} onChange={(e) => setLevelMemberId(e.target.value)}>
                      <option value="">Sélectionner un membre</option>
                      {(summary?.members || [])
                        .filter((m) => m.status === "active")
                        .map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.firstName} {m.lastName} ({m.username}) — Actuel: {m.level || "Minime"}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label>Nouveau Niveau</label>
                    <select value={nextLevel} onChange={(e) => setNextLevel(e.target.value)}>
                      <option value="Cadet">Cadet</option>
                      <option value="Junior">Junior</option>
                      <option value="Spirituel">Spirituel</option>
                    </select>
                  </div>
                </div>
                <button
                  className={styles.btnPrimary}
                  onClick={handleGrantLevel}
                  disabled={!levelMemberId || actionLoading}
                  style={{ width: "fit-content" }}
                >
                  Valider le passage de niveau
                </button>
              </div>

              {/* Dossiers de paiement en attente */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2><i className="fa-solid fa-receipt" /> Dossiers de Paiement Soumis</h2>
                    <p>Vérifiez les paiements reçus et validez les renouvellements.</p>
                  </div>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Membre</th>
                        <th>Type</th>
                        <th>Année</th>
                        <th>Montant</th>
                        <th>Réf / Justificatif</th>
                        <th>Statut</th>
                        <th>Décision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(membership?.payments || []).map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.firstName} {p.lastName}</strong>
                            <small style={{ color: "#64748b", display: "block" }}>{p.username}</small>
                          </td>
                          <td>{p.applicationType === "new" ? "Nouvelle adhésion" : "Renouvellement"}</td>
                          <td>{p.membershipYear}</td>
                          <td><strong>{p.amountCfa.toLocaleString("fr-FR")} FCFA</strong></td>
                          <td>
                            {p.reference && <span>{p.reference} </span>}
                            {p.proofUrl && (
                              <a
                                href={p.proofUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#d1ae4e", textDecoration: "underline", marginLeft: "4px" }}
                              >
                                Preuve
                              </a>
                            )}
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                p.status === "approved"
                                  ? styles.statusActive
                                  : p.status === "pending_review"
                                    ? styles.statusPending
                                    : styles.statusSuspended
                              }`}
                            >
                              {p.status === "approved" ? "Validé" : p.status === "pending_review" ? "À vérifier" : "Refusé"}
                            </span>
                          </td>
                          <td>
                            {p.status === "pending_review" && (
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  className={styles.btnApprove}
                                  style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                  disabled={actionLoading}
                                  onClick={() => void handleReviewPayment(p.id, "approve")}
                                >
                                  Valider
                                </button>
                                <button
                                  className={styles.btnReject}
                                  style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                  disabled={actionLoading}
                                  onClick={() => void handleReviewPayment(p.id, "reject")}
                                >
                                  Refuser
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FORMATIONS */}
          {tab === "trainings" && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2><i className="fa-solid fa-graduation-cap" /> Publier une Nouvelle Formation</h2>
                    <p>Ajoutez un module ou atelier pédagogique visible par les membres et le public.</p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label>Titre de la formation</label>
                    <input
                      type="text"
                      placeholder="Ex. Leadership Chrétien et Prise de parole"
                      value={trainingTitle}
                      onChange={(e) => setTrainingTitle(e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Catégorie</label>
                    <select value={trainingCategory} onChange={(e) => setTrainingCategory(e.target.value)}>
                      <option value="minime">Minime</option>
                      <option value="cadet">Cadet</option>
                      <option value="junior">Junior</option>
                      <option value="spirituel">Spirituel</option>
                      <option value="general">Général</option>
                      <option value="documents">Documents</option>
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label>Prix (FCFA, 0 si gratuit)</label>
                    <input
                      type="number"
                      min="0"
                      value={trainingPrice}
                      onChange={(e) => setTrainingPrice(e.target.value)}
                    />
                  </div>
                  <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
                    <label>Résumé / Objectifs du module</label>
                    <textarea
                      rows={3}
                      placeholder="Décrivez les compétences développées et le contenu spirituel ou pratique..."
                      value={trainingSummary}
                      onChange={(e) => setTrainingSummary(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  className={styles.btnPrimary}
                  onClick={handleCreateTraining}
                  disabled={actionLoading}
                  style={{ width: "fit-content" }}
                >
                  <i className="fa-solid fa-plus" /> Publier la formation
                </button>
              </div>

              {/* Formations existantes */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2><i className="fa-solid fa-list-check" /> Formations Actuellement en Ligne</h2>
                    <p>{trainings.length} formation(s) publiée(s)</p>
                  </div>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainings.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <strong>{t.title}</strong>
                            <small style={{ color: "#64748b", display: "block" }}>{t.summary}</small>
                          </td>
                          <td>
                            <span style={{ textTransform: "capitalize", color: "#d1ae4e", fontWeight: 700 }}>
                              {t.category}
                            </span>
                          </td>
                          <td>{t.priceCfa === 0 ? "Gratuit" : `${t.priceCfa.toLocaleString("fr-FR")} FCFA`}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                              {t.status === "published" ? "Publié" : "Brouillon"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MESSAGES DU SITE */}
          {tab === "messages" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2><i className="fa-solid fa-inbox" /> Messages et Demandes de Contact</h2>
                  <p>Messages envoyés par les visiteurs via le formulaire de contact du site.</p>
                </div>
              </div>

              {contactMessages.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fa-solid fa-envelope-open" />
                  <p>Aucun message reçu pour le moment.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {contactMessages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        padding: "16px 20px",
                        background: msg.status === "new" ? "rgba(13, 52, 90, 0.35)" : "rgba(0, 0, 0, 0.2)",
                        border: "1px solid",
                        borderColor: msg.status === "new" ? "rgba(96, 165, 250, 0.3)" : "rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: "1rem", color: "#f8fafc" }}>{msg.subject}</strong>
                          <small style={{ color: "#94a3b8", display: "block" }}>
                            De : {msg.name} ({msg.email}) · {new Date(msg.createdAt).toLocaleDateString("fr-FR")}
                          </small>
                        </div>
                        <span
                          className={`${styles.statusBadge} ${
                            msg.status === "new" ? styles.statusPending : styles.statusActive
                          }`}
                        >
                          {msg.status === "new" ? "Nouveau" : msg.status === "read" ? "Lu" : "Répondu"}
                        </span>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.5" }}>
                        {msg.content}
                      </p>
                      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                        {msg.status === "new" && (
                          <button
                            className={styles.btnSecondary}
                            onClick={() => void handleUpdateMessage(msg.id, "read")}
                          >
                            <i className="fa-solid fa-check" /> Marquer comme lu
                          </button>
                        )}
                        <a
                          href={`mailto:${msg.email}?subject=RE: ${encodeURIComponent(msg.subject)}`}
                          className={styles.btnPrimary}
                          onClick={() => void handleUpdateMessage(msg.id, "replied")}
                        >
                          <i className="fa-solid fa-reply" /> Répondre par e-mail
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ADMINISTRATEURS */}
          {tab === "admins" && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2><i className="fa-solid fa-user-shield" /> Rôles et Permissions Administrateurs</h2>
                    <p>Attribuez des droits d&apos;administration aux membres de confiance.</p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label>Membre à nommer</label>
                    <select
                      value={adminAssignUserId}
                      onChange={(e) => setAdminAssignUserId(e.target.value)}
                    >
                      <option value="">Choisir un membre</option>
                      {(summary?.members || []).map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.firstName} {m.lastName} ({m.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label>Rôle attribué</label>
                    <select
                      value={adminAssignRole}
                      onChange={(e) => setAdminAssignRole(e.target.value)}
                    >
                      <option value="Principal admin">Principal admin (Accès complet)</option>
                      <option value="Membres">Gestionnaire des Membres</option>
                      <option value="Formations">Gestionnaire des Formations</option>
                      <option value="Agenda">Gestionnaire de l&apos;Agenda</option>
                      <option value="Médias">Gestionnaire Médias & Communication</option>
                    </select>
                  </div>
                </div>
                <button
                  className={styles.btnPrimary}
                  onClick={handleAssignRole}
                  disabled={!adminAssignUserId || actionLoading}
                  style={{ width: "fit-content" }}
                >
                  <i className="fa-solid fa-shield" /> Attribuer le rôle
                </button>
              </div>

              {/* Liste des administrateurs actuels */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2><i className="fa-solid fa-id-badge" /> Administrateurs Actuels</h2>
                    <p>Comptes disposant de prérogatives d&apos;accès à la console de gestion.</p>
                  </div>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Administrateur</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(summary?.assignedUsers || []).map((admin, idx) => (
                        <tr key={`${admin.userId}-${admin.roleName}-${idx}`}>
                          <td>
                            <strong>{admin.firstName || admin.username} {admin.lastName || ""}</strong>
                            <small style={{ color: "#64748b", display: "block" }}>{admin.username}</small>
                          </td>
                          <td>{admin.email || "—"}</td>
                          <td><span style={{ fontWeight: 700, color: "#d1ae4e" }}>{admin.roleName}</span></td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                              {admin.isPrincipal ? "Principal" : "Section"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
