"use client";

import { useEffect, useState } from "react";
import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

type Merit = {
  id: string;
  title: string;
  reason: string;
  distinction: string | null;
  imageUrl: string | null;
  awardedAt: string;
};

export default function MemberMeritsPage() {
  const [merits, setMerits] = useState<Merit[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadMerits() {
      try {
        const response = await fetch("/api/member/records", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger tes mérites ADS.");
        const result = (await response.json()) as { merits: Merit[] };
        if (!cancelled) setMerits(result.merits);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadMerits();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MemberSection title="Mes mérites">
      {loading && <p className={styles.empty}>Chargement de tes distinctions…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!loading && !error && merits.length === 0 && (
        <p className={styles.empty}>Aucune distinction n’est encore attribuée à ton compte.</p>
      )}
      {merits.map((merit) => (
        <article className={styles.activityCard} key={merit.id}>
          <div>
            <small className={styles.activityDate}>
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(merit.awardedAt))}
              {merit.distinction ? ` · ${merit.distinction}` : ""}
            </small>
            <h3>{merit.title}</h3>
            <p>{merit.reason}</p>
          </div>
          {merit.imageUrl && (
            <a href={merit.imageUrl} target="_blank" rel="noreferrer" className={styles.inlineLink}>
              Voir la distinction
            </a>
          )}
        </article>
      ))}
    </MemberSection>
  );
}
