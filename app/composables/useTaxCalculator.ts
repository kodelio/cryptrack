import type { Transaction, TaxSummary, Holdings, StakingRewards, CryptoCurrency } from '~/types'

export function useTaxCalculator() {
  const FLAT_TAX_RATE_2024_2025 = 0.30
  const FLAT_TAX_RATE_2026 = 0.314
  const EXEMPTION_THRESHOLD = 305

  function getTaxRate(year: number): number {
    return year >= 2026 ? FLAT_TAX_RATE_2026 : FLAT_TAX_RATE_2024_2025
  }

  function calculateTaxSummary(transactions: Transaction[], year: number): TaxSummary {
    const holdings: Holdings = {
      BTC: { amount: 0, avgCost: 0, totalCost: 0 },
      ETH: { amount: 0, avgCost: 0, totalCost: 0 },
      SOL: { amount: 0, avgCost: 0, totalCost: 0 }
    }

    const stakingRewards: StakingRewards = {
      BTC: 0,
      ETH: 0,
      SOL: 0
    }

    let totalInvestedEUR = 0
    let totalFeesEUR = 0
    let taxableGains = 0

    // Filter transactions for the specific year
    const yearTransactions = transactions.filter(t => t.date.getFullYear() === year)

    for (const tx of yearTransactions) {
      if (tx.type === 'Trade' && tx.tradeType === 'Buy') {
        // Achat: EUR -> Crypto
        const crypto = tx.receivedCurrency as CryptoCurrency
        const amount = tx.receivedAmount
        const costEUR = tx.sentAmount || 0
        const feeEUR = tx.feeCurrency === 'EUR' ? tx.feeAmount : 0

        if (crypto in holdings) {
          // Calcul du PAMP (Prix d'Acquisition Moyen Pondere)
          const currentTotalCost = holdings[crypto].totalCost
          const currentAmount = holdings[crypto].amount
          const newTotalCost = currentTotalCost + costEUR + feeEUR
          const newAmount = currentAmount + amount

          holdings[crypto].amount = newAmount
          holdings[crypto].totalCost = newTotalCost
          holdings[crypto].avgCost = newAmount > 0 ? newTotalCost / newAmount : 0

          totalInvestedEUR += costEUR
          totalFeesEUR += feeEUR
        }
      } else if (tx.type === 'Trade' && tx.tradeType === 'Sell') {
        // Vente: Crypto -> EUR
        const crypto = tx.sentCurrency as CryptoCurrency
        const amountSold = tx.sentAmount || 0
        const receivedEUR = tx.receivedAmount
        const feeEUR = tx.feeCurrency === 'EUR' ? tx.feeAmount : 0

        if (crypto in holdings) {
          // Calcul de la plus-value avec la formule officielle
          // PV = Prix de cession - (PAMP * quantite vendue)
          const acquisitionCost = holdings[crypto].avgCost * amountSold
          const gain = receivedEUR - acquisitionCost - feeEUR

          if (gain > 0) {
            taxableGains += gain
          }

          // Mise a jour des holdings
          holdings[crypto].amount -= amountSold
          holdings[crypto].totalCost -= acquisitionCost

          totalFeesEUR += feeEUR
        }
      } else if (tx.type === 'Reward') {
        // Staking reward: pas d'imposition a l'acquisition
        // Le cout d'acquisition est 0, sera impose lors de la vente
        const crypto = tx.receivedCurrency as CryptoCurrency
        if (crypto in stakingRewards) {
          stakingRewards[crypto] += tx.receivedAmount
          // Ajouter aux holdings avec cout 0
          holdings[crypto].amount += tx.receivedAmount
          // Le PAMP est dilue car cout = 0
          if (holdings[crypto].amount > 0) {
            holdings[crypto].avgCost = holdings[crypto].totalCost / holdings[crypto].amount
          }
        }
      }
    }

    // Calcul de l'impot
    const taxRate = getTaxRate(year)
    const taxDue = taxableGains > EXEMPTION_THRESHOLD ? taxableGains * taxRate : 0

    return {
      year,
      totalInvestedEUR,
      totalFeesEUR,
      stakingRewards,
      holdings,
      taxableGains,
      taxDue
    }
  }

  function calculateCumulativeSummary(transactions: Transaction[], upToYear: number): TaxSummary {
    // Calculate cumulative holdings from all years up to the specified year
    const allTransactions = transactions.filter(t => t.date.getFullYear() <= upToYear)

    const holdings: Holdings = {
      BTC: { amount: 0, avgCost: 0, totalCost: 0 },
      ETH: { amount: 0, avgCost: 0, totalCost: 0 },
      SOL: { amount: 0, avgCost: 0, totalCost: 0 }
    }

    const stakingRewards: StakingRewards = {
      BTC: 0,
      ETH: 0,
      SOL: 0
    }

    let totalInvestedEUR = 0
    let totalFeesEUR = 0
    let taxableGains = 0

    // Sort transactions by date
    const sortedTransactions = [...allTransactions].sort((a, b) => a.date.getTime() - b.date.getTime())

    for (const tx of sortedTransactions) {
      if (tx.type === 'Trade' && tx.tradeType === 'Buy') {
        const crypto = tx.receivedCurrency as CryptoCurrency
        const amount = tx.receivedAmount
        const costEUR = tx.sentAmount || 0
        const feeEUR = tx.feeCurrency === 'EUR' ? tx.feeAmount : 0

        if (crypto in holdings) {
          const newTotalCost = holdings[crypto].totalCost + costEUR + feeEUR
          const newAmount = holdings[crypto].amount + amount

          holdings[crypto].amount = newAmount
          holdings[crypto].totalCost = newTotalCost
          holdings[crypto].avgCost = newAmount > 0 ? newTotalCost / newAmount : 0

          totalInvestedEUR += costEUR
          totalFeesEUR += feeEUR
        }
      } else if (tx.type === 'Trade' && tx.tradeType === 'Sell') {
        const crypto = tx.sentCurrency as CryptoCurrency
        const amountSold = tx.sentAmount || 0
        const receivedEUR = tx.receivedAmount
        const feeEUR = tx.feeCurrency === 'EUR' ? tx.feeAmount : 0

        if (crypto in holdings) {
          const acquisitionCost = holdings[crypto].avgCost * amountSold
          const gain = receivedEUR - acquisitionCost - feeEUR

          if (gain > 0) {
            taxableGains += gain
          }

          holdings[crypto].amount -= amountSold
          holdings[crypto].totalCost -= acquisitionCost
          totalFeesEUR += feeEUR
        }
      } else if (tx.type === 'Reward') {
        const crypto = tx.receivedCurrency as CryptoCurrency
        if (crypto in stakingRewards) {
          stakingRewards[crypto] += tx.receivedAmount
          holdings[crypto].amount += tx.receivedAmount
          if (holdings[crypto].amount > 0) {
            holdings[crypto].avgCost = holdings[crypto].totalCost / holdings[crypto].amount
          }
        }
      }
    }

    const taxRate = getTaxRate(upToYear)
    const taxDue = taxableGains > EXEMPTION_THRESHOLD ? taxableGains * taxRate : 0

    return {
      year: upToYear,
      totalInvestedEUR,
      totalFeesEUR,
      stakingRewards,
      holdings,
      taxableGains,
      taxDue
    }
  }

  function simulateSale(
    holdings: Holdings,
    crypto: CryptoCurrency,
    amount: number,
    priceEUR: number,
    year: number
  ): { gain: number; tax: number } {
    const acquisitionCost = holdings[crypto].avgCost * amount
    const saleValue = amount * priceEUR
    const gain = saleValue - acquisitionCost

    const taxRate = getTaxRate(year)
    const tax = gain > EXEMPTION_THRESHOLD ? gain * taxRate : 0

    return { gain, tax }
  }

  return {
    calculateTaxSummary,
    calculateCumulativeSummary,
    simulateSale,
    getTaxRate,
    EXEMPTION_THRESHOLD
  }
}
