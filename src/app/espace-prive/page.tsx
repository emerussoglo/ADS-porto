"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMember } from "@/components/member/MemberContext";
import styles from "./PrivateSpace.module.css";

type Overview = {
  activities: Array<{
    id: string;
    title: string;
    summary: string;
    location: string | null;
    startsAt: string;
  }>;
  counts: { activities: number; trainings: number; merits: number };
};

export default function MemberDashboardPage() {
  const { member, notifications } = useMember();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewError, setOverviewError] = useState("");
  const unreadCount = notifications.filter((message) => !message.readAt).length;
  const displayName = member.firstName || member.username;

  useEffect(() => {
    let cancelled = false;
    async function loadOverview() {
      try {
        const response = await fetch("/api/member/overview", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les activités du compte.");
        const result = (await response.json()) as Overview;
        if (!cancelled) setOverview(result);
      } catch (error) {
        if (!cancelled) {
          setOverviewError(error instanceof Error ? error.message : "Erreur de chargement.");
        }
      }
    }
    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className={styles.welcome}>
        <div>
          <h2>Bienvenue, {displayName}</h2>
          <p>Retrouve ici ton parcours et les actualités de la famille ADS.</p>
        </div>
        <i className="fa-solid fa-star" aria-hidden="true" />
      </section>
 
      <div className={styles.stats}>
        {[
          ["fa-calendar-check", String(overview?.counts.activities ?? "—"), "Activités"],
          ["fa-graduation-cap", String(overview?.counts.trainings ?? "—"), "Formations"],
          ["fa-medal", String(overview?.counts.merits ?? "—"), "Mérites"],
          ["fa-envelope", String(notifications.length).padStart(2, "0"), "Messages"],
        ].map(([icon, value, label]) => (
          <article className={styles.stat} key={label}>
            <i className={`fa-solid ${icon}`} aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>

      <div className={styles.overview}>
        <article className={styles.memberCard}>
          <small>Carte membre officielle</small>
          <h2>
            ADS ·{" "}
            {member.firstName && member.lastName
              ? `${member.firstName} ${member.lastName}`
              : member.username}
          </h2>
          <p>
            {member.level === "Membre" ? "Minime" : member.level || "Minime"} ·{" "}
            {member.parish || "Paroisse à préciser"}
          </p>
          <span className={styles.memberId}>{member.personalNumber}</span>
        </article>

        <article className={styles.panel}>
          <h3>Prochain rendez-vous</h3>
          <div className={styles.list}>
            {overviewError && <p className={styles.error} role="alert">{overviewError}</p>}
            {overview?.activities.map((activity) => (
              <div className={styles.row} key={activity.id}>
                <div>
                  <strong>{activity.title}</strong>
                  <small>
                    {new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(activity.startsAt))}
                    {activity.location ? ` · ${activity.location}` : ""}
                  </small>
                </div>
                <span className={styles.tag}>Inscrit</span>
              </div>
            ))}
            {overview && overview.activities.length === 0 && (
              <p className={styles.empty}>Aucune activité à venir où tu es inscrit.</p>
            )}
            <Link className={styles.inlineLink} href="/espace-prive/activites">
              Découvrir les activités <i className="fa-solid fa-arrow-right" />
            </Link>
            {notifications.length > 0 && (
              <p className={styles.notificationHint}>
                Tu as {unreadCount} nouvelle(s) information(s) ADS. Consulte la
                rubrique « Messages admin ».
              </p>
            )}
          </div>
        </article>
      </div>
    </>
  );
}
