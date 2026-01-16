# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cryptrack is a Nuxt 4 application for cryptocurrency portfolio tracking and French tax calculation. It helps users track BTC, ETH, and SOL transactions, calculate capital gains using the French PAMP (Prix d'Acquisition Moyen Pondéré) method, and generate Form 2086 for tax declaration.

## Development Commands

```bash
# Install dependencies
yarn install

# Start development server (hot reload at localhost:3000)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Generate static site
yarn generate
```

## Core Architecture

### Data Flow

The application follows this data flow pattern:

1. **CSV Data Source**: Transaction data is stored in `/data/{year}.csv` files (2024-2026)
2. **Server API**: Reads CSV files and exposes them via API endpoints
3. **Composables**: Process raw data and implement business logic (tax calculations, portfolio tracking)
4. **Pages/Components**: Display processed data with reactive updates

### Transaction Data Model

Transactions come in two types:
- **Trade**: Buy/Sell operations (EUR ↔ Crypto)
- **Reward**: Staking rewards (no immediate tax implications)

Key fields:
- `type`, `tradeType`, `date`
- `receivedAmount`, `receivedCurrency`
- `sentAmount`, `sentCurrency`
- `feeAmount`, `feeCurrency`

### French Tax Calculation Logic

The tax calculation in `app/composables/useTaxCalculator.ts` implements French crypto tax rules:

1. **PAMP Calculation**: Uses weighted average cost method
   - Formula: `PAMP = Total Cost / Total Amount`
   - Updated on each buy transaction
   - Fees are added to acquisition cost

2. **Capital Gains**: Calculated on sell transactions
   - Formula: `Gain = Sale Price - (PAMP × Amount Sold) - Fees`
   - Only positive gains are taxable

3. **Staking Rewards**:
   - Not taxed at reception (cost = 0 EUR)
   - Will be taxed at sale with acquisition cost of 0
   - PAMP is diluted when rewards are added to holdings

4. **Tax Rates**:
   - 2024-2025: 30% flat tax (12.8% IR + 17.2% social charges)
   - 2026+: 31.4% flat tax (12.8% IR + 18.6% social charges)
   - Exemption threshold: 305 EUR annual gains

5. **Cumulative vs Yearly**:
   - `calculateTaxSummary()`: Single year calculation
   - `calculateCumulativeSummary()`: Processes all transactions chronologically up to a given year to get correct PAMP values

### Form 2086 Generation

The `app/composables/useForm2086.ts` generates the French tax form 2086 for declaring crypto sales:
- Processes all transactions chronologically to maintain correct PAMP at each sale
- Exports CSV with all required fields (ligne 211-223)
- Tracks each sale separately as required by French tax authorities

### API Structure

Server API endpoints in `server/api/`:
- `/api/prices.get.ts`: Fetches real-time crypto prices from CoinGecko (5-min cache)
- `/api/transactions/[year].get.ts`: Reads and parses CSV files for a specific year

### Key Composables

- `useTransactions`: Fetch and parse transaction data
- `useTaxCalculator`: Implement French PAMP and capital gains calculations
- `useCryptoPrices`: Fetch current crypto prices from CoinGecko
- `usePortfolio`: Calculate portfolio values and unrealized gains
- `useForm2086`: Generate Form 2086 for tax declaration

### Environment Variables

Required in `.env`:
```
COINGECKO_API_KEY=your_api_key_here
```

Used for fetching crypto prices. API falls back to demo mode if not provided.

## Page Structure

- `/` - Dashboard with portfolio overview and tax summary
- `/transactions` - All transactions table
- `/fiscal/[year]` - Tax report for a specific year with Form 2086 generation
- `/tax/[year]` - Detailed tax analysis (year-specific calculations)

## CSV Format

Transaction CSV files must have these columns:
```
type,date,timezone,received_amount,received_currency,sent_amount,sent_currency,fee_amount,fee_currency,description,address,transaction_hash,external_id
```

## Nuxt Configuration

- Uses Nuxt UI (@nuxt/ui) for component library
- Compatibility version 4
- Dark mode is default (set in app.vue)
- Runtime config handles server-side secrets (CoinGecko API key)
