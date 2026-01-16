import type { CryptoPrices } from '~/types'

export function useCryptoPrices() {
  const prices = ref<CryptoPrices>({
    BTC: 0,
    ETH: 0,
    SOL: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  async function fetchPrices(): Promise<CryptoPrices> {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<CryptoPrices>('/api/prices')
      prices.value = data
      lastUpdated.value = new Date()
      return data
    } catch (e) {
      error.value = 'Erreur lors de la recuperation des prix'
      console.error(e)
      // Return fallback prices
      return prices.value
    } finally {
      loading.value = false
    }
  }

  const numberFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  function formatPrice(price: number): string {
    return numberFormatter.format(price)
  }

  function formatCrypto(amount: number, decimals: number = 8): string {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  return {
    prices,
    loading,
    error,
    lastUpdated,
    fetchPrices,
    formatPrice,
    formatCrypto
  }
}
