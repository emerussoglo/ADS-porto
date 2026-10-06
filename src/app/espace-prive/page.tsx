"use client";

import { useMember } from "@/components/member/MemberContext";
import styles from "./PrivateSpace.module.css";

export default function MemberDashboardPage() {
  const { member, notifications } = useMember();
  const unreadCount = notifications.filter((message) => !message.readAt).length;
  const displayName = member.firstName || member.username;

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
          ["fa-calendar-check", "12", "Activités"],
          ["fa-graduation-cap", "08", "Formations"],
          ["fa-medal", "05", "Mérites"],
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
            {[
              ["Leadership & service", "02 novembre · Maison ADS"],
              ["Journée des jeunes leaders", "16 novembre · Diocèse"],
            ].map(([title, detail]) => (
              <div className={styles.row} key={title}>
                <div>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
                <span className={styles.tag}>À venir</span>
              </div>
            ))}
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
