<script setup lang="ts">
import type { PortfolioValue } from '~/types'

const props = defineProps<{
  portfolio: PortfolioValue
}>()

const { formatPrice, formatCrypto } = useCryptoPrices()

const cryptoColors: Record<string, string> = {
  BTC: 'text-orange-400',
  ETH: 'text-blue-400',
  SOL: 'text-purple-400'
}

const cryptoIcons: Record<string, string> = {
  BTC: 'i-simple-icons-bitcoin',
  ETH: 'i-simple-icons-ethereum',
  SOL: 'i-simple-icons-solana'
}

const gainColor = computed(() => {
  if (props.portfolio.unrealizedGain > 0) return 'text-green-400'
  if (props.portfolio.unrealizedGain < 0) return 'text-red-400'
  return 'text-gray-400'
})

const gainBgColor = computed(() => {
  if (props.portfolio.unrealizedGain > 0) return 'bg-green-500/10'
  if (props.portfolio.unrealizedGain < 0) return 'bg-red-500/10'
  return 'bg-gray-500/10'
})
</script>

<template>
  <div class="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
    <div class="flex items-center justify-between">
      <!-- Left: Crypto info -->
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gray-700 rounded-lg">
          <UIcon
            :name="cryptoIcons[portfolio.crypto] || 'i-heroicons-currency-dollar'"
            :class="['w-6 h-6', cryptoColors[portfolio.crypto]]"
          />
        </div>
        <div>
          <p class="font-semibold text-white">{{ portfolio.crypto }}</p>
          <p class="text-sm text-gray-400">{{ formatCrypto(portfolio.amount, 6) }} {{ portfolio.crypto }}</p>
        </div>
      </div>

      <!-- Right: Values -->
      <div class="text-right">
        <p class="font-semibold text-white">{{ formatPrice(portfolio.currentValue) }}</p>
        <div :class="['text-sm flex items-center gap-1 justify-end', gainColor]">
          <UIcon
            :name="portfolio.unrealizedGain >= 0 ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'"
            class="w-3 h-3"
          />
          <span>{{ formatPrice(Math.abs(portfolio.unrealizedGain)) }}</span>
          <span class="text-xs">({{ portfolio.unrealizedGainPercent.toFixed(1) }}%)</span>
        </div>
      </div>
    </div>

    <!-- Details -->
    <div class="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-2 text-xs">
      <div>
        <p class="text-gray-500">Cout total</p>
        <p class="text-gray-300">{{ formatPrice(portfolio.totalCost) }}</p>
      </div>
      <div>
        <p class="text-gray-500">PAMP</p>
        <p class="text-gray-300">{{ formatPrice(portfolio.avgCost) }}</p>
      </div>
      <div>
        <p class="text-gray-500">Prix actuel</p>
        <p class="text-gray-300">{{ formatPrice(portfolio.currentPrice) }}</p>
      </div>
    </div>
  </div>
</template>
