"use client";

import { useCallback, useEffect, useState } from "react";
import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

type Activity = {
  id: string;
  title: string;
  summary: string;
  location: string | null;
  startsAt: string;
  visibility: "public" | "members";
  registrationStatus: "registered" | "attended" | "cancelled" | null;
};

export default function MemberActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      if (!response.ok) throw new Error("Impossible de charger les activités.");
      const result = (await response.json()) as { events: Activity[] };
      setActivities(result.events);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInitialActivities() {
      try {
        const response = await fetch("/api/events", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les activités.");
        const result = (await response.json()) as { events: Activity[] };
        if (!cancelled) setActivities(result.events);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadInitialActivities();
    return () => {
      cancelled = true;
    };
  }, []);

  const register = async (eventId: string) => {
    setSavingId(eventId);
    setError("");
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Inscription impossible.");
      await loadActivities();
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Inscription impossible.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <MemberSection title="Mes activités">
      {loading && <p className={styles.empty}>Chargement des activités…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!loading && !error && activities.length === 0 && (
        <p className={styles.empty}>Aucune activité à venir n’est publiée pour le moment.</p>
      )}
      {activities.map((activity) => (
        <article className={styles.activityCard} key={activity.id}>
          <div>
            <small className={styles.activityDate}>
              {new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(activity.startsAt))}
              {activity.location ? ` · ${activity.location}` : ""}
            </small>
            <h3>{activity.title}</h3>
            <p>{activity.summary}</p>
          </div>
          <div className={styles.activityAction}>
            <span className={styles.tag}>
              {activity.registrationStatus === "registered" || activity.registrationStatus === "attended"
                ? "Inscrit"
                : activity.visibility === "members" ? "Membres ADS" : "Ouvert"}
            </span>
            {activity.registrationStatus !== "registered" && activity.registrationStatus !== "attended" && (
              <button
                className={styles.actionButton}
                onClick={() => void register(activity.id)}
                disabled={savingId === activity.id}
              >
                {savingId === activity.id ? "Inscription…" : "M’inscrire"}
              </button>
            )}
          </div>
        </article>
      ))}
    </MemberSection>
  );
}
