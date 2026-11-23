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

Pour utiliser Supabase en local, copiez `.env.example` en `.env.local` et renseignez l’URL et la clé `anon`.

## Mise en place de Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Appliquez le schéma `supabase/migrations/20261123000000_init.sql` :
   soit en le collant dans **SQL Editor**, soit via la CLI (`supabase link` puis `supabase db push`),
   soit automatiquement par la CI (voir plus bas).
3. **Authentication → URL Configuration** :
   - *Site URL* : `https://<utilisateur>.github.io/habits-tracker/`
   - *Redirect URLs* : ajoutez la même URL, plus `http://localhost:5173/` pour le dev.
4. **Authentication → Providers → Email** : laissez activé (lien magique).

> La connexion utilise le flux PKCE : ouvrez le lien magique dans le même navigateur que celui
> qui a demandé l’e-mail.

## Déploiement GitHub Pages

1. **Settings → Pages → Source** : choisissez **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables**, ajoutez :

   | Variable              | Valeur                                    |
   | --------------------- | ----------------------------------------- |
   | `SUPABASE_URL`        | `https://xxxx.supabase.co`                |
   | `SUPABASE_ANON_KEY`   | clé `anon` / *publishable* du projet      |

   La clé `anon` est publique par conception : la sécurité repose sur les politiques RLS.
   **N’utilisez jamais la clé `service_role` côté front.**
3. Poussez sur `main` : le workflow `CI & déploiement` construit et publie le site.

### Migrations automatiques (optionnel)

Le workflow `Migrations Supabase` applique `supabase/migrations/*` à chaque push sur `main`
qui les modifie. Il est inactif tant que ces réglages ne sont pas présents :

- variable `SUPABASE_PROJECT_REF` (l’identifiant du projet, visible dans son URL) ;
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
