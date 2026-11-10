"use client";

import { useEffect, useState } from "react";
import styles from "../../components/Showcase.module.css";

type Leader = {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  imageUrl: string | null;
  type: "founder" | "spiritual" | "variable";
};

type Document = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
};

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type LevelInfo = {
  id: string;
  name: string;
  description: string;
  details: string[];
  color: string;
  icon: string;
};

const levelsData: LevelInfo[] = [
  {
    id: "minime",
    name: "Minime",
    description: "Premier niveau — Découverte et éveil",
    details: [
      "Âge : 7-11 ans",
      "Découverte de la vie fraternelle",
      "Initiation à la prière et à la Parole de Dieu",
      "Activités ludiques et éducatives",
      "Accompagnement par les ainés"
    ],
    color: "red",
    icon: "fa-seedling"
  },
  {
    id: "cadet",
    name: "Cadet",
    description: "Deuxième niveau — Engagement et formation",
    details: [
      "Âge : 12-15 ans",
      "Approfondissement de la vie spirituelle",
      "Formation au leadership chrétien",
      "Participation active aux projets du mouvement",
      "Préparation au niveau Junior"
    ],
    color: "gold",
    icon: "fa-person-growing"
  },
  {
    id: "junior",
    name: "Junior",
    description: "Troisième niveau — Leadership et service",
    details: [
      "Âge : 16-25 ans",
      "Exercice de responsabilités dans le mouvement",
      "Formation avancée et mentorat",
      "Service actif dans la paroisse et la communauté",
      "Accompagnement des plus jeunes"
    ],
    color: "green",
    icon: "fa-star"
  }
];

const faqData: FAQItem[] = [
  {
    id: "faq-1",
    question: "Qu'est-ce que l'ADS, Fraternité, Jeunes Leaders ?",
    answer: "L'ADS (Amis de Saint Dominique Savio et Sainte Agnès) est un mouvement catholique de jeunesse du Diocèse de Porto-Novo, au Bénin. Il vise à former des jeunes leaders chrétiens engagés, capables de rayonner dans leur famille, leur paroisse et leur société par la foi, le service et l'exemple."
  },
  {
    id: "faq-2",
    question: "Quels sont les conditions pour adhérer au mouvement ?",
    answer: "Pour adhérer, il faut être un jeune catholique âgé de 7 à 25 ans, accepter de vivre les valeurs du mouvement (Service, Union, Vie et Emploi), participer activement aux activités et formations, et payer la cotisation annuelle après validation du dossier par l'administration."
  },
  {
    id: "faq-3",
    question: "Comment se déroule le processus d'inscription ?",
    answer: "L'inscription se fait en ligne via le formulaire « Première inscription ». Après soumission, le dossier passe en statut « En attente de validation ». Un administrateur (membre du bureau) vérifie que le candidat appartient bien à une paroisse du diocèse et fait réellement partie du groupe avant d'approuver ou rejeter le compte."
  },
  {
    id: "faq-4",
    question: "Quels sont les différents niveaux au sein de l'ADS ?",
    answer: "Le mouvement compte trois niveaux : Minime (7-11 ans, découverte et éveil), Cadet (12-15 ans, engagement et formation) et Junior (16-25 ans, leadership et service). Chaque niveau a un parcours adapté avec des activités et formations spécifiques."
  },
  {
    id: "faq-5",
    question: "Comment accéder à l'espace privé ?",
    answer: "Une fois votre adhésion validée par l'administration, vous recevrez vos identifiants ADS (identifiant et numéro personnel). Vous pourrez alors vous connecter via la page de connexion pour accéder à votre espace privé, vos formations, vos activités et vos documents."
  },
  {
    id: "faq-6",
    question: "Les documents officiels sont-ils accessibles à tous ?",
    answer: "Oui, les documents officiels (statuts, règlements intérieurs, rapports d'activités) sont librement téléchargeables par tous les visiteurs du site, sans restriction, dans la section « Documents Officiels » de la page À propos."
  },
  {
    id: "faq-7",
    question: "Comment contacter l'administration du mouvement ?",
    answer: "Vous pouvez contacter l'administration via le formulaire de contact en bas de cette page, ou directement depuis la page d'accueil. L'administration répond généralement sous 48 heures ouvrées."
  }
];

const documentsData: Document[] = [
  {
    id: "doc-1",
    title: "Statuts de l'ADS Fraternité, Jeunes Leaders",
    description: "Les statuts officiels régissant l'organisation, le fonctionnement et la gouvernance du mouvement.",
    fileUrl: "/documents/statuts-ads.pdf",
    fileType: "PDF",
    fileSize: "245 Ko"
  },
  {
    id: "doc-2",
    title: "Règlement Intérieur",
    description: "Le règlement détaillé définissant les droits, devoirs et règles de vie des membres au sein du mouvement.",
    fileUrl: "/documents/reglement-interieur.pdf",
    fileType: "PDF",
    fileSize: "187 Ko"
  },
  {
    id: "doc-3",
    title: "Charte de la Fraternité",
    description: "Document fondateur définissant l'identité, la mission et les valeurs fondamentales de l'ADS.",
    fileUrl: "/documents/charte-fraternite.pdf",
    fileType: "PDF",
    fileSize: "312 Ko"
  },
  {
    id: "doc-4",
    title: "Guide du Membre ADS",
    description: "Manuel pratique pour accompagner chaque membre dans son parcours au sein du mouvement.",
    fileUrl: "/documents/guide-membre.pdf",
    fileType: "PDF",
    fileSize: "456 Ko"
  },
  {
    id: "doc-5",
    title: "Rapport d'Activités 2023-2024",
    description: "Bilan complet des activités, formations, camps et événements organisés durant l'année pastorale.",
    fileUrl: "/documents/rapport-activites-2023-2024.pdf",
    fileType: "PDF",
    fileSize: "1.2 Mo"
  },
  {
    id: "doc-6",
    title: "Procédure de Passage de Niveau",
    description: "Guide détaillant les critères et le processus pour passer du niveau Minime au Cadet, puis au Junior.",
    fileUrl: "/documents/procedure-passage-niveau.pdf",
    fileType: "PDF",
    fileSize: "198 Ko"
  }
];

export default function AboutPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [error, setError] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadLeaders() {
      try {
        const response = await fetch("/api/public/content", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les responsables ADS.");
        const result = (await response.json()) as { leaders: Leader[] };
        if (!cancelled) setLeaders(result.leaders);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
        }
      }
    }
    void loadLeaders();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleVideoClick = () => {
    setVideoPlaying(true);
  };

  return (
    <main className={styles.page}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}><span /> Notre histoire et nos valeurs</p>
        <h1>Une fraternité<br /><em>qui fait grandir.</em></h1>
        <p className={styles.lead}>ADS, Fraternité, Jeunes Leaders est un mouvement catholique de jeunesse du Diocèse de Porto-Novo, enraciné dans la foi, le service et l'excellence chrétienne.</p>

        {/* Devise du mouvement */}
        <div className={styles.mottoBar} aria-label="Devise du mouvement ADS">
          <span className={`${styles.mottoItem} ${styles.mottoRed}`}>Service</span>
          <span className={`${styles.mottoItem} ${styles.mottoYellow}`}>Union</span>
          <span className={`${styles.mottoItem} ${styles.mottoGreen}`}>Vie et Emploi</span>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className={styles.section}>
        <div className={styles.heading}>
          <h2>Découvrir le groupe ADS en vidéo</h2>
          <p>Un aperçu vivant de notre fraternité, nos activités et l'engagement de nos jeunes.</p>
        </div>
        <div className={styles.video}>
          {!videoPlaying ? (
            <div className={styles.videoFrame} role="button" tabIndex={0} onClick={handleVideoClick} onKeyDown={(e) => e.key === "Enter" && handleVideoClick()} aria-label="Lancer la vidéo de présentation ADS">
              <div className={styles.playButton}>
                <i className="fa-solid fa-play" aria-hidden="true" />
              </div>
              <div className={styles.videoPreview} style={{ backgroundImage: 'url("/img/hero-2.jpg")' }} />
            </div>
          ) : (
            <video
              className={styles.videoPlayer}
              controls
              autoPlay
              playsInline
              poster="/img/hero-2.jpg"
              onEnded={() => setVideoPlaying(false)}
            >
              <source src="/video/presentation-ads.mp4" type="video/mp4" />
              Votre navigateur ne peut pas lire cette vidéo.
            </video>
          )}
          <div className={styles.videoCopy}>
            <h2>Découvrir le groupe ADS</h2>
            <p>Un mouvement de jeunes enraciné dans la foi, la fraternité et le service du diocèse de Porto-Novo.</p>
          </div>
        </div>
      </section>

      {/* NOTRE MISSION SECTION */}
      <section className={styles.sectionAlt}>
        <div className={styles.heading}>
          <h2>Notre mission</h2>
          <p>Former des jeunes responsables, fraternels et capables de mettre leurs talents au service des autres.</p>
        </div>
        <div className={styles.cards}>
          {[
            { icon: "fa-hand-holding-heart", title: "Service", text: "Se mettre au service de Dieu et de ses frères, avec générosité et désintéressement.", color: "red" },
            { icon: "fa-handshake", title: "Union", text: "Construire des liens fraternels solides dans la diversité et la communion.", color: "yellow" },
            { icon: "fa-briefcase", title: "Vie et Emploi", text: "Promouvoir une vie exemplaire et l'insertion professionnelle des jeunes.", color: "green" }
          ].map((item) => (
            <article className={`${styles.card} ${styles.missionCard}`} key={item.title}>
              <div className={`${styles.missionIcon} ${styles[item.color]}`}>
                <i className={`fa-solid ${item.icon}`} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* AUTORITÉS DU MOUVEMENT */}
      <section className={styles.section}>
        <div className={styles.heading}>
          <h2>Les autorités du mouvement</h2>
          <p>Les responsables affichés sont ceux publiés par l'administration ADS.</p>
        </div>
        {error && <p className={styles.notice} role="alert">{error}</p>}
        {!error && leaders.length === 0 && <p className={styles.notice}>Les profils des responsables seront affichés dès leur publication.</p>}
        <div className={styles.people}>
          {leaders.map((leader) => (
            <article className={styles.person} key={leader.id}>
              {leader.imageUrl ? (
                <div className={styles.avatar} style={{ backgroundImage: `url("${leader.imageUrl}")` }} />
              ) : (
                <div className={styles.avatar}>{leader.name.slice(0, 1).toUpperCase()}</div>
              )}
              <h3>{leader.name}</h3>
              <p>{leader.title}</p>
              {leader.bio && <small>{leader.bio}</small>}
            </article>
          ))}
        </div>
      </section>

      {/* NIVEAUX DES ADS */}
      <section className={styles.sectionAlt}>
        <div className={styles.heading}>
          <h2>Les niveaux des ADS</h2>
          <p>Trois étapes pour grandir dans la foi, le service et le leadership.</p>
        </div>
        <div className={styles.levelsGrid}>
          {levelsData.map((level) => (
            <article className={`${styles.levelCard} ${styles[level.color]}`} key={level.id}>
              <div className={styles.levelHeader}>
                <div className={styles.levelIcon}>
                  <i className={`fa-solid ${level.icon}`} />
                </div>
                <div>
                  <h3>{level.name}</h3>
                  <p className={styles.levelSubtitle}>{level.description}</p>
                </div>
              </div>
              <ul className={styles.levelDetails}>
                {level.details.map((detail, index) => (
                  <li key={index}><i className="fa-solid fa-check" /> {detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* F.A.Q. SECTION */}
      <section className={styles.section}>
        <div className={styles.heading}>
          <h2>Foire aux questions</h2>
          <p>Réponses aux questions les plus fréquentes sur le mouvement ADS.</p>
        </div>
        <div className={styles.faq}>
          {faqData.map((faq) => (
            <details className={styles.faqItem} key={faq.id}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* DOCUMENTS OFFICIELS */}
      <section className={styles.sectionAlt}>
        <div className={styles.heading}>
          <h2>Documents officiels</h2>
          <p>Statuts, règlements et documents de référence librement téléchargeables.</p>
        </div>
        <div className={styles.documentsGrid}>
          {documentsData.map((doc) => (
            <article className={styles.documentCard} key={doc.id}>
              <div className={styles.documentIcon}>
                <i className="fa-solid fa-file-pdf" />
              </div>
              <div className={styles.documentInfo}>
                <h3>{doc.title}</h3>
                <p>{doc.description}</p>
                <span className={styles.documentMeta}>
                  <i className="fa-solid fa-file-lines" /> {doc.fileType} · {doc.fileSize}
                </span>
              </div>
              <a
                href={doc.fileUrl}
                className={styles.documentDownload}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-solid fa-download" /> Télécharger
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACT FOOTER - IDENTIQUE À LA PAGE D'ACCUEIL */}
      <section className={styles.contactSection} id="contact">
        <header className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Contact</span>
          <h2>Nous <em>contacter</em></h2>
          <p>Une question ? N'hésitez pas à nous écrire</p>
        </header>
        <div className={styles.contactGrid}>
          <div className={styles.contactCards}>
            {[
              ["fa-location-dot", "Localisation", "Diocèse de Porto-Novo, Bénin", "https://maps.google.com/?q=Porto-Novo,+Benin"],
              ["fa-envelope", "Formulaire de contact", "Écrivez directement à l'administration ADS", "#contact-form"],
              ["fa-user-tie", "Autorité diocésaine", "Diocèse de Porto-Novo", "/about"],
            ].map(([icon, title, text, href]) => (
              <a href={href} className={styles.contactCard} key={title}>
                <i className={`fa-solid ${icon}`} />
                <span><b>{title}</b><small>{text}</small></span>
              </a>
            ))}
          </div>
          <form className={styles.contactForm} id="contact-form" action="/api/contact" method="POST">
            <div className={styles.formRow}>
              <label>Votre nom <b>*</b><input required name="name" maxLength={120} placeholder="Votre nom complet" /></label>
              <label>Votre email <b>*</b><input required name="email" type="email" maxLength={254} placeholder="votre@email.com" /></label>
            </div>
            <label>Objet<input name="subject" maxLength={160} placeholder="Objet de votre message" /></label>
            <label>Message <b>*</b><textarea required name="message" minLength={10} maxLength={5000} rows={4} placeholder="Écrivez votre message ici..." /></label>
            <button className={styles.sendButton} type="submit"><i className="fa-solid fa-paper-plane" /> Envoyer le message</button>
          </form>
        </div>
      </section>
    </main>
  );
}