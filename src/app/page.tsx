"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const events = [
  {
    date: "18",
    month: "OCT",
    title: "Veillee de fraternite",
    place: "Paroisse Saint Michel",
    type: "Spirituel",
  },
  {
    date: "02",
    month: "NOV",
    title: "Leadership & service",
    place: "Maison ADS, Porto-Novo",
    type: "Formation",
  },
  {
    date: "16",
    month: "NOV",
    title: "Journee des jeunes leaders",
    place: "Diocese de Porto-Novo",
    type: "Communautaire",
  },
];

const testimonials = [
  {
    quote:
      "ADS m’a appris a prendre ma place pour servir, avec foi et simplicite.",
    name: "Grace A.",
    role: "Junior, Paroisse Saint Paul",
  },
  {
    quote:
      "On y grandit ensemble. Chaque formation devient une force pour la vie.",
    name: "Merveille K.",
    role: "Cadette, Porto-Novo",
  },
  {
    quote:
      "Une fraternite qui donne envie de construire quelque chose de plus grand.",
    name: "David S.",
    role: "Ancien membre ADS",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [session, setSession] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setHeroSlide((slide) => (slide + 1) % 2),
      6500,
    );
    return () => window.clearInterval(timer);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className={styles.page}>
      <header className={styles.navbar}>
        <button
          className={styles.brand}
          onClick={() => scrollTo("accueil")}
          aria-label="Retour en haut"
        >
          <span className={styles.brandMark}>
            <span>ADS</span>
          </span>
          <span>
            <strong>ADS</strong>
            <small>Fraternite, Jeunes Leaders</small>
          </span>
        </button>
        <nav
          className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ""}`}
        >
          <button
            className={styles.activeLink}
            onClick={() => scrollTo("accueil")}
          >
            Accueil
          </button>
          <button onClick={() => scrollTo("mission")}>Notre mission</button>
          <button onClick={() => scrollTo("parcours")}>Parcours</button>
          <button onClick={() => scrollTo("agenda")}>Agenda</button>
          <button onClick={() => scrollTo("contact")}>Contact</button>
        </nav>
        <div className={styles.navActions}>
          <button
            className={styles.loginButton}
            onClick={() => setSessionOpen(true)}
          >
            {session ? "Mon espace" : "Se connecter"}
          </button>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Ouvrir le menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </header>

      <section className={styles.hero} id="accueil">
        <div className={styles.heroSlides} aria-hidden="true">
          {["/img/hero-1.jpg", "/img/hero-2.jpg"].map((image, index) => (
            <div
              key={image}
              className={`${styles.heroSlide} ${index === heroSlide ? styles.heroSlideActive : ""}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={`${styles.eyebrow} ${styles.reveal}`}>
            <span /> Mouvement catholique de jeunesse
          </p>
          <h1 className={styles.heroTitle}>
            Servir avec foi.
            <br />
            <em>Grandir ensemble.</em>
          </h1>
          <p className={styles.heroCopy}>
            Les Amis de Saint Dominique Savio et Sainte Agnes forment une
            jeunesse engagee, fraternelle et prete a faire la difference.
          </p>
          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              onClick={() => scrollTo("contact")}
            >
              <i className="fa-solid fa-user-plus" /> Rejoindre le
              mouvement{" "}
            </button>
            <button
              className={styles.textButton}
              onClick={() => scrollTo("mission")}
            >
              <i className="fa-solid fa-compass" /> Decouvrir ADS
            </button>
          </div>
          <div className={styles.heroMeta}>
            <span>
              <b>10</b> annees de presence
            </span>
            <span>
              <b>+150</b> jeunes accompagnes
            </span>
            <span>
              <b>12</b> paroisses
            </span>
          </div>
        </div>
        <div className={styles.heroDots} aria-label="Images de la hero">
          {[0, 1].map((index) => (
            <button
              key={index}
              className={index === heroSlide ? styles.heroDotActive : ""}
              onClick={() => setHeroSlide(index)}
              aria-label={`Afficher l'image ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.statement} id="mission">
        <div className={styles.sectionLabel}>01 / L’esprit ADS</div>
        <div>
          <h2>
            Une foi qui se vit
            <br />
            <span>au quotidien.</span>
          </h2>
          <p>
            Au sein du Diocese de Porto-Novo, nous accompagnons chaque jeune sur
            un chemin de foi, de service et de leadership. Ici, la fraternite
            n’est pas un mot : c’est une maniere d’agir.
          </p>
          <button
            className={styles.arrowButton}
            onClick={() => scrollTo("parcours")}
          >
            Notre histoire <span>→</span>
          </button>
        </div>
      </section>

      <section className={styles.valuesSection}>
        <div className={styles.valuesIntro}>
          <p className={styles.eyebrow}>
            <span /> Nos fondations
          </p>
          <h2>
            Trois mots.
            <br />
            <em>Une direction.</em>
          </h2>
        </div>
        <div className={styles.valuesGrid}>
          {[
            [
              "01",
              "Service",
              "Se mettre en mouvement pour les autres, avec generosite et courage.",
              "rouge",
            ],
            [
              "02",
              "Union",
              "Construire des liens solides dans la diversite et la communion.",
              "or",
            ],
            [
              "03",
              "Vie exemplaire",
              "Faire de chaque geste un temoignage de foi et d’excellence.",
              "vert",
            ],
          ].map(([number, title, copy, color]) => (
            <article
              className={`${styles.valueCard} ${styles[color]}`}
              key={title}
            >
              <span>{number}</span>
              <i
                className={`fa-solid ${title === "Service" ? "fa-hands-holding-heart" : title === "Union" ? "fa-handshake" : "fa-star"}`}
              />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.pathSection} id="parcours">
        <div className={styles.pathHeader}>
          <div>
            <p className={styles.eyebrow}>
              <span /> Grandir par etapes
            </p>
            <h2>
              Ton parcours
              <br />
              <em>commence ici.</em>
            </h2>
          </div>
          <p>
            Chaque age a son rythme, chaque etape sa responsabilite. ADS t’aide
            a trouver ta voix et a la mettre au service de la communaute.
          </p>
        </div>
        <div className={styles.pathRail}>
          <span className={styles.railLine} />
          {[
            ["01", "Minime", "Decouvrir", "6 — 11 ans"],
            ["02", "Cadet", "S’engager", "12 — 15 ans"],
            ["03", "Junior / Noyau", "Transmettre", "16 ans et +"],
          ].map(([num, title, verb, age]) => (
            <div className={styles.pathItem} key={title}>
              <div className={styles.pathNumber}>{num}</div>
              <p>{age}</p>
              <h3>{title}</h3>
              <span>{verb}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.agendaSection} id="agenda">
        <div className={styles.sectionTop}>
          <div>
            <p className={styles.eyebrow}>
              <span /> Le calendrier
            </p>
            <h2>
              Les prochains
              <br />
              <em>rendez-vous.</em>
            </h2>
          </div>
          <button className={styles.arrowButton}>
            Voir tout l’agenda <span>→</span>
          </button>
        </div>
        <div className={styles.events}>
          {events.map((event) => (
            <article className={styles.event} key={event.title}>
              <div className={styles.eventDate}>
                <strong>{event.date}</strong>
                <span>{event.month}</span>
              </div>
              <div>
                <small>{event.type}</small>
                <h3>{event.title}</h3>
                <p>
                  <i className="fa-solid fa-location-dot" /> {event.place}
                </p>
              </div>
              <button aria-label={`Voir ${event.title}`}>
                <i className="fa-solid fa-calendar-check" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.quoteSection}>
        <div className={styles.quoteBadge}>“</div>
        <p className={styles.quote}>{testimonials[activeTestimonial].quote}</p>
        <div className={styles.quoteAuthor}>
          <span className={styles.avatar}>
            {testimonials[activeTestimonial].name.charAt(0)}
          </span>
          <span>
            <b>{testimonials[activeTestimonial].name}</b>
            <small>{testimonials[activeTestimonial].role}</small>
          </span>
        </div>
        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={index === activeTestimonial ? styles.dotActive : ""}
              onClick={() => setActiveTestimonial(index)}
              aria-label={`Temoignage ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.ctaSection} id="contact">
        <div>
          <p className={styles.eyebrow}>
            <span /> A toi de jouer
          </p>
          <h2>
            Ta place est
            <br />
            <em>parmi nous.</em>
          </h2>
          <p>
            Une question, une envie de servir ou simplement l’envie de
            rencontrer la famille ADS ? Ecris-nous.
          </p>
        </div>
        <button className={styles.primaryButton}>
          <i className="fa-solid fa-envelope" /> Nous contacter
        </button>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.brandMark}>
            <span>ADS</span>
          </span>
          <div>
            <strong>ADS</strong>
            <p>Fraternite, Jeunes Leaders</p>
          </div>
        </div>
        <div>
          <small>Nous suivre</small>
          <p className={styles.socials}>
            <a href="#contact" aria-label="Instagram">
              ig
            </a>
            <a href="#contact" aria-label="Facebook">
              fb
            </a>
            <a href="#contact" aria-label="WhatsApp">
              wa
            </a>
          </p>
        </div>
        <p className={styles.copyright}>© 2026 ADS · Porto-Novo, Benin</p>
      </footer>

      {sessionOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSessionOpen(false)}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setSessionOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
            <p className={styles.eyebrow}>
              <span /> Espace membre
            </p>
            <h2>Content de te revoir.</h2>
            <p>
              Connecte-toi pour retrouver ta carte, tes formations et tes
              messages ADS.
            </p>
            <input placeholder="Identifiant ADS" />
            <input type="password" placeholder="Mot de passe" />
            <button
              className={styles.primaryButton}
              onClick={() => {
                setSession(true);
                setSessionOpen(false);
              }}
            >
              <i className="fa-solid fa-right-to-bracket" /> Ouvrir ma session
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
