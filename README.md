# Fréquences Croisées

Site de l’association Fréquences Croisées, dédiée aux rencontres entre musiciens amateurs à Précy-sur-Oise et aux alentours.

## Stack

- Astro 7, rendu Node (`@astrojs/node`)
- HTML/CSS sans dépendance front-end
- API prête à étendre via `src/pages/*.ts` (sonde : `/health.json`)
- Docker multi-stage pour Coolify

## Développement

```bash
npm ci
npm run dev
npm test
```

Le serveur de production écoute sur `PORT` (4321 par défaut) et `HOST=0.0.0.0`.

## Déploiement

La branche `main` est la branche de déploiement. Coolify construit le `Dockerfile` à chaque push reçu depuis GitHub.
