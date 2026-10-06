"use client";

import { ReactNode } from "react";
import styles from "../../app/espace-prive/PrivateSpace.module.css";

export default function MemberSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className={styles.panel}>
      <h3>{title}</h3>
      {children}
    </article>
  );
}
