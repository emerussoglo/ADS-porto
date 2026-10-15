"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import styles from "./Home.module.css";

type PublicContent = {
  gallery: Array<{ id: string; url: string; altText: string | null }>;
  productions: Array<{ id: string; url: string; altText: string | null }>;
  merits: Array<{
    id: string;
    title: string;
    reason: string;
    distinction: string | null;
    imageUrl: string | null;
    memberName: string | null;
  }>;
  testimonials: Array<{
    id: string;
    content: string;
    rating: number;
    authorName: string;
    trainingTitle: string;
  }>;
};

const emptyContent: PublicContent = {
  gallery: [],
  productions: [],
  merits: [],
  testimonials: [],
};

export default function HomePage() {
  const [content, setContent] = useState(emptyContent);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sending, setSending] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/public/content", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Les contenus du site sont temporairement indisponibles.");
        }
        const publicData = (await response.json()) as PublicContent;
        if (!cancelled) {
          setContent(publicData);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Impossible de charger les contenus ADS.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSending(true);
    setContactError("");
    setContactMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setContactError(result.error || "Le message n’a pas pu être envoyé.");
        return;
      }
      formElement.reset();
      setContactMessage("Merci ! Ton message a été transmis à l’administration ADS.");
    } catch {
      setContactError("Le serveur ne répond pas. Réessaie dans un instant.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero} id="accueil">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><i className="fa-solid fa-cross" /> Mouvement catholique de jeunesse</p>
          <h1><span>ADS,</span><br />Fraternité, Jeunes<br />Leaders</h1>
          <p className={styles.valuesLine}><b>Service</b><span>·</span><b>Union</b><span>·</span><b>Vie exemplaire</b></p>
          <p className={styles.intro}>
            Amis de Saint Dominique Savio et Sainte Agnès. Un mouvement qui forme des jeunes leaders enracinés dans la foi, engagés pour leur communauté.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/inscription"><i className="fa-solid fa-user-plus" /> Rejoindre le mouvement</Link>
            <Link className={styles.secondaryButton} href="/about"><i className="fa-solid fa-circle-info" /> En savoir plus</Link>
          </div>
          <div className={styles.heroStats}>
            <span><b>2014</b>Année de fondation</span>
            <span><b>Porto-Novo</b>Diocèse d’origine</span>
            <span><b>Service</b>Notre engagement</span>
          </div>
        </div>
        <div className={styles.emblemWrap}>
          <div className={styles.emblemRing} />
          <Image src="/img/logo.jpeg" alt="Emblème ADS Jeunes Leaders" width={250} height={250} priority className={styles.emblem} />
        </div>
      </section>

      <section className={styles.about} id="mission">
        <div className={styles.aboutText}>
          <p className={styles.eyebrow}>Notre identité</p>
          <h2>Un mouvement qui grandit dans la foi et le service</h2>
          <p>Les ADS, Fraternité, Jeunes Leaders — Amis de Saint Dominique Savio et Sainte Agnès — est un mouvement catholique de jeunesse fondé au sein du Diocèse de Porto-Novo, Bénin.</p>
          <p>Notre mission est de former des jeunes chrétiens engagés, capables de rayonner dans leur famille, leur paroisse et leur société par la foi, le service et l&apos;exemple.</p>
          <div className={styles.levels}>
            {[
              ["Minime", "Premier niveau — Découverte et éveil", "red"],
              ["Cadet", "Deuxième niveau — Engagement et formation", "gold"],
              ["Junior / Noyau", "Troisième niveau — Leadership et service", "green"],
            ].map(([title, detail, color]) => (
              <article className={`${styles.level} ${styles[color]}`} key={title}>
                <span /><div><b>{title}</b><small>{detail}</small></div>
              </article>
            ))}
          </div>
          <Link className={styles.textLink} href="/about">Découvrir notre histoire <i className="fa-solid fa-arrow-right" /></Link>
        </div>
        <div className={styles.values}>
          {[
            ["fa-hand-holding-heart", "Service", "Se mettre au service de Dieu et de ses frères, avec générosité et désintéressement.", "red"],
            ["fa-handshake", "Union", "Construire des liens fraternels solides dans la diversité et la communion.", "gold"],
            ["fa-star", "Vie exemplaire", "Être un modèle de vertu chrétienne dans chaque aspect de la vie quotidienne.", "green"],
          ].map(([icon, title, text, color]) => (
            <article className={styles.valueCard} key={title}>
              <span className={`${styles.valueIcon} ${styles[color]}`}><i className={`fa-solid ${icon}`} /></span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.gallerySection} id="galerie">
        <header className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Nos moments</span>
          <h2>Galerie <em>photos</em></h2>
          <p>Nos activités, formations et moments de partage en images</p>
        </header>
        {content.gallery.length ? (
          <div className={styles.galleryGrid}>
            {content.gallery.slice(0, 5).map((image) => (
              <div key={image.id} className={styles.galleryImage} role="img" aria-label={image.altText || "Moment de vie ADS"} style={{ backgroundImage: `url("${image.url}")` }} />
            ))}
          </div>
        ) : (
          <div className={styles.galleryEmpty}>
            {[0, 1, 2, 3, 4].map((item) => <div key={item}><i className="fa-regular fa-image" /></div>)}
          </div>
        )}
        <div className={styles.productionHead}>
          <span className={styles.eyebrow}>Créativité</span>
          <h2>Nos <em>productions</em></h2>
          <p>Les créations artistiques et culturelles de nos membres</p>
        </div>
        <div className={styles.productionGrid}>
          {content.productions.slice(0, 3).map((production) => (
            <article className={styles.productionCard} key={production.id}>
              <video className={styles.productionVideo} controls preload="metadata">
                <source src={production.url} />
                Ton navigateur ne peut pas lire cette vidéo.
              </video>
              <div><h3>{production.altText || "Production ADS"}</h3><p>Création audiovisuelle du mouvement ADS.</p></div>
            </article>
          ))}
          {!content.productions.length && <p className={styles.emptyNote}>Les productions apparaîtront ici dès leur publication par l’administration.</p>}
        </div>
        {content.merits.length > 0 && (
          <div className={styles.merits}>
            <div className={styles.productionHead}>
              <span className={styles.eyebrow}>Reconnaissance</span>
              <h2>Nos <em>distinctions</em></h2>
            </div>
            <div className={styles.productionGrid}>
              {content.merits.slice(0, 3).map((merit) => (
                <article className={styles.productionCard} key={merit.id}>
                  <div className={styles.productionImage} style={merit.imageUrl ? { backgroundImage: `url("${merit.imageUrl}")` } : undefined}><span>{merit.distinction || "ADS"}</span></div>
                  <div><h3>{merit.title}</h3><p>{merit.reason}</p><small>{merit.memberName || "Membre ADS"}</small></div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={styles.testimonials}>
        <header className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Témoignages</span>
          <h2>Ce que disent <em>nos membres</em></h2>
        </header>
        {content.testimonials.length ? (
          <div className={styles.testimonialGrid}>
            {content.testimonials.slice(0, 3).map((item) => (
              <article className={styles.testimonial} key={item.id}>
                <div className={styles.stars} aria-label={`${item.rating} étoiles`}>{Array.from({ length: Math.min(5, Math.max(0, item.rating)) }, (_, index) => <i className="fa-solid fa-star" key={index} />)}</div>
                <blockquote>« {item.content} »</blockquote>
                <b>{item.authorName}</b><small>{item.trainingTitle}</small>
              </article>
            ))}
          </div>
        ) : <p className={styles.emptyNote}>Les témoignages de nos membres seront publiés ici après validation.</p>}
      </section>

      <section className={styles.joinBand}>
        <div><span className={styles.eyebrow}>Rejoins-nous</span><h2>Prêt à faire partie<br />de la famille ADS ?</h2><p>Rejoins des centaines de jeunes catholiques engagés pour la foi, le service et l&apos;excellence. L&apos;inscription est ouverte, commence dès maintenant.</p></div>
        <div className={styles.heroActions}><Link className={styles.goldButton} href="/inscription"><i className="fa-solid fa-user-plus" /> S’inscrire maintenant</Link><Link className={styles.secondaryButton} href="/agenda"><i className="fa-solid fa-calendar-days" /> Voir l’agenda</Link></div>
      </section>

      <section className={styles.contactSection} id="contact">
        <header className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Contact</span>
          <h2>Nous <em>contacter</em></h2>
          <p>Une question ? N’hésite pas à nous écrire</p>
        </header>
        <div className={styles.contactGrid}>
          <div className={styles.contactCards}>
            {[
              ["fa-location-dot", "Localisation", "Diocèse de Porto-Novo, Bénin", "https://maps.google.com/?q=Porto-Novo,+Benin"],
              ["fa-envelope", "Formulaire de contact", "Écris directement à l’administration ADS", "#contact-form"],
              ["fa-user-tie", "Autorité diocésaine", "Diocèse de Porto-Novo", "/about"],
            ].map(([icon, title, text, href]) => <a href={href} className={styles.contactCard} key={title}><i className={`fa-solid ${icon}`} /><span><b>{title}</b><small>{text}</small></span></a>)}
          </div>
          <form className={styles.contactForm} id="contact-form" onSubmit={submitContact}>
            <div className={styles.formRow}>
              <label>Ton nom <b>*</b><input required name="name" maxLength={120} placeholder="Ton nom complet" /></label>
              <label>Ton email <b>*</b><input required name="email" type="email" maxLength={254} placeholder="ton@email.com" /></label>
            </div>
            <label>Objet<input name="subject" maxLength={160} placeholder="Objet de ton message" /></label>
            <label>Message <b>*</b><textarea required name="message" minLength={10} maxLength={5000} rows={4} placeholder="Écris ton message ici..." /></label>
            {contactError && <p className={styles.formError} role="alert">{contactError}</p>}
            {contactMessage && <p className={styles.formSuccess} role="status">{contactMessage}</p>}
            <button className={styles.sendButton} type="submit" disabled={sending}><i className="fa-solid fa-paper-plane" /> {sending ? "Envoi en cours..." : "Envoyer le message"}</button>
          </form>
        </div>
        {loadError && <p className={styles.loadError} role="status">{loadError}</p>}
        {loading && <p className={styles.loadHint}>Actualisation des contenus ADS…</p>}
      </section>
    </main>
  );
}
