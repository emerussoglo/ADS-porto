"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../components/Showcase.module.css";

type Merit = {
  id: string;
  title: string;
  reason: string;
  distinction: string | null;
  imageUrl: string | null;
  memberName: string | null;
};

const defaultMerits: Merit[] = [
  {
    id: "dm-1",
    title: "Grand Serviteur de la Fraternité",
    reason: "Pour son dévouement exceptionnel de plus de 8 ans dans l'encadrement pédagogique des Minimes et des Cadets.",
    distinction: "Médaille d'Or du Mérite Diocésain ADS",
    imageUrl: null,
    memberName: "Fraternité Anavié",
  },
  {
    id: "dm-2",
    title: "Prix de l'Excellence & Foi Agissante",
    reason: "Major de sa promotion académique tout en maintenant une assiduité exemplaire aux messes et activités du mouvement.",
    distinction: "Félicitations du Conseil Diocésain",
    imageUrl: null,
    memberName: "Jeunesse Catholique Porto-Novo",
  },
  {
    id: "dm-3",
    title: "Distinction de l'Initiative Écologique et Sociale",
    reason: "Coordination du projet vert 'Laudato Si en Paroisse' ayant mobilisé plus de 150 jeunes de Porto-Novo.",
    distinction: "Trophée Jeune Leader Éco-Chrétien",
    imageUrl: null,
    memberName: "Cellule Sociale ADS",
  },
];

const projects = [
  {
    icon: "fa-seedling",
    title: "Projet Laudato Si' en Paroisse",
    category: "Environnement & Création",
    status: "En cours",
    description: "Reboisement d'espaces paroissiaux, sensibilisation au tri écologique et création de potagers communautaires gérés par les jeunes.",
  },
  {
    icon: "fa-graduation-cap",
    title: "Programme Fraternel de Soutien Scolaire",
    category: "Éducation & Mentorat",
    status: "Actif",
    description: "Les Juniors et aînés de l'ADS animent chaque samedi des séances gratuites de répétition et d'orientation pour les collégiens et lycéens.",
  },
  {
    icon: "fa-briefcase",
    title: "Pépinière Vie & Emploi",
    category: "Insertion Professionnelle",
    status: "Permanent",
    description: "Ateliers de rédaction de CV, simulations d'entretiens, mentorat par des professionnels catholiques et partage d'offres de stages.",
  },
  {
    icon: "fa-hands-holding-heart",
    title: "Mission Caritative de la Nativité",
    category: "Action Sociale",
    status: "Annuel",
    description: "Collecte diocésaine de vivres, kits d'hygiène et vêtements redistribués aux orphelinats et familles démunies pour Noël.",
  },
];

export default function PlusPage() {
  const [merits, setMerits] = useState<Merit[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadMerits() {
      try {
        const response = await fetch("/api/public/content", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les distinctions ADS.");
        const result = (await response.json()) as { merits: Merit[] };
        if (!cancelled) {
          setMerits(result.merits && result.merits.length > 0 ? result.merits : defaultMerits);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
          setMerits(defaultMerits);
        }
      }
    }
    void loadMerits();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={styles.page}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}><span /> Rayonnement & Engagement</p>
        <h1>L&apos;ADS<br /><em>au-delà des frontières.</em></h1>
        <p className={styles.lead}>
          Œuvres caritatives, créations artistiques, projets d&apos;impact et distinctions d&apos;excellence :
          découvrez comment les jeunes leaders incarnent leur foi au cœur de la société.
        </p>
      </section>

      {/* TRIPTYQUE VALEURS EN ACTION */}
      <section className={styles.section}>
        <div className={styles.cards}>
          {[
            {
              icon: "fa-hands-holding-heart",
              title: "Nos Œuvres Sociales",
              text: "Des actions concrètes de charité, de soutien aux malades et d'entraide communautaire menées dans tout le diocèse de Porto-Novo.",
            },
            {
              icon: "fa-palette",
              title: "Nos Créations & Culture",
              text: "Chorales, pièces théâtrales d'évangélisation, médias audiovisuels et publications portés par les talents artistiques de nos membres.",
            },
            {
              icon: "fa-diagram-project",
              title: "Nos Grands Projets",
              text: "Des initiatives d'envergure alliant formation pratique, entreprenariat chrétien et engagement pour le bien commun.",
            },
          ].map((item) => (
            <article className={styles.card} key={item.title}>
              <i className={`fa-solid ${item.icon}`} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PROJETS PHARES */}
      <section className={styles.sectionAlt}>
        <div className={styles.heading}>
          <h2>Projets & Initiatives en cours</h2>
          <p>Des actions concrètes menées par nos doyennés et nos équipes pastorales.</p>
        </div>
        <div className={styles.cards}>
          {projects.map((proj) => (
            <article className={styles.card} key={proj.title}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <i className={`fa-solid ${proj.icon}`} style={{ fontSize: "1.8rem", color: "var(--ads-gold)" }} />
                <span style={{ fontSize: "0.78rem", background: "rgba(209, 174, 78, 0.15)", color: "#d1ae4e", padding: "4px 10px", borderRadius: "99px", fontWeight: "600" }}>
                  {proj.status}
                </span>
              </div>
              <small style={{ color: "var(--ads-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.75rem", fontWeight: "700" }}>
                {proj.category}
              </small>
              <h3 style={{ marginTop: "0.35rem", marginBottom: "0.6rem" }}>{proj.title}</h3>
              <p>{proj.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HALL OF FAME / MERITES */}
      <section className={styles.section}>
        <div className={styles.heading}>
          <h2>Hall of Fame ADS</h2>
          <p>Parcours inspirants, fidélité au service et distinctions décernées par l’Aumônerie et le Conseil Diocésain.</p>
        </div>
        {error && <p className={styles.notice} role="alert">{error}</p>}
        <div className={styles.people}>
          {merits.map((merit) => (
            <article className={styles.person} key={merit.id}>
              {merit.imageUrl ? (
                <div className={styles.avatar} style={{ backgroundImage: `url("${merit.imageUrl}")` }} />
              ) : (
                <div className={styles.avatar}><i className="fa-solid fa-award" style={{ color: "var(--ads-gold)", fontSize: "1.6rem" }} /></div>
              )}
              <h3>{merit.title}</h3>
              {merit.distinction && (
                <p style={{ color: "var(--ads-gold)", fontWeight: "600", fontSize: "0.85rem", marginTop: "2px" }}>
                  {merit.distinction}
                </p>
              )}
              <small style={{ display: "block", marginTop: "6px", lineHeight: "1.5" }}>{merit.reason}</small>
              {merit.memberName && (
                <p style={{ marginTop: "8px", fontSize: "0.8rem", opacity: 0.8 }}>
                  <i className="fa-solid fa-user-tag" /> {merit.memberName}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className={styles.sectionAlt} style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Envie de porter un projet au sein de l&apos;ADS ?</h2>
        <p style={{ maxWidth: "600px", margin: "0 auto 2rem", color: "var(--ads-copy)", fontSize: "1.05rem" }}>
          Chaque jeune leader a un rôle à jouer. Rejoins une équipe paroissiale, propose une initiative ou fais grandir ta communauté.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/inscription" className={styles.buttonPrimary} style={{ textDecoration: "none" }}>
            <i className="fa-solid fa-user-plus" /> Adhérer au mouvement
          </Link>
          <Link href="/about" className={styles.buttonSecondary} style={{ textDecoration: "none" }}>
            <i className="fa-solid fa-circle-info" /> En savoir plus sur nos valeurs
          </Link>
        </div>
      </section>
    </main>
  );
}
