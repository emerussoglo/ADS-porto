"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./Login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (!form.get("identifier") || !form.get("password")) {
      setError("Entre ton identifiant et ton mot de passe.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("identifier"),
          password: form.get("password"),
        }),
      });

      const result = (await response.json()) as { error?: string; isAdmin?: boolean };
      if (!response.ok) {
        setError(result.error || "Connexion impossible.");
        return;
      }

      router.push(result.isAdmin ? "/admin" : "/espace-prive");
    } catch {
      setError("Le service de connexion ne répond pas. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandSide}>
        <Link href="/" className={styles.brand}>
          <Image src="/img/logo.jpeg" alt="Emblème ADS" width={50} height={50} className={styles.logo} />
          <span><strong>ADS</strong><small>Fraternité · Jeunes Leaders</small></span>
        </Link>
        <div className={styles.mottoBar}>
          <span className={`${styles.mottoItem} ${styles.mottoRed}`}>Service</span>
          <span className={`${styles.mottoItem} ${styles.mottoYellow}`}>Union</span>
          <span className={`${styles.mottoItem} ${styles.mottoGreen}`}>Vie et Emploi</span>
        </div>
        <div className={styles.welcome}>
          <span className={styles.eyebrow}>Espace membre ADS</span>
          <h1>Content de te<br />revoir dans la<br /><em>fraternité.</em></h1>
          <p>Connecte-toi pour retrouver ta carte membre, tes formations, tes activités et les informations partagées par l’administration.</p>
          <div className={styles.values}>
            <span><i className="fa-solid fa-cross" /> Foi</span>
            <span><i className="fa-solid fa-hand-holding-heart" /> Service</span>
            <span><i className="fa-solid fa-people-group" /> Union</span>
          </div>
        </div>
        <footer>
          <Link href="/" className={styles.homeLink}>
            <i className="fa-solid fa-house" /> Retour à l’accueil
          </Link>
          <span>© {new Date().getFullYear()} ADS, Fraternité, Jeunes Leaders</span>
        </footer>
      </section>
      <section className={styles.formSide}>
        <div className={styles.card}>
          <div className={styles.cardIcon}><i className="fa-solid fa-shield-halved" /></div>
          <p className={styles.eyebrow}>Connexion sécurisée</p>
          <h2>Ouvrir ma session</h2>
          <p className={styles.intro}>Utilise ton identifiant ADS ou l’adresse email associée à ton compte.</p>
          <form className={styles.form} onSubmit={submit}>
            <label>
              Identifiant ou email
              <input name="identifier" required placeholder="Identifiant ADS ou email" autoComplete="username" />
            </label>
            <label>
              Mot de passe
              <input name="password" type="password" required placeholder="Ton mot de passe" autoComplete="current-password" />
            </label>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={styles.submit} type="submit" disabled={loading}>
              <i className="fa-solid fa-right-to-bracket" /> {loading ? "Connexion..." : "Ouvrir ma session"}
            </button>
          </form>
          <p className={styles.help}>Compte en attente ou mot de passe oublié ? Contacte l’administration depuis le <Link href="/#contact">formulaire de contact</Link>.</p>
          <Link href="/inscription" className={styles.register}>Pas encore membre ? Créer mon compte ADS</Link>
        </div>
      </section>
    </main>
  );
}
