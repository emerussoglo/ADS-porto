"use client";

import { useEffect, useState } from "react";
import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

type MemberDocument = {
  id: string;
  url: string;
  name: string | null;
  createdAt: string;
};

export default function MemberDocumentsPage() {
  const [documents, setDocuments] = useState<MemberDocument[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadDocuments() {
      try {
        const response = await fetch("/api/member/documents", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger tes documents.");
        const result = (await response.json()) as { documents: MemberDocument[] };
        if (!cancelled) setDocuments(result.documents);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadDocuments();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MemberSection title="Mes documents">
      {loading && <p className={styles.empty}>Chargement de tes documents…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!loading && !error && documents.length === 0 && (
        <p className={styles.empty}>Aucun document associé à ton compte pour le moment.</p>
      )}
      {documents.map((document) => (
        <article className={styles.activityCard} key={document.id}>
          <div>
            <small className={styles.activityDate}>
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(document.createdAt))}
            </small>
            <h3>{document.name || "Document ADS"}</h3>
          </div>
          <a className={styles.inlineLink} href={document.url} target="_blank" rel="noreferrer">
            Ouvrir le document <i className="fa-solid fa-arrow-up-right-from-square" />
          </a>
        </article>
      ))}
    </MemberSection>
  );
}
