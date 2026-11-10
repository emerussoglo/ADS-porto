"use client";

import { useEffect, useMemo, useState } from "react";
import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

type TrainingCategory = "junior" | "cadet" | "minime" | "spirituel" | "general" | "documents" | "avis";

type Training = {
  id: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  videoUrl: string | null;
  priceCfa: number;
  whatsappUrl: string | null;
  category: TrainingCategory;
};

type Stats = {
  totalTrainings: number;
  totalParticipants: number;
  totalDocuments: number;
  totalAvis: number;
};

const trainingCategories: { value: TrainingCategory; label: string; icon: string; color: string }[] = [
  { value: "junior", label: "Junior", icon: "fa-star", color: "green" },
  { value: "cadet", label: "Cadet", icon: "fa-person-growing", color: "gold" },
  { value: "minime", label: "Minime", icon: "fa-seedling", color: "red" },
  { value: "spirituel", label: "Spirituel", icon: "fa-cross", color: "blue" },
  { value: "general", label: "Général", icon: "fa-book", color: "purple" },
  { value: "documents", label: "Documents", icon: "fa-file-lines", color: "orange" },
  { value: "avis", label: "Avis & Témoignages", icon: "fa-comments", color: "pink" },
];

export default function MemberTrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<TrainingCategory | "all">("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/trainings", { cache: "no-store" });
        if (!response.ok) throw new Error("Les formations sont indisponibles.");
        const result = (await response.json()) as { trainings: Training[]; stats: Stats };
        if (!cancelled) {
          setTrainings(result.trainings);
          setStats(result.stats);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const filteredTrainings = useMemo(() => {
    if (activeCategory === "all") return trainings;
    return trainings.filter(t => t.category === activeCategory);
  }, [trainings, activeCategory]);

  const categoryInfo = (cat: TrainingCategory) => trainingCategories.find(c => c.value === cat);

  return (
    <MemberSection title="Mes formations">
      {/* Statistics Bar */}
      {stats && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <strong>{stats.totalTrainings}</strong>
            <span>Formations</span>
          </div>
          <div className={styles.statItem}>
            <strong>{stats.totalParticipants}</strong>
            <span>Participants</span>
          </div>
          <div className={styles.statItem}>
            <strong>{stats.totalDocuments}</strong>
            <span>Documents</span>
          </div>
          <div className={styles.statItem}>
            <strong>{stats.totalAvis}</strong>
            <span>Avis</span>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className={styles.trainingFilters} role="group" aria-label="Filtrer par catégorie de formation">
        <button
          className={`${styles.trainingFilterBtn} ${activeCategory === "all" ? styles.trainingFilterActive : ""}`}
          onClick={() => setActiveCategory("all")}
          aria-pressed={activeCategory === "all"}
        >
          <i className="fa-solid fa-list" /> Tout
        </button>
        {trainingCategories.map((cat) => (
          <button
            key={cat.value}
            className={`${styles.trainingFilterBtn} ${activeCategory === cat.value ? styles.trainingFilterActive : ""} ${styles[cat.color]}`}
            onClick={() => setActiveCategory(cat.value)}
            aria-pressed={activeCategory === cat.value}
          >
            <i className={`fa-solid ${cat.icon}`} /> {cat.label}
          </button>
        ))}
      </div>

      {loading && <p className={styles.empty}>Chargement des formations…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!loading && !error && filteredTrainings.length === 0 && (
        <p className={styles.empty}>
          {activeCategory === "all"
            ? "Aucune formation publiée pour le moment. Les prochaines informations apparaîtront ici."
            : `Aucune formation dans la catégorie "${categoryInfo(activeCategory)?.label}" pour le moment.`}
        </p>
      )}
      {filteredTrainings.map((training) => {
        const catInfo = categoryInfo(training.category);
        return (
          <div className={styles.row} key={training.id}>
            <div>
              <strong>{training.title}</strong>
              <small>{training.summary}</small>
              {catInfo && (
                <span className={`${styles.categoryBadge} ${styles[catInfo.color]}`}>
                  <i className={`fa-solid ${catInfo.icon}`} /> {catInfo.label}
                </span>
              )}
            </div>
            <span className={styles.tag}>
              {training.priceCfa
                ? `${training.priceCfa.toLocaleString("fr-FR")} FCFA`
                : "Gratuit"}
            </span>
          </div>
        );
      })}
    </MemberSection>
  );
}