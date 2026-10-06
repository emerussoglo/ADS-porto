"use client";

import { useEffect, useState } from "react";
import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

type Training = {
  id: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  videoUrl: string | null;
  priceCfa: number;
  whatsappUrl: string | null;
};

export default function MemberTrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/trainings", { cache: "no-store" });
        if (!response.ok) throw new Error("Les formations sont indisponibles.");
        const result = (await response.json()) as { trainings: Training[] };
        if (!cancelled) setTrainings(result.trainings);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MemberSection title="Mes formations">
      {loading && <p className={styles.empty}>Chargement des formations…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!loading && !error && trainings.length === 0 && (
        <p className={styles.empty}>
          Aucune formation publiée pour le moment. Les prochaines informations apparaîtront ici.
        </p>
      )}
      {trainings.map((training) => (
        <div className={styles.row} key={training.id}>
          <div>
            <strong>{training.title}</strong>
            <small>{training.summary}</small>
          </div>
          <span className={styles.tag}>
            {training.priceCfa
              ? `${training.priceCfa.toLocaleString("fr-FR")} FCFA`
              : "Gratuit"}
          </span>
        </div>
      ))}
    </MemberSection>
  );
}
