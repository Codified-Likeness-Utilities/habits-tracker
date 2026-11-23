# Rituels — tracker d’habitudes

Un tracker d’habitudes simple, organisé en **rituels** (matin, après-midi, soir), avec séries,
historique et taux de constance.

- **Front** : Vite + React + TypeScript, CSS maison, déployé sur **GitHub Pages**
- **Données & auth** : **Supabase** (Postgres + Row Level Security, connexion par lien magique)
- **CI** : GitHub Actions — typecheck, tests, build, déploiement ; migrations Supabase optionnelles
- **Mode démo** : sans configuration Supabase, l’app fonctionne avec des données locales (localStorage)

## Démarrer en local

```bash
npm install
npm run dev        # mode démo si .env.local est absent
npm test
```

`npm run dev` démarre en mode démo ; pour viser le vrai projet en local, copiez `.env.production` en `.env.local`.

## Supabase

Projet : **habits-tracker** (`pvtsxoqrsqoywgrpwchx`, région Paris).
Le schéma (`supabase/migrations/`) est appliqué et la RLS a été vérifiée.

L’URL du projet et la clé *publishable* sont dans `.env.production` (utilisé par `npm run build`).
Cette clé est publique par conception : la sécurité repose sur les politiques RLS.
**Ne mettez jamais la clé secrète / `service_role` dans le front.**

Réglages à faire dans le tableau de bord (**Authentication → URL Configuration**) :

- *Site URL* : `https://romualdnave.github.io/habits-tracker/`
- *Redirect URLs* : la même URL, plus `http://localhost:5173/` pour le dev.

> La connexion utilise le flux PKCE : ouvrez le lien magique dans le même navigateur que celui
> qui a demandé l’e-mail. L’envoi d’e-mails par défaut de Supabase est limité à quelques
> messages par heure ; configurez un SMTP (Authentication → Emails) pour un usage plus large.

## Déploiement GitHub Pages

1. **Settings → Pages → Source** : choisissez **GitHub Actions**.
2. Poussez sur `main` : le workflow `CI & déploiement` vérifie, construit et publie le site.

### Migrations automatiques (optionnel)

Le workflow `Migrations Supabase` applique les nouveaux fichiers de `supabase/migrations/` à chaque
push sur `main` qui les modifie. Il reste inactif tant que ces réglages ne sont pas présents :

- variable de dépôt `SUPABASE_PROJECT_REF` = `pvtsxoqrsqoywgrpwchx` ;
- secrets `SUPABASE_ACCESS_TOKEN` (*Account → Access Tokens*) et `SUPABASE_DB_PASSWORD`.

## Modèle de données

- `habits` : nom, emoji, moment (`morning` / `afternoon` / `evening`), jours prévus (1 = lundi … 7 = dimanche), archivage doux.
- `checkins` : une ligne par habitude et par jour réalisé (clé primaire `habit_id, day`).

Chaque table est protégée par une politique RLS « propriétaire uniquement ».

## Structure

```
src/
  lib/         logique pure (dates locales, séries) + tests
  data/        accès aux données : Supabase, mode démo, hook useTracker
  components/  Aujourd’hui, Parcours, éditeur d’habitude, connexion, ciel illustré
supabase/      config CLI et migrations SQL
.github/       workflows CI/CD
```
