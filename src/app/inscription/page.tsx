"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function RegistrationPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      firstName: (form.get("firstName") ?? "").toString().trim(),
      lastName: (form.get("lastName") ?? "").toString().trim(),
      username: (form.get("username") ?? "").toString().trim(),
      email: (form.get("email") ?? "").toString().trim(),
      phone: (form.get("phone") ?? "").toString().trim(),
      password: (form.get("password") ?? "").toString().trim(),
    };

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.username ||
      !payload.email ||
      !payload.password
    ) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }

    if (payload.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error || "L'inscription a échoué.");
      return;
    }

    router.push("/espace-prive");
  };

  return (
    <main
      className={`${styles.modalBackdrop} ${styles.loginPage}`}
      style={{ position: "relative", minHeight: "calc(100vh - 82px)" }}
    >
      <form
        className={styles.modal}
        onSubmit={submit}
        style={{ maxWidth: 620, width: "100%" }}
      >
        <p className={styles.eyebrow}>
          <span /> Rejoins la famille ADS
        </p>
        <h2>Créer mon compte</h2>
        <p>
          Remplis tes informations pour obtenir ton espace personnel et ton
          accès ADS.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
            marginTop: 12,
          }}
        >
          <input
            name="firstName"
            placeholder="Prénom"
            autoComplete="given-name"
          />
          <input name="lastName" placeholder="Nom" autoComplete="family-name" />
        </div>

        <input
          name="username"
          placeholder="Nom d'utilisateur"
          autoComplete="username"
          style={{ marginTop: 12 }}
        />
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          style={{ marginTop: 12 }}
        />
        <input
          name="phone"
          placeholder="Téléphone"
          autoComplete="tel"
          style={{ marginTop: 12 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          autoComplete="new-password"
          style={{ marginTop: 12 }}
        />

        {error && (
          <p style={{ color: "#d75d48", fontSize: 12, marginTop: 12 }}>
            {error}
          </p>
        )}

        <button
          className={styles.primaryButton}
          type="submit"
          style={{ marginTop: 20 }}
        >
          <i className="fa-solid fa-user-plus" />{" "}
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        <Link
          href="/login"
          style={{
            display: "block",
            marginTop: 18,
            color: "#d75d48",
            fontSize: 12,
          }}
        >
          J’ai déjà un compte, me connecter
        </Link>
      </form>
    </main>
  );
}
