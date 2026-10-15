"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import styles from "./Registration.module.css";

type RegistrationData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  gender: string;
  occupation: string;
  phone: string;
  continent: string;
  country: string;
  diocese: string;
  deanery: string;
  pastoralZone: string;
  parish: string;
  motherName: string;
  motherOccupation: string;
  motherPhone: string;
  fatherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  password: string;
  confirmPassword: string;
};

const initialData: RegistrationData = {
  firstName: "",
  lastName: "",
  birthDate: "",
  birthPlace: "",
  gender: "",
  occupation: "",
  phone: "",
  continent: "Afrique",
  country: "Bénin",
  diocese: "Diocèse de Porto-Novo",
  deanery: "Doyenné de Porto-Novo",
  pastoralZone: "Zone pastorale d’Anavié",
  parish: "Paroisse Sainte Parfaite d’Anavié",
  motherName: "",
  motherOccupation: "",
  motherPhone: "",
  fatherName: "",
  fatherOccupation: "",
  fatherPhone: "",
  password: "",
  confirmPassword: "",
};

const stepNames = [
  "Conditions",
  "Voie",
  "Provenance",
  "Profil",
  "Famille",
  "Identifiants",
  "Photo",
  "Paiement",
  "Confirmation",
];

type ApiResult = {
  error?: string;
  username?: string;
  personalNumber?: string;
  amountCfa?: number;
  nextLevel?: string;
  firstName?: string;
  lastName?: string;
  paymentStatus?: "pending_review" | "approved" | "rejected" | null;
  applicationType?: "new" | "renewal" | null;
  accountStatus?: "pending" | "active";
  reviewNote?: string | null;
  draft?: (Partial<RegistrationData> & {
    username: string;
    personalNumber: string;
  }) | null;
};

export default function RegistrationPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mode, setMode] = useState<"new" | "renewal">("new");
  const [renewalUsername, setRenewalUsername] = useState("");
  const [renewalPassword, setRenewalPassword] = useState("");
  const [renewalLevel, setRenewalLevel] = useState("");
  const [username, setUsername] = useState("");
  const [personalNumber, setPersonalNumber] = useState("");
  const [amountCfa, setAmountCfa] = useState(2000);
  const [applicationType, setApplicationType] = useState<"new" | "renewal">("new");
  const [paymentStatus, setPaymentStatus] = useState<"pending_review" | "approved" | "rejected" | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const passwordRules = useMemo(
    () => [
      ["Au moins 6 caractères", data.password.length >= 6],
      ["Une lettre majuscule", /[A-Z]/.test(data.password)],
      ["Un chiffre", /\d/.test(data.password)],
      ["Un caractère spécial", /[^A-Za-z0-9]/.test(data.password)],
    ] as const,
    [data.password],
  );

  useEffect(() => {
    const restoreDraft = async () => {
      try {
        const response = await fetch("/api/auth/registration", { cache: "no-store" });
        const result = (await response.json()) as ApiResult;
        if (result.username) setUsername(result.username);
        if (result.personalNumber) setPersonalNumber(result.personalNumber);
        if (result.nextLevel) setRenewalLevel(result.nextLevel);
        if (result.applicationType) setApplicationType(result.applicationType);
        if (result.paymentStatus) setPaymentStatus(result.paymentStatus);
        if (result.paymentStatus === "pending_review" || result.paymentStatus === "approved") {
          setAmountCfa(result.amountCfa ?? 2000);
          setStep(9);
        } else if (result.paymentStatus === "rejected" && result.applicationType === "renewal") {
          setMode("renewal");
          setStep(2);
          setError(
            result.reviewNote
              ? `Le renouvellement précédent a été refusé : ${result.reviewNote}`
              : "Le renouvellement précédent a été refusé. Recommence le parcours de renouvellement avec tes identifiants ADS.",
          );
        } else if (result.accountStatus === "active") {
          setMode("renewal");
          setStep(2);
        } else if (result.draft) {
          setData((current) => ({ ...current, ...result.draft }));
          setUsername(result.draft.username);
          setPersonalNumber(result.draft.personalNumber);
          setAmountCfa(result.amountCfa ?? 2000);
          if (result.paymentStatus === "rejected") {
            setStep(8);
            setError(
              result.reviewNote
                ? `Le dossier précédent a été refusé : ${result.reviewNote}`
                : "Le dossier précédent a été refusé. Corrige les éléments demandés par l’administration et retransmets ta preuve.",
            );
          } else {
            setStep(6);
          }
        } else {
          setAmountCfa(result.amountCfa ?? 2000);
        }
      } catch {
        setError("Impossible de vérifier le dossier d’inscription en cours.");
      } finally {
        setDraftLoaded(true);
      }
    };
    void restoreDraft();
  }, []);

  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const advance = async () => {
    setError("");
    if (step === 1) {
      if (!termsAccepted) {
        setError("Accepte les conditions d’adhésion pour continuer.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (mode === "new") {
        setStep(3);
        return;
      }
      await checkRenewal();
      return;
    }
    if (step === 3) {
      const fields: Array<keyof RegistrationData> = [
        "continent",
        "country",
        "diocese",
        "deanery",
        "pastoralZone",
        "parish",
      ];
      if (fields.some((field) => !data[field].trim())) {
        setError("Renseigne chaque niveau de ta provenance.");
        return;
      }
      setStep(4);
      return;
    }
    if (step === 4) {
      if (
        !data.firstName.trim() ||
        !data.lastName.trim() ||
        !data.birthDate ||
        !data.birthPlace.trim() ||
        !data.gender ||
        !data.phone.trim()
      ) {
        setError("Complète les champs obligatoires de ton profil.");
        return;
      }
      if (passwordRules.some(([, passed]) => !passed)) {
        setError("Le mot de passe ne respecte pas encore toutes les conditions.");
        return;
      }
      if (data.password !== data.confirmPassword) {
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
      setStep(5);
      return;
    }
    if (step === 5) {
      if (
        !data.motherName.trim() ||
        !data.motherPhone.trim() ||
        !data.fatherName.trim() ||
        !data.fatherPhone.trim()
      ) {
        setError("Renseigne le nom et le téléphone des deux parents ou tuteurs.");
        return;
      }
      await createDraft();
      return;
    }
    if (step === 6) {
      setStep(7);
      return;
    }
    if (step === 7) {
      if (mode === "new" && !photo) {
        setError("Ajoute une photo d’identité pour continuer.");
        return;
      }
      setStep(8);
      return;
    }
    if (step === 8) await submitPayment();
  };

  const createDraft = async () => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, termsAccepted }),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        setError(result.error || "Impossible d’enregistrer ton dossier.");
        return;
      }
      setUsername(result.username ?? "");
      setPersonalNumber(result.personalNumber ?? "");
      setAmountCfa(result.amountCfa ?? amountCfa);
      setStep(6);
    } catch {
      setError("Le serveur ne répond pas. Réessaie dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  const checkRenewal = async () => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/renewal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: renewalUsername,
          password: renewalPassword,
        }),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        setError(result.error || "Impossible de vérifier ce compte.");
        return;
      }
      setUsername(result.username ?? renewalUsername);
      setPersonalNumber(result.personalNumber ?? "");
      setRenewalLevel(result.nextLevel ?? "");
      setData((current) => ({
        ...current,
        firstName: result.firstName ?? current.firstName,
        lastName: result.lastName ?? current.lastName,
      }));
      setAmountCfa(result.amountCfa ?? 2000);
      setStep(8);
    } catch {
      setError("Le serveur ne répond pas. Réessaie dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPayment = async () => {
    if (!reference.trim() && !proof) {
      setError("Saisis une référence de paiement ou joins un justificatif.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.set("reference", reference.trim());
      if (photo) form.set("photo", photo);
      if (proof) form.set("proof", proof);
      const response = await fetch("/api/auth/registration/payment", {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        setError(result.error || "Impossible d’envoyer le dossier de paiement.");
        return;
      }
      setAmountCfa(result.amountCfa ?? amountCfa);
      setApplicationType(result.applicationType ?? "new");
      setPaymentStatus("pending_review");
      setStep(9);
    } catch {
      setError("Le serveur ne répond pas. Réessaie dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  const back = () => {
    setError("");
    if (step === 8 && mode === "renewal") setStep(2);
    else setStep((current) => Math.max(1, current - 1));
  };

  const selectedFile = (
    event: ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void,
    maxSize: number,
  ): File | null => {
    const file = event.target.files?.[0] ?? null;
    if (
      file &&
      (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type) ||
        file.size > maxSize)
    ) {
      setError(
        maxSize === 3 * 1024 * 1024
          ? "Choisis un fichier JPG, PNG ou WEBP de 3 Mo maximum."
          : "Choisis un JPG, PNG, WEBP ou PDF de 5 Mo maximum.",
      );
      event.target.value = "";
      setter(null);
      return null;
    }
    setError("");
    setter(file);
    return file;
  };

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = selectedFile(event, setPhoto, 3 * 1024 * 1024);
    setPhotoPreview("");
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhotoPreview(reader.result);
    };
    reader.onerror = () => setError("Impossible de lire la photo sélectionnée.");
    reader.readAsDataURL(file);
  };

  if (!draftLoaded) {
    return <main className={styles.loading}>Préparation de ton inscription…</main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.progress}>
        <p>ÉTAPE {step} SUR 9 — {stepNames[step - 1]}</p>
        <div className={styles.progressLine}>
          <span style={{ width: `${(step / 9) * 100}%` }} />
        </div>
        <ol aria-label="Progression de l’inscription">
          {stepNames.map((name, index) => (
            <li
              key={name}
              className={index + 1 < step ? styles.complete : index + 1 === step ? styles.current : ""}
              aria-current={index + 1 === step ? "step" : undefined}
              title={name}
            >
              {index + 1 < step ? "✓" : index + 1}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.card}>
        {step === 1 && (
          <>
            <header className={styles.heading}>
              <span className={`${styles.icon} ${styles.red}`}><i className="fa-solid fa-handshake" /></span>
              <h1>Conditions d’adhésion</h1>
              <p>Lis attentivement les engagements mutuels avant de continuer.</p>
            </header>
            <div className={styles.commitments}>
              <article>
                <h2>En rejoignant l’ADS, je m’engage à…</h2>
                {[
                  "Vivre les valeurs du mouvement : Service, Union, Vie Exemplaire.",
                  "Participer activement aux activités et formations organisées.",
                  "Respecter les règles de vie fraternelle au sein du mouvement.",
                  "Payer régulièrement ma cotisation annuelle.",
                  "Être un exemple de vie chrétienne dans ma paroisse et ma famille.",
                  "Garder confidentielles les informations internes du mouvement.",
                ].map((item) => <p key={item}><i className="fa-solid fa-circle-check" />{item}</p>)}
              </article>
              <article>
                <h2>L’ADS Jeunes Leaders s’engage à…</h2>
                {[
                  "T’accueillir avec fraternité dans la grande famille ADS.",
                  "Te fournir une formation spirituelle et humaine de qualité.",
                  "Te délivrer une carte membre officielle après validation.",
                  "Protéger tes données personnelles avec soin.",
                  "T’accompagner dans ton parcours de foi et de leadership.",
                ].map((item) => <p key={item}><i className="fa-solid fa-star" />{item}</p>)}
              </article>
            </div>
            <label className={styles.terms}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
              />
              <span>J’ai lu et j’accepte les conditions d’adhésion au mouvement <b>ADS Jeunes Leaders</b>.</span>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <header className={styles.heading}>
              <span className={styles.icon}><i className="fa-solid fa-road" /></span>
              <h1>Choisis ta voie</h1>
              <p>Première inscription ou renouvellement de ton adhésion ?</p>
            </header>
            <div className={styles.choices}>
              <button
                className={`${styles.choice} ${mode === "new" ? styles.selectedChoice : ""}`}
                onClick={() => { setMode("new"); setError(""); }}
              >
                <span><i className="fa-solid fa-user-plus" /></span>
                <b>Première inscription</b>
                <small>Tu n’as jamais été membre ADS. Crée ton profil et rejoins le mouvement.</small>
                <i className="fa-solid fa-arrow-right" />
              </button>
              <button
                className={`${styles.choice} ${mode === "renewal" ? styles.selectedChoice : ""}`}
                onClick={() => { setMode("renewal"); setError(""); }}
              >
                <span><i className="fa-solid fa-rotate" /></span>
                <b>Renouvellement</b>
                <small>Tu es déjà membre ADS. Renouvelle ton adhésion annuelle après autorisation de passage de niveau.</small>
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
            {mode === "renewal" && (
              <div className={styles.renewalBox}>
                <h2><i className="fa-solid fa-lock" /> Connexion membre — renouvellement</h2>
                <label>Ton identifiant ADS
                  <input value={renewalUsername} onChange={(event) => setRenewalUsername(event.target.value)} autoComplete="username" />
                </label>
                <label>Ton mot de passe
                  <input type="password" value={renewalPassword} onChange={(event) => setRenewalPassword(event.target.value)} autoComplete="current-password" />
                </label>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <header className={styles.heading}>
              <span className={`${styles.icon} ${styles.green}`}><i className="fa-solid fa-location-dot" /></span>
              <h1>Ta provenance</h1>
              <p>Indique ton continent, pays, diocèse, doyenné, zone pastorale et paroisse.</p>
            </header>
            <div className={styles.fields}>
              {([
                ["continent", "Continent"],
                ["country", "Pays"],
                ["diocese", "Diocèse"],
                ["deanery", "Doyenné"],
                ["pastoralZone", "Zone pastorale"],
                ["parish", "Paroisse"],
              ] as const).map(([name, label]) => (
                <label key={name}>{label} <em>*</em>
                  <input name={name} value={data[name]} onChange={update} required />
                </label>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <header className={styles.heading}>
              <span className={styles.icon}><i className="fa-solid fa-user" /></span>
              <h1>Ton profil personnel</h1>
              <p>Remplis tes informations personnelles exactes.</p>
            </header>
            <div className={styles.fields}>
              <label>Nom de famille <em>*</em><input name="lastName" value={data.lastName} onChange={update} autoComplete="family-name" required /></label>
              <label>Prénoms <em>*</em><input name="firstName" value={data.firstName} onChange={update} autoComplete="given-name" required /></label>
              <label>Date de naissance <em>*</em><input type="date" name="birthDate" value={data.birthDate} onChange={update} required /></label>
              <label>Lieu de naissance <em>*</em><input name="birthPlace" value={data.birthPlace} onChange={update} required /></label>
              <fieldset className={styles.gender}>
                <legend>Genre <em>*</em></legend>
                {["Masculin", "Féminin"].map((gender) => (
                  <button
                    type="button"
                    key={gender}
                    className={data.gender === gender ? styles.selectedChoice : ""}
                    onClick={() => setData((current) => ({ ...current, gender }))}
                  >
                    <i className={`fa-solid ${gender === "Masculin" ? "fa-mars" : "fa-venus"}`} /> {gender}
                  </button>
                ))}
              </fieldset>
              <label>Profession / Études<input name="occupation" value={data.occupation} onChange={update} /></label>
              <label>Téléphone <em>*</em><input type="tel" name="phone" value={data.phone} onChange={update} autoComplete="tel" required /></label>
              <label>Mot de passe <em>*</em><input type="password" name="password" value={data.password} onChange={update} autoComplete="new-password" required /></label>
              <div className={styles.passwordRules}>
                {passwordRules.map(([rule, passed]) => (
                  <span className={passed ? styles.rulePassed : ""} key={rule}>
                    <i className={`fa-solid ${passed ? "fa-circle-check" : "fa-circle"}`} /> {rule}
                  </span>
                ))}
              </div>
              <label>Confirmer le mot de passe <em>*</em><input type="password" name="confirmPassword" value={data.confirmPassword} onChange={update} autoComplete="new-password" required /></label>
              {data.confirmPassword && <p className={data.password === data.confirmPassword ? styles.rulePassed : styles.ruleError}>
                {data.password === data.confirmPassword ? "✓ Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
              </p>}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <header className={styles.heading}>
              <span className={`${styles.icon} ${styles.green}`}><i className="fa-solid fa-people-roof" /></span>
              <h1>Informations familiales</h1>
              <p>Renseigne les informations de tes parents ou tuteurs légaux.</p>
            </header>
            <div className={styles.familyFields}>
              <fieldset>
                <legend>Mère / Tutrice</legend>
                <label>Nom et prénoms <em>*</em><input name="motherName" value={data.motherName} onChange={update} required /></label>
                <label>Profession<input name="motherOccupation" value={data.motherOccupation} onChange={update} /></label>
                <label>Téléphone <em>*</em><input type="tel" name="motherPhone" value={data.motherPhone} onChange={update} required /></label>
              </fieldset>
              <fieldset>
                <legend>Père / Tuteur</legend>
                <label>Nom et prénoms <em>*</em><input name="fatherName" value={data.fatherName} onChange={update} required /></label>
                <label>Profession<input name="fatherOccupation" value={data.fatherOccupation} onChange={update} /></label>
                <label>Téléphone <em>*</em><input type="tel" name="fatherPhone" value={data.fatherPhone} onChange={update} required /></label>
              </fieldset>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <header className={styles.heading}>
              <span className={styles.icon}><i className="fa-solid fa-address-card" /></span>
              <h1>Tes identifiants ADS</h1>
              <p>Ces identifiants seront activés après vérification de ton paiement.</p>
            </header>
            <div className={styles.identifiers}>
              <article><small>Identifiant ADS</small><strong>{username}</strong></article>
              <article><small>Numéro personnel</small><strong>{personalNumber}</strong></article>
            </div>
            <aside className={styles.notice}>
              <i className="fa-solid fa-triangle-exclamation" />
              Note bien ces identifiants. Ils te serviront à accéder à ton espace privé une fois ton adhésion validée.
            </aside>
          </>
        )}

        {step === 7 && (
          <>
            <header className={styles.heading}>
              <span className={`${styles.icon} ${styles.red}`}><i className="fa-solid fa-camera" /></span>
              <h1>Ta photo d’identité</h1>
              <p>Dépose une photo portrait de bonne qualité pour ta carte membre.</p>
            </header>
            <div className={styles.uploadLayout}>
              <label className={styles.uploadBox}>
                {photoPreview ? <img src={photoPreview} alt="Aperçu de la photo d’identité" /> : <i className="fa-solid fa-cloud-arrow-up" />}
                <strong>{photo?.name ?? "Clique ou glisse ta photo ici"}</strong>
                <small>JPG, PNG ou WEBP — Max 3 Mo</small>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} />
              </label>
              <aside>
                <h2>Consignes pour la photo</h2>
                {[
                  "Portrait vertical (hauteur supérieure à la largeur)",
                  "Fond clair uni (blanc ou gris)",
                  "Visage bien visible et centré",
                  "Bonne luminosité, sans ombre",
                ].map((line) => <p className={styles.rulePassed} key={line}><i className="fa-solid fa-check" /> {line}</p>)}
                {["Pas de filtre ou retouche", "Pas de photo de groupe", "Pas de photo floue ou sombre", "Pas de lunettes de soleil"].map((line) => <p className={styles.ruleError} key={line}><i className="fa-solid fa-xmark" /> {line}</p>)}
              </aside>
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <header className={styles.heading}>
              <span className={styles.icon}><i className="fa-solid fa-mobile-screen-button" /></span>
              <h1>Paiement de la cotisation</h1>
              <p>Règle ta cotisation annuelle, puis transmets la référence ou le justificatif à vérifier.</p>
            </header>
            <div className={styles.paymentSummary}>
              <p>Membre <strong>{data.firstName ? `${data.firstName} ${data.lastName}` : `${data.firstName || "Membre"} ${data.lastName || ""}`}</strong></p>
              <p>Identifiant <strong>{username}</strong></p>
              {renewalLevel && <p>Niveau après validation <strong>{renewalLevel}</strong></p>}
              <hr />
              <p>Montant à payer <strong>{amountCfa.toLocaleString("fr-FR")} FCFA</strong></p>
            </div>
            <aside className={styles.notice}>
              <i className="fa-solid fa-circle-info" />
              Le paiement est vérifié manuellement par l’administration ADS. Utilise le moyen de paiement communiqué par l’ADS et conserve ta preuve.
            </aside>
            <div className={styles.paymentFields}>
              <label>Référence de paiement
                <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Ex. numéro de transaction" />
              </label>
              <label>Justificatif (facultatif si tu saisis une référence)
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => selectedFile(event, setProof, 5 * 1024 * 1024)} />
              </label>
              {proof && <small>{proof.name} — {(proof.size / 1024 / 1024).toFixed(1)} Mo</small>}
            </div>
          </>
        )}

        {step === 9 && (
          <>
            <header className={styles.heading}>
              <span className={`${styles.successIcon}`}><i className="fa-solid fa-check" /></span>
              <h1>
                {paymentStatus === "approved"
                  ? "Ton adhésion est validée !"
                  : applicationType === "renewal"
                    ? "Renouvellement transmis à l’administration !"
                    : "Dossier transmis à l’administration !"}
              </h1>
              <p>
                {paymentStatus === "approved"
                  ? applicationType === "renewal"
                    ? `Ton renouvellement au niveau ${renewalLevel || "autorisé"} a été validé.`
                    : "Ton compte est maintenant actif. Tu peux te connecter à ton espace membre."
                  : applicationType === "renewal"
                    ? "Ton renouvellement est enregistré et sera effectif après vérification du paiement."
                    : "Ton dossier est enregistré. Ton compte sera activé après vérification du paiement."}
              </p>
            </header>
            <div className={styles.identifiers}>
              <article><small>Identifiant ADS</small><strong>{username}</strong></article>
              <article><small>Numéro personnel</small><strong>{personalNumber}</strong></article>
              <article><small>Montant déclaré</small><strong>{amountCfa.toLocaleString("fr-FR")} FCFA</strong></article>
            </div>
            <p className={styles.pendingNote}>
              {paymentStatus === "approved"
                ? "Tu peux te connecter dès maintenant à ton espace privé."
                : "Tu recevras une notification lorsque l’administration aura traité ton dossier. En attendant, garde tes identifiants en lieu sûr."}
            </p>
            <Link className={styles.secondaryLink} href="/login">Accéder à la connexion</Link>
          </>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}
        {step < 9 && (
          <footer className={styles.actions}>
            {step > 1 && (
              <button className={styles.back} onClick={back} disabled={submitting}>
                <i className="fa-solid fa-arrow-left" /> Retour
              </button>
            )}
            <button className={styles.continue} onClick={() => void advance()} disabled={submitting}>
              {submitting ? "Enregistrement…" : step === 8 ? "Transmettre mon dossier" : "Continuer"}
              {!submitting && <i className="fa-solid fa-arrow-right" />}
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}
