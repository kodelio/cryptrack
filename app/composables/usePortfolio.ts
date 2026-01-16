import type { Holdings, CryptoPrices, PortfolioValue, CryptoCurrency } from '~/types'

export function usePortfolio() {
  function calculatePortfolioValues(
    holdings: Holdings,
    prices: CryptoPrices
  ): PortfolioValue[] {
    const cryptos: CryptoCurrency[] = ['BTC', 'ETH', 'SOL']

    return cryptos.map(crypto => {
      const holding = holdings[crypto]
      const currentPrice = prices[crypto]
      const currentValue = holding.amount * currentPrice
      const unrealizedGain = currentValue - holding.totalCost
      const unrealizedGainPercent = holding.totalCost > 0
        ? (unrealizedGain / holding.totalCost) * 100
        : 0

      return {
        crypto,
        amount: holding.amount,
        avgCost: holding.avgCost,
        totalCost: holding.totalCost,
        currentPrice,
        currentValue,
        unrealizedGain,
        unrealizedGainPercent
      }
    }).filter(p => p.amount > 0)
  }

  function calculateTotalPortfolioValue(portfolioValues: PortfolioValue[]): number {
    return portfolioValues.reduce((sum, p) => sum + p.currentValue, 0)
  }

  function calculateTotalUnrealizedGain(portfolioValues: PortfolioValue[]): number {
    return portfolioValues.reduce((sum, p) => sum + p.unrealizedGain, 0)
  }

  function calculateTotalCost(portfolioValues: PortfolioValue[]): number {
    return portfolioValues.reduce((sum, p) => sum + p.totalCost, 0)
  }

  return {
    calculatePortfolioValues,
    calculateTotalPortfolioValue,
    calculateTotalUnrealizedGain,
    calculateTotalCost
  }
}
