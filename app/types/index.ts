export type TransactionType = 'Trade' | 'Reward'
export type TradeType = 'Buy' | 'Sell'
export type Currency = 'BTC' | 'ETH' | 'SOL' | 'EUR'
export type CryptoCurrency = 'BTC' | 'ETH' | 'SOL'

export interface Transaction {
  type: TransactionType
  tradeType?: TradeType
  date: Date
  receivedAmount: number
  receivedCurrency: Currency
  sentAmount: number | null
  sentCurrency: Currency | null
  feeAmount: number
  feeCurrency: Currency
  description: string
  externalId: string
}

export interface RawTransaction {
  type: string
  date: string
  timezone: string
  received_amount: string
  received_currency: string
  sent_amount: string
  sent_currency: string
  fee_amount: string
  fee_currency: string
  description: string
  address: string
  transaction_hash: string
  external_id: string
}

export interface CryptoPrices {
  BTC: number
  ETH: number
  SOL: number
}

export interface Holding {
  amount: number
  avgCost: number
  totalCost: number
}

export interface Holdings {
  BTC: Holding
  ETH: Holding
  SOL: Holding
}

export interface StakingRewards {
  BTC: number
  ETH: number
  SOL: number
}

export interface TaxSummary {
  year: number
  totalInvestedEUR: number
  totalFeesEUR: number
  stakingRewards: StakingRewards
  holdings: Holdings
  taxableGains: number
  taxDue: number
}

export interface YearlyData {
  transactions: Transaction[]
  summary: TaxSummary
}

export interface PortfolioValue {
  crypto: CryptoCurrency
  amount: number
  avgCost: number
  totalCost: number
  currentPrice: number
  currentValue: number
  unrealizedGain: number
  unrealizedGainPercent: number
}
