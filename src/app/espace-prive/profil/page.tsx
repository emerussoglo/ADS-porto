"use client";

import { useMember } from "@/components/member/MemberContext";
import styles from "../PrivateSpace.module.css";

export default function MemberProfilePage() {
  const { member } = useMember();
  const fullName =
    `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
    member.username;

  return (
    <article className={styles.panel}>
      <h3>Informations personnelles</h3>
      <dl className={styles.profileDetails}>
        <div>
          <dt>Nom complet</dt>
          <dd>{fullName}</dd>
        </div>
        <div>
          <dt>Identifiant</dt>
          <dd>{member.username}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>{member.phone || "Non renseigné"}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{member.email || "Non renseigné"}</dd>
        </div>
      </dl>
    </article>
  );
}
