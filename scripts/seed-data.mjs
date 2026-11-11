import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_KEY;

if (!url || !authToken) {
  throw new Error("Variables Turso manquantes.");
}

const client = createClient({ url, authToken });

async function seed() {
  console.log("Seeding Turso database with rich ADS content...");

  // Ensure category columns exist
  try {
    await client.execute("ALTER TABLE trainings ADD COLUMN category TEXT DEFAULT 'general'");
    console.log("Added column category to trainings");
  } catch (e) {
    // already exists
  }
  try {
    await client.execute("ALTER TABLE events ADD COLUMN category TEXT DEFAULT 'formation'");
    console.log("Added column category to events");
  } catch (e) {
    // already exists
  }

  // 1. Authorities (Les responsables du mouvement)
  const authCount = await client.execute("SELECT count(*) as c FROM authorities");
  if (authCount.rows[0].c === 0) {
    const auths = [
      {
        id: "auth-1",
        name: "Mgr Aristide Gonsallo",
        title: "Évêque de Porto-Novo",
        bio: "Pasteur et père de l’Église diocésaine de Porto-Novo, accompagnateur et parrain spirituel de la jeunesse catholique.",
        imageUrl: "/img/bishop.jpg",
        type: "spiritual",
        displayOrder: 1,
      },
      {
        id: "auth-2",
        name: "Père Aumônier Diocésain",
        title: "Aumônier Général des ADS",
        bio: "Chargé de la direction spirituelle, de la sanctification et de l’enracinement ecclésial des jeunes leaders.",
        imageUrl: null,
        type: "spiritual",
        displayOrder: 2,
      },
      {
        id: "auth-3",
        name: "Coordonnateur Général Diocésain",
        title: "Responsable Exécutif Diocésain ADS",
        bio: "Veille à la gouvernance, à la cohésion fraternelle et à l’exécution des programmes d’action du mouvement.",
        imageUrl: null,
        type: "founder",
        displayOrder: 3,
      },
      {
        id: "auth-4",
        name: "Chargée de la Pédagogie & Formation",
        title: "Responsable Nationale des Formations",
        bio: "Pilote les parcours initiatiques des Minimes, Cadets et Juniors, et coordonne le leadership chrétien.",
        imageUrl: null,
        type: "variable",
        displayOrder: 4,
      },
      {
        id: "auth-5",
        name: "Secrétaire Général & Communication",
        title: "Bureau Diocésain de Porto-Novo",
        bio: "Assure la mémoire institutionnelle, le rayonnement médiatique et la liaison avec les doyennés et paroisses.",
        imageUrl: null,
        type: "variable",
        displayOrder: 5,
      },
    ];

    for (const a of auths) {
      await client.execute({
        sql: "INSERT INTO authorities (id, name, title, bio, image_url, type, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
        args: [a.id, a.name, a.title, a.bio, a.imageUrl, a.type, a.displayOrder],
      });
    }
    console.log(`Inserted ${auths.length} authorities.`);
  }

  // 2. Trainings
  const trainCount = await client.execute("SELECT count(*) as c FROM trainings");
  if (trainCount.rows[0].c === 0) {
    const list = [
      {
        id: "tr-1",
        title: "Fondements Spirituels et Charte de l'ADS",
        summary: "Découverte complète des racines du mouvement, de la spiritualité de jeunesse et du triptyque : Service, Union, Vie et Emploi.",
        priceCfa: 0,
        category: "minime",
        status: "published",
        reportUrl: "/documents/charte-fraternite.pdf",
      },
      {
        id: "tr-2",
        title: "Leadership Chrétien et Prise de Parole en Public",
        summary: "Maîtriser l'art oratoire, vaincre le trac et savoir inspirer une équipe paroissiale à la lumière des Béatitudes.",
        priceCfa: 1500,
        category: "junior",
        status: "published",
        reportUrl: "/documents/guide-membre.pdf",
      },
      {
        id: "tr-3",
        title: "Gestion de Projet Communautaire et Social",
        summary: "De l'idée à la concrétisation sur le terrain : méthodologie de montage de projets caritatifs et écologiques paroissiaux.",
        priceCfa: 2000,
        category: "cadet",
        status: "published",
        reportUrl: "/documents/statuts-ads.pdf",
      },
      {
        id: "tr-4",
        title: "La Prière au Quotidien et Discernement Vocationnel",
        summary: "Comment nourrir sa vie d'oraison dans un monde ultra-connecté et découvrir l'appel de Dieu pour sa vie personnelle.",
        priceCfa: 0,
        category: "spirituel",
        status: "published",
        reportUrl: null,
      },
      {
        id: "tr-5",
        title: "Excellence Scolaire, Éthique et Insertion Professionnelle",
        summary: "Atelier pratique pour concilier rigueur académique, intégrité morale chrétienne et préparation au premier emploi au Bénin.",
        priceCfa: 0,
        category: "general",
        status: "published",
        reportUrl: "/documents/rapport-activites-2023-2024.pdf",
      },
      {
        id: "tr-6",
        title: "Guide de l'Animateur et Pédagogie des Minimes",
        summary: "Techniques d'animation de groupes d'enfants, jeux spirituels, chants liturgiques et encadrement bienveillant.",
        priceCfa: 1000,
        category: "documents",
        status: "published",
        reportUrl: "/documents/procedure-passage-niveau.pdf",
      },
    ];

    for (const t of list) {
      await client.execute({
        sql: "INSERT INTO trainings (id, title, summary, price_cfa, category, status, report_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        args: [t.id, t.title, t.summary, t.priceCfa, t.category, t.status, t.reportUrl],
      });
    }
    console.log(`Inserted ${list.length} trainings.`);

    // Add testimonials for trainings
    const testimonials = [
      {
        id: "testi-1",
        trainingId: "tr-2",
        authorName: "Jean-Eudes Dossou",
        rating: 5,
        content: "Cette formation a totalement transformé ma manière de prendre la parole devant notre doyenné. Une pédagogie extraordinaire !",
      },
      {
        id: "testi-2",
        trainingId: "tr-1",
        authorName: "Marie-Grâce Hounnou",
        rating: 5,
        content: "Comprendre le sens profond de Service, Union, Vie et Emploi m'a redonné un élan missionnaire incroyable.",
      },
      {
        id: "testi-3",
        trainingId: "tr-3",
        authorName: "Benoît Akplogan",
        rating: 5,
        content: "Grâce aux outils reçus, notre équipe a pu lancer une action sociale pour les personnes âgées de la paroisse.",
      },
    ];

    for (const te of testimonials) {
      await client.execute({
        sql: "INSERT INTO training_testimonials (id, training_id, author_name, rating, content, is_published) VALUES (?, ?, ?, ?, ?, 1)",
        args: [te.id, te.trainingId, te.authorName, te.rating, te.content],
      });
    }
    console.log(`Inserted ${testimonials.length} training testimonials.`);
  }

  // 3. Events (Agenda)
  const eventCount = await client.execute("SELECT count(*) as c FROM events");
  if (eventCount.rows[0].c === 0) {
    const evs = [
      {
        id: "ev-1",
        title: "Messe Diocésaine de Rentrée des ADS",
        summary: "Grande célébration eucharistique présidée par l'Aumônier diocésain, bénédiction des foulards et envoi en mission des nouveaux inscrits.",
        location: "Cathédrale Notre-Dame de Porto-Novo",
        facilitator: "Aumônerie Diocésaine",
        startsAt: "2026-11-20T09:00:00Z",
        endsAt: "2026-11-20T13:00:00Z",
        visibility: "public",
        category: "celebration",
      },
      {
        id: "ev-2",
        title: "Séminaire de Leadership & Communication Fraternelle",
        summary: "Ateliers pratiques, simulation de réunions paroissiales et partage d'expériences entre Cadets et Juniors.",
        location: "Centre Pastoral Saint-Jean de Porto-Novo",
        facilitator: "Commission Formation ADS",
        startsAt: "2026-11-28T14:30:00Z",
        endsAt: "2026-11-28T18:00:00Z",
        visibility: "public",
        category: "formation",
      },
      {
        id: "ev-3",
        title: "Camp Fraternel Diocésain des Vacances 2026",
        summary: "3 jours d'immersion, vie fraternelle, grands jeux, veillées spirituelles et feu de camp pour tous les niveaux ADS.",
        location: "Paroisse Sainte Parfaite d’Anavié",
        facilitator: "Conseil Diocésain ADS",
        startsAt: "2026-12-15T08:00:00Z",
        endsAt: "2026-12-18T17:00:00Z",
        visibility: "public",
        category: "camp",
      },
      {
        id: "ev-4",
        title: "Journée Fraternelle d'Action Caritative de Noël",
        summary: "Visite aux orphelinats, distribution de vivres et partages de sourires dans les zones pastorales du diocèse.",
        location: "Doyenné de Porto-Novo",
        facilitator: "Cellule Sociale ADS",
        startsAt: "2026-12-23T09:00:00Z",
        endsAt: "2026-12-23T16:00:00Z",
        visibility: "public",
        category: "social",
      },
      {
        id: "ev-5",
        title: "Assemblée Générale et Bilan de Mi-Parcours",
        summary: "Rencontre statutaire de tous les bureaux paroissiaux et doyennés pour l'évaluation et les perspectives.",
        location: "Salle paroissiale Saint-Joseph",
        facilitator: "Bureau Exécutif Diocésain",
        startsAt: "2027-01-10T10:00:00Z",
        endsAt: "2027-01-10T15:00:00Z",
        visibility: "members",
        category: "reunion",
      },
    ];

    for (const e of evs) {
      await client.execute({
        sql: "INSERT INTO events (id, title, summary, location, facilitator, starts_at, ends_at, visibility, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [e.id, e.title, e.summary, e.location, e.facilitator, e.startsAt, e.endsAt, e.visibility, e.category],
      });
    }
    console.log(`Inserted ${evs.length} events.`);
  }

  // 4. Merits (Hall of Fame)
  const meritCount = await client.execute("SELECT count(*) as c FROM merits");
  if (meritCount.rows[0].c === 0) {
    const mrs = [
      {
        id: "mr-1",
        title: "Grand Serviteur de la Fraternité",
        reason: "Pour son dévouement exceptionnel de plus de 8 ans dans l'encadrement pédagogique des Minimes et des Cadets.",
        distinction: "Médaille d'Or du Mérite Diocésain ADS",
        awardedAt: "2026-08-15",
        isPublic: 1,
      },
      {
        id: "mr-2",
        title: "Prix de l'Excellence & Foi Agissante",
        reason: "Major de sa promotion académique tout en maintenant une assiduité exemplaire aux messes et activités du mouvement.",
        distinction: "Félicitations du Conseil Diocésain",
        awardedAt: "2026-09-01",
        isPublic: 1,
      },
      {
        id: "mr-3",
        title: "Distinction de l'Initiative Écologique et Sociale",
        reason: "Coordination du projet vert 'Laudato Si en Paroisse' ayant mobilisé plus de 150 jeunes de Porto-Novo.",
        distinction: "Trophée Jeune Leader Éco-Chrétien",
        awardedAt: "2026-10-04",
        isPublic: 1,
      },
    ];

    for (const m of mrs) {
      await client.execute({
        sql: "INSERT INTO merits (id, title, reason, distinction, awarded_at, is_public) VALUES (?, ?, ?, ?, ?, ?)",
        args: [m.id, m.title, m.reason, m.distinction, m.awardedAt, m.isPublic],
      });
    }
    console.log(`Inserted ${mrs.length} merits.`);
  }

  console.log("Seeding complete!");
}

seed()
  .catch(console.error)
  .finally(() => client.close());
