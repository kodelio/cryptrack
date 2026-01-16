import type { Transaction, RawTransaction } from '~/types'

export function useTransactions() {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function parseTransaction(raw: RawTransaction): Transaction {
    const type = raw.type as 'Trade' | 'Reward'
    let tradeType: 'Buy' | 'Sell' | undefined

    if (type === 'Trade') {
      tradeType = raw.description as 'Buy' | 'Sell'
    }

    return {
      type,
      tradeType,
      date: new Date(raw.date),
      receivedAmount: parseFloat(raw.received_amount) || 0,
      receivedCurrency: raw.received_currency as Transaction['receivedCurrency'],
      sentAmount: raw.sent_amount ? parseFloat(raw.sent_amount) : null,
      sentCurrency: raw.sent_currency ? raw.sent_currency as Transaction['sentCurrency'] : null,
      feeAmount: parseFloat(raw.fee_amount) || 0,
      feeCurrency: raw.fee_currency as Transaction['feeCurrency'],
      description: raw.description || '',
      externalId: raw.external_id
    }
  }

  async function fetchTransactions(year: number): Promise<Transaction[]> {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<RawTransaction[]>(`/api/transactions/${year}`)
      transactions.value = data.map(parseTransaction)
      return transactions.value
    } catch (e) {
      error.value = `Erreur lors du chargement des transactions ${year}`
      console.error(e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchAllTransactions(): Promise<Transaction[]> {
    loading.value = true
    error.value = null

    try {
      const years = [2024, 2025, 2026]
      const allData = await Promise.all(
        years.map(year => $fetch<RawTransaction[]>(`/api/transactions/${year}`).catch(() => []))
      )

      transactions.value = allData
        .flat()
        .map(parseTransaction)
        .sort((a, b) => a.date.getTime() - b.date.getTime())

      return transactions.value
    } catch (e) {
      error.value = 'Erreur lors du chargement des transactions'
      console.error(e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchAllTransactions
  }
}
