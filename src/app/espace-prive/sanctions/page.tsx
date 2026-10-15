"use client";

import { useEffect, useState } from "react";
import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

type Sanction = {
  id: string;
  title: string;
  reason: string;
  status: "active" | "resolved" | "appealed";
  issuedAt: string;
  resolvedAt: string | null;
};

export default function MemberSanctionsPage() {
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadSanctions() {
      try {
        const response = await fetch("/api/member/records", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger ton historique.");
        const result = (await response.json()) as { sanctions: Sanction[] };
        if (!cancelled) setSanctions(result.sanctions);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadSanctions();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusLabels = {
    active: "En cours",
    resolved: "Clôturée",
    appealed: "Contestée",
  };

  return (
    <MemberSection title="Historique des sanctions">
      {loading && <p className={styles.empty}>Chargement de ton historique…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!loading && !error && sanctions.length === 0 && (
        <p className={styles.empty}>
          <i className="fa-solid fa-circle-check" aria-hidden="true" /> Aucune sanction enregistrée pour le moment.
        </p>
      )}
      {sanctions.map((sanction) => (
        <article className={styles.activityCard} key={sanction.id}>
          <div>
            <small className={styles.activityDate}>
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(sanction.issuedAt))}
              {sanction.resolvedAt
                ? ` · Clôturée le ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(sanction.resolvedAt))}`
                : ""}
            </small>
            <h3>{sanction.title}</h3>
            <p>{sanction.reason}</p>
          </div>
          <span className={styles.tag}>{statusLabels[sanction.status]}</span>
        </article>
      ))}
    </MemberSection>
  );
}
