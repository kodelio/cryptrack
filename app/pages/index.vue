<script setup lang="ts">
import type { Transaction, CryptoPrices, PortfolioValue } from '~/types'

const { fetchAllTransactions, loading: loadingTx } = useTransactions()
const { calculateCumulativeSummary } = useTaxCalculator()
const { fetchPrices, formatPrice, prices, loading: loadingPrices } = useCryptoPrices()
const { calculatePortfolioValues, calculateTotalPortfolioValue, calculateTotalUnrealizedGain } = usePortfolio()

const selectedYear = ref(2026)
const transactions = ref<Transaction[]>([])
const portfolioValues = ref<PortfolioValue[]>([])

const summary = computed(() => {
  return calculateCumulativeSummary(transactions.value, selectedYear.value)
})

const totalPortfolioValue = computed(() => calculateTotalPortfolioValue(portfolioValues.value))
const totalUnrealizedGain = computed(() => calculateTotalUnrealizedGain(portfolioValues.value))

const years = [2024, 2025, 2026]

async function loadData() {
  const [txData, priceData] = await Promise.all([
    fetchAllTransactions(),
    fetchPrices()
  ])

  transactions.value = txData
  updatePortfolio(priceData)
}

function updatePortfolio(priceData: CryptoPrices) {
  const currentSummary = calculateCumulativeSummary(transactions.value, selectedYear.value)
  portfolioValues.value = calculatePortfolioValues(currentSummary.holdings, priceData)
}

watch(selectedYear, () => {
  updatePortfolio(prices.value)
})

onMounted(loadData)

const statsCards = computed(() => [
  {
    title: 'Total Investi',
    value: formatPrice(summary.value.totalInvestedEUR),
    icon: 'i-heroicons-banknotes',
    color: 'text-blue-400'
  },
  {
    title: 'Valeur Portfolio',
    value: formatPrice(totalPortfolioValue.value),
    icon: 'i-heroicons-chart-bar',
    color: 'text-green-400'
  },
  {
    title: 'Plus-value Latente',
    value: formatPrice(totalUnrealizedGain.value),
    icon: 'i-heroicons-arrow-trending-up',
    color: totalUnrealizedGain.value >= 0 ? 'text-green-400' : 'text-red-400'
  },
  {
    title: 'Impot Estime',
    value: formatPrice(summary.value.taxDue),
    icon: 'i-heroicons-calculator',
    color: 'text-orange-400'
  }
])
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Dashboard</h1>
        <p class="text-gray-400 mt-1">Vue d'ensemble de votre portfolio crypto</p>
      </div>
      <YearSelector v-model="selectedYear" :years="years" />
    </div>

    <!-- Loading State -->
    <div v-if="loadingTx || loadingPrices" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard v-for="stat in statsCards" :key="stat.title" class="bg-gray-900 border-gray-800">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-gray-800">
              <UIcon :name="stat.icon" :class="['w-6 h-6', stat.color]" />
            </div>
            <div>
              <p class="text-sm text-gray-400">{{ stat.title }}</p>
              <p class="text-xl font-semibold text-white">{{ stat.value }}</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Portfolio Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Portfolio by Crypto -->
        <UCard class="bg-gray-900 border-gray-800">
          <template #header>
            <h3 class="text-lg font-semibold text-white">Portfolio par Crypto</h3>
          </template>

          <div class="space-y-4">
            <PortfolioCard
              v-for="portfolio in portfolioValues"
              :key="portfolio.crypto"
              :portfolio="portfolio"
            />

            <div v-if="portfolioValues.length === 0" class="text-center py-8 text-gray-500">
              Aucun actif dans le portfolio
            </div>
          </div>
        </UCard>

        <!-- Tax Summary -->
        <UCard class="bg-gray-900 border-gray-800">
          <template #header>
            <h3 class="text-lg font-semibold text-white">Résumé Fiscal {{ selectedYear }}</h3>
          </template>

          <TaxSummaryCard :summary="summary" />
        </UCard>
      </div>

      <!-- Staking Rewards -->
      <UCard class="bg-gray-900 border-gray-800">
        <template #header>
          <h3 class="text-lg font-semibold text-white">Rewards de Staking (cumul jusqu'a {{ selectedYear }})</h3>
        </template>

        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-gray-800 rounded-lg">
            <p class="text-2xl font-bold text-orange-400">
              {{ summary.stakingRewards.BTC.toFixed(8) }}
            </p>
            <p class="text-sm text-gray-400 mt-1">BTC</p>
          </div>
          <div class="text-center p-4 bg-gray-800 rounded-lg">
            <p class="text-2xl font-bold text-blue-400">
              {{ summary.stakingRewards.ETH.toFixed(6) }}
            </p>
            <p class="text-sm text-gray-400 mt-1">ETH</p>
          </div>
          <div class="text-center p-4 bg-gray-800 rounded-lg">
            <p class="text-2xl font-bold text-purple-400">
              {{ summary.stakingRewards.SOL.toFixed(6) }}
            </p>
            <p class="text-sm text-gray-400 mt-1">SOL</p>
          </div>
        </div>

        <p class="text-xs text-gray-500 mt-4">
          Note: Les rewards de staking ne sont imposés qu'au moment de la vente (coût d'acquisition = 0 EUR)
        </p>
      </UCard>

      <!-- Quick Links -->
      <div class="flex gap-4">
        <UButton :to="`/fiscal/${selectedYear}`" color="primary">
          <UIcon name="i-heroicons-document-text" class="mr-2" />
          Rapport fiscal {{ selectedYear }}
        </UButton>
        <UButton to="/transactions" color="neutral" variant="outline">
          <UIcon name="i-heroicons-list-bullet" class="mr-2" />
          Toutes les transactions
        </UButton>
        <UButton :to="`/tax/${selectedYear}`" color="neutral" variant="outline">
          <UIcon name="i-heroicons-calculator" class="mr-2" />
          Analyse détaillée
        </UButton>
      </div>
    </template>
  </div>
</template>
