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
