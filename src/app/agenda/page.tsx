"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../components/Showcase.module.css";

type EventItem = {
  id: string;
  title: string;
  summary: string;
  location: string | null;
  facilitator: string | null;
  startsAt: string;
  endsAt: string | null;
  visibility: "public" | "members";
  registrationStatus: "registered" | "attended" | "cancelled" | null;
};

export default function AgendaPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const firstMonth = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, []);
  const [monthStart, setMonthStart] = useState(firstMonth);
  const monthEvents = useMemo(
    () =>
      events.filter((item) => {
        const date = new Date(item.startsAt);
        return (
          date.getFullYear() === monthStart.getFullYear() &&
          date.getMonth() === monthStart.getMonth()
        );
      }),
    [monthStart, events],
  );
  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  ).getDate();
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const eventsByDay = useMemo(() => {
    const grouped = new Map<number, EventItem[]>();
    for (const item of monthEvents) {
      const day = new Date(item.startsAt).getDate();
      grouped.set(day, [...(grouped.get(day) ?? []), item]);
    }
    return grouped;
  }, [monthEvents]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      if (!response.ok) throw new Error("Impossible de charger l’agenda ADS.");
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
        if (!response.ok) throw new Error("Impossible de charger l’agenda ADS.");
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
      setMessage("Ton inscription à l’activité est confirmée.");
      await loadEvents();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Inscription impossible.");
    }
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
        {loading && <p className={styles.notice}>Chargement de l’agenda…</p>}
        {error && <p className={styles.notice} role="alert">{error}</p>}
        {message && <p className={styles.notice} role="status">{message}</p>}
        {!loading && !error && events.length === 0 && (
          <p className={styles.notice}>Aucun événement à venir n’est publié pour le moment.</p>
        )}
        {!loading && !error && view === "list" && events.map((item) => {
          const date = new Date(item.startsAt);
          return (
            <article className={styles.event} key={item.id}>
              <div className={styles.date}>
                <strong>{new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(date)}</strong>
                {new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date)}
              </div>
              <div className={styles.eventDetails}>
                <h3>{item.title}</h3>
                <p><i className="fa-solid fa-location-dot" /> {item.location || "Lieu à confirmer"} · {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date)}</p>
                <p>{item.summary}</p>
              </div>
              <div className={styles.eventActions}>
                <span className={styles.tag}>{item.visibility === "members" ? "Membres ADS" : "Public"}</span>
                {item.registrationStatus === "registered" || item.registrationStatus === "attended" ? (
                  <span className={styles.tag}>Inscrit</span>
                ) : (
                  <button className={styles.button} onClick={() => void register(item.id)}>M’inscrire</button>
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
            <p className={styles.calendarSummary}>{monthEvents.length} rendez-vous ce mois-ci</p>
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
                      <span className={styles.calendarDayEvent} key={item.id} title={item.title}>{item.title}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      <section className={styles.sectionAlt}>
        <p className={styles.notice}><i className="fa-solid fa-lock" /> Certaines activités peuvent être réservées à un groupe de membres. Leur visibilité est décidée lors de la publication par l’administration.</p>
      </section>
    </main>
  );
}
