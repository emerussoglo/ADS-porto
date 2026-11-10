"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../components/Showcase.module.css";

type EventCategory = "formation" | "reunion" | "celebration" | "camp" | "social";

type EventItem = {
  id: string;
  title: string;
  summary: string;
  location: string | null;
  facilitator: string | null;
  startsAt: string;
  endsAt: string | null;
  visibility: "public" | "members";
  category: EventCategory;
  registrationStatus: "registered" | "attended" | "cancelled" | null;
};

const categories: { value: EventCategory; label: string; icon: string }[] = [
  { value: "formation", label: "Formation", icon: "fa-graduation-cap" },
  { value: "reunion", label: "Réunion", icon: "fa-users" },
  { value: "celebration", label: "Célébration", icon: "fa-church" },
  { value: "camp", label: "Camp", icon: "fa-campground" },
  { value: "social", label: "Social", icon: "fa-heart" },
];

export default function AgendaPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">("all");

  const firstMonth = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, []);
  const [monthStart, setMonthStart] = useState(firstMonth);

  const filteredEvents = useMemo(
    () =>
      events.filter((item) => {
        if (activeCategory !== "all" && item.category !== activeCategory) return false;
        const date = new Date(item.startsAt);
        return (
          date.getFullYear() === monthStart.getFullYear() &&
          date.getMonth() === monthStart.getMonth()
        );
      }),
    [events, activeCategory, monthStart],
  );

  const allFilteredEvents = useMemo(
    () =>
      events.filter((item) => {
        if (activeCategory !== "all" && item.category !== activeCategory) return false;
        return true;
      }),
    [events, activeCategory],
  );

  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  ).getDate();
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const eventsByDay = useMemo(() => {
    const grouped = new Map<number, EventItem[]>();
    for (const item of filteredEvents) {
      const day = new Date(item.startsAt).getDate();
      grouped.set(day, [...(grouped.get(day) ?? []), item]);
    }
    return grouped;
  }, [filteredEvents]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      if (!response.ok) throw new Error("Impossible de charger l'agenda ADS.");
      const result = (await response.json()) as { events: EventItem[] };
      setEvents(result.events);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInitialEvents() {
      try {
        const response = await fetch("/api/events", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger l'agenda ADS.");
        const result = (await response.json()) as { events: EventItem[] };
        if (!cancelled) setEvents(result.events);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadInitialEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const register = async (eventId: string) => {
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const result = (await response.json()) as { error?: string };
      if (response.status === 401) {
        window.location.assign("/login?redirect=/agenda");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Inscription impossible.");
      setMessage("Ton inscription à l'activité est confirmée.");
      await loadEvents();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Inscription impossible.");
    }
  };

  const categoryIcons: Record<EventCategory, string> = {
    formation: "fa-graduation-cap",
    reunion: "fa-users",
    celebration: "fa-church",
    camp: "fa-campground",
    social: "fa-heart",
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}><span /> Événements et activités</p>
        <h1>Les prochains<br /><em>rendez-vous.</em></h1>
        <p className={styles.lead}>Retrouve les formations, célébrations, activités sociales et temps forts qui font vivre la fraternité ADS.</p>
      </section>
      <section className={styles.section}>
        <div className={styles.filters}>
          <button className={view === "list" ? styles.selected : ""} onClick={() => setView("list")}><i className="fa-solid fa-list" /> Vue liste</button>
          <button className={view === "calendar" ? styles.selected : ""} onClick={() => setView("calendar")}><i className="fa-solid fa-calendar-days" /> Calendrier</button>
        </div>

        {/* Filtres par catégorie */}
        <div className={styles.categoryFilters} role="group" aria-label="Filtrer par catégorie d'événement">
          <button
            className={`${styles.categoryBtn} ${activeCategory === "all" ? styles.categoryActive : ""}`}
            onClick={() => setActiveCategory("all")}
            aria-pressed={activeCategory === "all"}
          >
            <i className="fa-solid fa-list" /> Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`${styles.categoryBtn} ${activeCategory === cat.value ? styles.categoryActive : ""}`}
              onClick={() => setActiveCategory(cat.value)}
              aria-pressed={activeCategory === cat.value}
            >
              <i className={`fa-solid ${cat.icon}`} /> {cat.label}
            </button>
          ))}
        </div>

        {loading && <p className={styles.notice}>Chargement de l'agenda…</p>}
        {error && <p className={styles.notice} role="alert">{error}</p>}
        {message && <p className={styles.notice} role="status">{message}</p>}
        {!loading && !error && allFilteredEvents.length === 0 && (
          <p className={styles.notice}>
            {activeCategory === "all"
              ? "Aucun événement à venir n'est publié pour le moment."
              : `Aucun événement dans la catégorie "${categories.find(c => c.value === activeCategory)?.label}" pour le moment.`}
          </p>
        )}

        {!loading && !error && view === "list" && allFilteredEvents.map((item) => {
          const date = new Date(item.startsAt);
          const categoryInfo = categories.find(c => c.value === item.category);
          return (
            <article className={styles.event} key={item.id}>
              <div className={styles.date}>
                <strong>{new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(date)}</strong>
                {new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date)}
              </div>
              <div className={styles.eventDetails}>
                <div className={styles.eventHeader}>
                  <h3>{item.title}</h3>
                  <span className={`${styles.categoryTag} ${styles[item.category]}`}>
                    <i className={`fa-solid ${categoryInfo?.icon}`} /> {categoryInfo?.label}
                  </span>
                </div>
                <p><i className="fa-solid fa-location-dot" /> {item.location || "Lieu à confirmer"} · {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date)}</p>
                <p>{item.summary}</p>
              </div>
              <div className={styles.eventActions}>
                <span className={styles.tag}>{item.visibility === "members" ? "Membres ADS" : "Public"}</span>
                {item.registrationStatus === "registered" || item.registrationStatus === "attended" ? (
                  <span className={styles.tag}>Inscrit</span>
                ) : (
                  <button className={styles.button} onClick={() => void register(item.id)}>M'inscrire</button>
                )}
              </div>
            </article>
          );
        })}

        {!loading && !error && view === "calendar" && (
          <div className={styles.calendar}>
            <div className={styles.calendarControls}>
              <button
                type="button"
                aria-label="Mois précédent"
                disabled={monthStart <= firstMonth}
                onClick={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1))}
              >
                <i className="fa-solid fa-chevron-left" />
              </button>
              <h2>{new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(monthStart)}</h2>
              <button
                type="button"
                aria-label="Mois suivant"
                onClick={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1))}
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
            <p className={styles.calendarSummary}>{filteredEvents.length} rendez-vous ce mois-ci {activeCategory !== "all" && `(${categories.find(c => c.value === activeCategory)?.label})`}</p>
            <div className={styles.days}>
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <strong className={styles.calendarWeekday} key={day}>{day}</strong>
              ))}
              {Array.from({ length: leadingDays }, (_, index) => (
                <div className={styles.calendarBlank} key={`blank-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const dayEvents = eventsByDay.get(day) ?? [];
                return (
                  <div className={`${styles.calendarDate} ${dayEvents.length ? styles.calendarDateActive : ""}`} key={day}>
                    <strong>{day}</strong>
                    {dayEvents.map((item) => (
                      <span className={`${styles.calendarDayEvent} ${styles[item.category]}`} key={item.id} title={item.title}>
                        <i className={`fa-solid ${categoryIcons[item.category]}`} /> {item.title}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      <section className={styles.sectionAlt}>
        <p className={styles.notice}><i className="fa-solid fa-lock" /> Certaines activités peuvent être réservées à un groupe de membres. Leur visibilité est décidée lors de la publication par l'administration.</p>
      </section>
    </main>
  );
}