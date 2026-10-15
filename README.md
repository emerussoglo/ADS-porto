# ADS — Fraternité, Jeunes Leaders

Application Next.js du mouvement ADS, avec un site public, un espace membre et
un espace d’administration.

## Démarrer le projet

```bash
npm install
npm run dev
```

Pour conserver les comptes, profils, formations et notifications entre les
redémarrages, configure une base Turso dans `.env.local` avec
`TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN`. L’application accepte aussi les
alias `TURSO_URL` et `TURSO_KEY`. Ne versionne jamais ce fichier.

## Parcours d’adhésion

Le parcours `/inscription` collecte les informations personnelles, familiales et
paroissiales en plusieurs étapes. Les nouveaux comptes restent en attente et
ne peuvent accéder à l’espace membre qu’après validation manuelle du paiement
par un administrateur ayant le rôle « Membres ». Le montant annuel est
configurable dans l’onglet « Adhésions »; sa valeur initiale est de 2 000 FCFA.
Un renouvellement exige une autorisation de passage de niveau donnée par
l’administration avant l’envoi du paiement.

Les photos et justificatifs sont téléversés comme ressources privées
Cloudinary. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` et
`CLOUDINARY_API_SECRET` dans `.env.local`, puis applique la migration à la base
Turso avec `npm run db:migrate`. Ce script applique les migrations de parcours
d’adhésion et de messages du formulaire de contact; il est réexécutable et
conserve les profils et comptes existants. Les messages reçus sont consultables
et gérables dans l’onglet « Messages » de l’administration. La preuve de paiement peut être une image JPG,
PNG ou WEBP ou un PDF; elle est limitée à 5 Mo. Les photos d’identité acceptent
JPG, PNG ou WEBP jusqu’à 3 Mo.

## Espace membre et administration

- L’inscription crée un compte membre et son profil en base de données. Le
  membre peut ensuite se reconnecter avec son identifiant ou son adresse email.
- Chaque rubrique de l’espace membre possède sa propre route sous
  `/espace-prive` (profil, formations, activités, évaluations, documents,
  messages, mérites et sanctions).
- Un administrateur disposant de l’accès « Formations » peut créer une
  formation en brouillon ou la publier. La publication enregistre la formation
  et crée une notification pour chaque compte actif; elle apparaît dans la
  rubrique publique Formations et dans les espaces membres.
- La rubrique « Messages » de l’administration permet d’envoyer une notification
  à un membre actif ou à tous les membres actifs.
- Le compte membre ne peut pas modifier son niveau ADS : la progression depuis
  Minime dépend des responsables, de l’investissement, de la sagesse et des
  évaluations.

Les variables d’accès à la base doivent être fournies par l’administrateur du
projet; aucune valeur de connexion ne doit être ajoutée à ce dépôt.
