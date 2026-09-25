"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../page.module.css";

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

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("identifier"),
        password: form.get("password"),
      }),
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error || "Connexion impossible.");
      setLoading(false);
      return;
    }

    const result = (await response.json()) as { isAdmin?: boolean };
    router.push(result.isAdmin ? "/admin" : "/espace-prive");
  };

  return (
    <main
      className={`${styles.modalBackdrop} ${styles.loginPage}`}
      style={{
        position: "relative",
        minHeight: "calc(100vh - 82px)",
      }}
    >
      <form className={styles.modal} onSubmit={submit}>
        <p className={styles.eyebrow}>
          <span /> Espace membre
        </p>
        <h2>Content de te revoir.</h2>
        <p>
          Connecte-toi pour retrouver ta carte, tes formations et tes messages
          ADS.
        </p>
        <input
          name="identifier"
          placeholder="Identifiant ADS ou email"
          autoComplete="username"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          autoComplete="current-password"
        />
        {error && (
          <p style={{ color: "#d75d48", fontSize: 12, marginTop: 12 }}>
            {error}
          </p>
        )}
        <button className={styles.primaryButton} type="submit">
          <i className="fa-solid fa-right-to-bracket" />{" "}
          {loading ? "Connexion..." : "Ouvrir ma session"}
        </button>
        <Link
          href="/inscription"
          style={{
            display: "block",
            marginTop: 18,
            color: "#d75d48",
            fontSize: 12,
          }}
        >
          Créer mon compte ADS
        </Link>
      </form>
    </main>
  );
}
