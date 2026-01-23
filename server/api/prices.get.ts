interface CoinGeckoResponse {
  bitcoin: { eur: number }
  ethereum: { eur: number }
  solana: { eur: number }
}

// Cache for prices (5 minutes)
let cachedPrices: { BTC: number; ETH: number; SOL: number } | null = null
let cacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiKey = config.coinGeckoApiKey
  const now = Date.now()

  // Return cached prices if still valid
  if (cachedPrices && (now - cacheTime) < CACHE_DURATION) {
    return cachedPrices
  }

  try {
    const params: Record<string, string> = {
      ids: 'bitcoin,ethereum,solana',
      vs_currencies: 'eur'
    }

    const headers: Record<string, string> = {}

    // Add API key as header if available to prevent logging
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey
    }

    const response = await $fetch<CoinGeckoResponse>(
      'https://api.coingecko.com/api/v3/simple/price',
      { params, headers }
    )

    cachedPrices = {
      BTC: response.bitcoin.eur,
      ETH: response.ethereum.eur,
      SOL: response.solana.eur
    }
    cacheTime = now

    return cachedPrices
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error)

    // Return cached prices if available, even if stale
    if (cachedPrices) {
      return cachedPrices
    }

    // Fallback prices if no cache available
    return {
      BTC: 95000,
      ETH: 3200,
      SOL: 200
    }
  }
})
