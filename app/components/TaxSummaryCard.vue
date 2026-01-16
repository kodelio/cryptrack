<script setup lang="ts">
import type { TaxSummary } from '~/types'

const props = defineProps<{
  summary: TaxSummary
}>()

const { formatPrice } = useCryptoPrices()
const { getTaxRate, EXEMPTION_THRESHOLD } = useTaxCalculator()

const taxRate = computed(() => getTaxRate(props.summary.year))
const isExempt = computed(() => props.summary.taxableGains <= EXEMPTION_THRESHOLD)
</script>

<template>
  <div class="space-y-4">
    <!-- Key Metrics -->
    <div class="grid grid-cols-2 gap-4">
      <div class="p-3 bg-gray-800 rounded-lg">
        <p class="text-xs text-gray-500">Total Investi</p>
        <p class="text-lg font-semibold text-white">{{ formatPrice(summary.totalInvestedEUR) }}</p>
      </div>
      <div class="p-3 bg-gray-800 rounded-lg">
        <p class="text-xs text-gray-500">Frais Totaux</p>
        <p class="text-lg font-semibold text-white">{{ formatPrice(summary.totalFeesEUR) }}</p>
      </div>
    </div>

    <!-- Taxable Gains -->
    <div class="p-4 rounded-lg" :class="summary.taxableGains > 0 ? 'bg-orange-900/20' : 'bg-green-900/20'">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Plus-values imposables</p>
          <p class="text-2xl font-bold" :class="summary.taxableGains > 0 ? 'text-orange-400' : 'text-green-400'">
            {{ formatPrice(summary.taxableGains) }}
          </p>
        </div>
        <UIcon
          :name="summary.taxableGains > 0 ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-check-circle'"
          :class="['w-8 h-8', summary.taxableGains > 0 ? 'text-orange-400' : 'text-green-400']"
        />
      </div>
    </div>

    <!-- Tax Due -->
    <div class="p-4 bg-gray-800 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-400">Impot estime</span>
        <span class="text-xs text-gray-500">Flat Tax {{ (taxRate * 100).toFixed(1) }}%</span>
      </div>
      <p class="text-2xl font-bold text-red-400">{{ formatPrice(summary.taxDue) }}</p>

      <div v-if="isExempt && summary.taxableGains > 0" class="mt-2 text-xs text-green-400 flex items-center gap-1">
        <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
        Exonere (plus-values &lt; {{ EXEMPTION_THRESHOLD }} EUR)
      </div>
    </div>

    <!-- Holdings Summary -->
    <div>
      <p class="text-sm text-gray-400 mb-2">Holdings fin d'année</p>
      <div class="space-y-2">
        <div v-for="crypto in (['BTC', 'ETH', 'SOL'] as const)" :key="crypto" class="flex items-center justify-between text-sm">
          <span class="text-gray-300">{{ crypto }}</span>
          <div class="text-right">
            <span class="text-white">{{ summary.holdings[crypto].amount.toFixed(6) }}</span>
            <span class="text-gray-500 ml-2">(PAMP: {{ formatPrice(summary.holdings[crypto].avgCost) }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
