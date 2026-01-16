# Cryptrack

Application de suivi de portefeuille crypto et calcul de l'impôt français sur les plus-values.

## Fonctionnalités

- **Suivi de portefeuille** : Suivez vos transactions BTC, ETH et SOL
- **Calcul fiscal français** : Implémentation de la méthode PAMP (Prix d'Acquisition Moyen Pondéré)
- **Génération Form 2086** : Export automatique pour la déclaration fiscale française
- **Prix en temps réel** : Intégration avec CoinGecko pour les prix actuels
- **Gains réalisés et latents** : Analyse complète de votre portefeuille

## Installation

```bash
# Cloner le dépôt
git clone git@github.com:kodelio/cryptrack.git
cd cryptrack

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et ajouter votre clé API CoinGecko
```

## Configuration

Créez un fichier `.env` à la racine du projet :

```env
COINGECKO_API_KEY=votre_clé_api_ici
```

## Données de transactions

Placez vos fichiers CSV de transactions dans le dossier `data/` :
- `data/2024.csv`
- `data/2025.csv`
- `data/2026.csv`

Format CSV requis :
```csv
type,date,timezone,received_amount,received_currency,sent_amount,sent_currency,fee_amount,fee_currency,description,address,transaction_hash,external_id
```

## Utilisation

```bash
# Démarrer le serveur de développement
yarn dev

# Construire pour la production
yarn build

# Prévisualiser le build de production
yarn preview
```

L'application sera disponible sur `http://localhost:3000`

## Pages

- **Dashboard (`/`)** : Vue d'ensemble du portefeuille et résumé fiscal
- **Transactions (`/transactions`)** : Table de toutes les transactions
- **Rapport fiscal (`/fiscal/[year]`)** : Génération du formulaire 2086
- **Analyse fiscale (`/tax/[year]`)** : Analyse détaillée par année

## Calcul fiscal

L'application utilise les règles fiscales françaises :

- **Méthode PAMP** : Prix d'acquisition moyen pondéré pour chaque crypto
- **Taux d'imposition** :
  - 2024-2025 : 30% (12,8% IR + 17,2% prélèvements sociaux)
  - 2026+ : 31,4% (12,8% IR + 18,6% prélèvements sociaux)
- **Seuil d'exonération** : 305€ de plus-values annuelles
- **Staking rewards** : Taxés uniquement à la revente (coût d'acquisition = 0€)

## Technologies

- [Nuxt 4](https://nuxt.com/) - Framework Vue.js
- [Nuxt UI](https://ui.nuxt.com/) - Composants UI
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [CoinGecko API](https://www.coingecko.com/en/api) - Prix des cryptomonnaies

## Licence

Projet privé
