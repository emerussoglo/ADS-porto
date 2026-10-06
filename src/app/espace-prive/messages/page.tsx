"use client";

import MemberSection from "@/components/member/MemberSection";
import { useMember } from "@/components/member/MemberContext";
import styles from "../PrivateSpace.module.css";

export default function MemberMessagesPage() {
  const { notifications } = useMember();

  return (
    <MemberSection title="Messages de l’administration">
      {notifications.length === 0 ? (
        <p className={styles.empty}>
          <i className="fa-solid fa-envelope-open" aria-hidden="true" /> Aucun message reçu pour le moment.
        </p>
      ) : (
        <div className={styles.list}>
          {notifications.map((message) => (
            <div className={styles.row} key={message.id}>
              <div>
                <strong>{message.title}</strong>
                <small>{message.content}</small>
              </div>
              <span className={styles.tag}>{message.readAt ? "Lu" : "Nouveau"}</span>
            </div>
          ))}
        </div>
      )}
    </MemberSection>
  );
}
