<script setup lang="ts">
import type { Transaction, CryptoCurrency } from '~/types'

const route = useRoute()
const year = computed(() => parseInt(route.params.year as string))

const { fetchAllTransactions, loading } = useTransactions()
const { calculateTaxSummary, calculateCumulativeSummary, simulateSale, getTaxRate, EXEMPTION_THRESHOLD } = useTaxCalculator()
const { fetchPrices, formatPrice, prices } = useCryptoPrices()

const transactions = ref<Transaction[]>([])

const yearSummary = computed(() => calculateTaxSummary(transactions.value, year.value))
const cumulativeSummary = computed(() => calculateCumulativeSummary(transactions.value, year.value))

const taxRate = computed(() => getTaxRate(year.value))

// Simulation vente
const simulateCrypto = ref<CryptoCurrency>('BTC')
const simulateAmount = ref(0.01)

const simulation = computed(() => {
  if (!prices.value[simulateCrypto.value]) return null
  return simulateSale(
    cumulativeSummary.value.holdings,
    simulateCrypto.value,
    simulateAmount.value,
    prices.value[simulateCrypto.value],
    year.value
  )
})

const yearTransactions = computed(() => {
  return transactions.value
    .filter(t => t.date.getFullYear() === year.value)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
})

const buyTransactions = computed(() =>
  yearTransactions.value.filter(t => t.type === 'Trade' && t.tradeType === 'Buy')
)

const sellTransactions = computed(() =>
  yearTransactions.value.filter(t => t.type === 'Trade' && t.tradeType === 'Sell')
)

const rewardTransactions = computed(() =>
  yearTransactions.value.filter(t => t.type === 'Reward')
)

onMounted(async () => {
  const [txData] = await Promise.all([
    fetchAllTransactions(),
    fetchPrices()
  ])
  transactions.value = txData
})

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Analyse Fiscale {{ year }}</h1>
        <p class="text-gray-400 mt-1">Détail des obligations fiscales pour l'année {{ year }}</p>
      </div>
      <div class="flex gap-2">
        <UButton
          :to="`/fiscal/${year}`"
          color="primary"
          size="sm"
        >
          <UIcon name="i-heroicons-document-text" class="mr-1" />
          Rapport fiscal
        </UButton>
        <UButton
          v-if="year > 2024"
          :to="`/tax/${year - 1}`"
          color="neutral"
          variant="outline"
          size="sm"
        >
          <UIcon name="i-heroicons-arrow-left" class="mr-1" />
          {{ year - 1 }}
        </UButton>
        <UButton
          v-if="year < 2026"
          :to="`/tax/${year + 1}`"
          color="neutral"
          variant="outline"
          size="sm"
        >
          {{ year + 1 }}
          <UIcon name="i-heroicons-arrow-right" class="ml-1" />
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
    </div>

    <template v-else>
      <!-- Key Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UCard class="bg-gray-900 border-gray-800">
          <div class="text-center">
            <p class="text-sm text-gray-400">Investi en {{ year }}</p>
            <p class="text-2xl font-bold text-white mt-1">{{ formatPrice(yearSummary.totalInvestedEUR) }}</p>
          </div>
        </UCard>
        <UCard class="bg-gray-900 border-gray-800">
          <div class="text-center">
            <p class="text-sm text-gray-400">Frais {{ year }}</p>
            <p class="text-2xl font-bold text-white mt-1">{{ formatPrice(yearSummary.totalFeesEUR) }}</p>
          </div>
        </UCard>
        <UCard class="bg-gray-900 border-gray-800">
          <div class="text-center">
            <p class="text-sm text-gray-400">Plus-values imposables</p>
            <p class="text-2xl font-bold" :class="yearSummary.taxableGains > 0 ? 'text-orange-400' : 'text-green-400'">
              {{ formatPrice(yearSummary.taxableGains) }}
            </p>
          </div>
        </UCard>
        <UCard class="bg-gray-900 border-gray-800">
          <div class="text-center">
            <p class="text-sm text-gray-400">Impot du ({{ (taxRate * 100).toFixed(1) }}%)</p>
            <p class="text-2xl font-bold text-red-400">{{ formatPrice(yearSummary.taxDue) }}</p>
          </div>
        </UCard>
      </div>

      <!-- Tax Rules Reminder -->
      <UCard class="bg-blue-900/20 border-blue-800">
        <div class="flex gap-4">
          <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-blue-400 flex-shrink-0" />
          <div class="text-sm text-gray-300 space-y-2">
            <p><strong>Rappel des regles fiscales francaises :</strong></p>
            <ul class="list-disc list-inside space-y-1 text-gray-400">
              <li>Flat Tax : {{ (taxRate * 100).toFixed(1) }}% ({{ year >= 2026 ? '12.8% IR + 18.6% PS' : '12.8% IR + 17.2% PS' }})</li>
              <li>Exoneration si plus-values totales &lt; {{ EXEMPTION_THRESHOLD }} EUR/an</li>
              <li>Formulaire 2086 : déclaration des plus-values</li>
              <li>Formulaire 3916-bis : déclaration des comptes crypto étrangers</li>
            </ul>
          </div>
        </div>
      </UCard>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Buy Transactions -->
        <UCard class="bg-gray-900 border-gray-800">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">Achats {{ year }}</h3>
              <UBadge color="primary">{{ buyTransactions.length }}</UBadge>
            </div>
          </template>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="tx in buyTransactions"
              :key="tx.externalId"
              class="flex items-center justify-between p-2 bg-gray-800 rounded"
            >
              <div>
                <span class="text-green-400 font-medium">
                  +{{ tx.receivedAmount.toFixed(8) }} {{ tx.receivedCurrency }}
                </span>
                <span class="text-gray-500 text-sm ml-2">{{ formatDate(tx.date) }}</span>
              </div>
              <span class="text-gray-400">{{ formatPrice(tx.sentAmount || 0) }}</span>
            </div>

            <div v-if="buyTransactions.length === 0" class="text-center py-4 text-gray-500">
              Aucun achat en {{ year }}
            </div>
          </div>
        </UCard>

        <!-- Sell Transactions -->
        <UCard class="bg-gray-900 border-gray-800">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">Ventes {{ year }}</h3>
              <UBadge color="error">{{ sellTransactions.length }}</UBadge>
            </div>
          </template>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="tx in sellTransactions"
              :key="tx.externalId"
              class="flex items-center justify-between p-2 bg-gray-800 rounded"
            >
              <div>
                <span class="text-red-400 font-medium">
                  -{{ tx.sentAmount?.toFixed(8) }} {{ tx.sentCurrency }}
                </span>
                <span class="text-gray-500 text-sm ml-2">{{ formatDate(tx.date) }}</span>
              </div>
              <span class="text-gray-400">{{ formatPrice(tx.receivedAmount) }}</span>
            </div>

            <div v-if="sellTransactions.length === 0" class="text-center py-4 text-gray-500">
              Aucune vente en {{ year }} - pas d'imposition
            </div>
          </div>
        </UCard>
      </div>

      <!-- Holdings & PAMP -->
      <UCard class="bg-gray-900 border-gray-800">
        <template #header>
          <h3 class="text-lg font-semibold text-white">Holdings & Prix d'Acquisition Moyen (PAMP)</h3>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-gray-400 text-sm border-b border-gray-800">
                <th class="pb-3">Crypto</th>
                <th class="pb-3">Quantite</th>
                <th class="pb-3">Cout Total</th>
                <th class="pb-3">PAMP</th>
                <th class="pb-3">Prix Actuel</th>
                <th class="pb-3">+/- Value Latente</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="crypto in (['BTC', 'ETH', 'SOL'] as CryptoCurrency[])" :key="crypto" class="border-b border-gray-800">
                <td class="py-3 font-medium text-white">{{ crypto }}</td>
                <td class="py-3 text-gray-300">{{ cumulativeSummary.holdings[crypto].amount.toFixed(8) }}</td>
                <td class="py-3 text-gray-300">{{ formatPrice(cumulativeSummary.holdings[crypto].totalCost) }}</td>
                <td class="py-3 text-gray-300">{{ formatPrice(cumulativeSummary.holdings[crypto].avgCost) }}</td>
                <td class="py-3 text-gray-300">{{ formatPrice(prices[crypto]) }}</td>
                <td class="py-3" :class="(cumulativeSummary.holdings[crypto].amount * prices[crypto] - cumulativeSummary.holdings[crypto].totalCost) >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ formatPrice(cumulativeSummary.holdings[crypto].amount * prices[crypto] - cumulativeSummary.holdings[crypto].totalCost) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Sale Simulation -->
      <UCard class="bg-gray-900 border-gray-800">
        <template #header>
          <h3 class="text-lg font-semibold text-white">Simulateur de Vente</h3>
        </template>

        <div class="space-y-4">
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Crypto</label>
              <div class="flex gap-2">
                <UButton
                  v-for="c in (['BTC', 'ETH', 'SOL'] as CryptoCurrency[])"
                  :key="c"
                  :color="simulateCrypto === c ? 'primary' : 'neutral'"
                  :variant="simulateCrypto === c ? 'solid' : 'outline'"
                  class="cursor-pointer"
                  @click="simulateCrypto = c"
                >
                  {{ c }}
                </UButton>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Quantite a vendre</label>
              <UInput v-model.number="simulateAmount" type="number" step="0.00001" class="w-40" />
            </div>
          </div>

          <div v-if="simulation" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div class="p-4 bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-400">Valeur de vente</p>
              <p class="text-xl font-bold text-white">{{ formatPrice(simulateAmount * prices[simulateCrypto]) }}</p>
            </div>
            <div class="p-4 bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-400">Plus-value</p>
              <p class="text-xl font-bold" :class="simulation.gain >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ formatPrice(simulation.gain) }}
              </p>
            </div>
            <div class="p-4 bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-400">Impot estime</p>
              <p class="text-xl font-bold text-orange-400">{{ formatPrice(simulation.tax) }}</p>
            </div>
          </div>

          <p class="text-xs text-gray-500">
            * Simulation basée sur le prix actuel et le PAMP calcule. L'exonération de {{ EXEMPTION_THRESHOLD }} EUR s'applique si les plus-values totales de l'année restent sous ce seuil.
          </p>
        </div>
      </UCard>

      <!-- Staking Rewards -->
      <UCard class="bg-gray-900 border-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Rewards de Staking {{ year }}</h3>
            <UBadge color="secondary">{{ rewardTransactions.length }}</UBadge>
          </div>
        </template>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center p-4 bg-gray-800 rounded-lg">
            <p class="text-lg font-bold text-orange-400">{{ yearSummary.stakingRewards.BTC.toFixed(8) }}</p>
            <p class="text-sm text-gray-400">BTC</p>
          </div>
          <div class="text-center p-4 bg-gray-800 rounded-lg">
            <p class="text-lg font-bold text-blue-400">{{ yearSummary.stakingRewards.ETH.toFixed(6) }}</p>
            <p class="text-sm text-gray-400">ETH</p>
          </div>
          <div class="text-center p-4 bg-gray-800 rounded-lg">
            <p class="text-lg font-bold text-purple-400">{{ yearSummary.stakingRewards.SOL.toFixed(6) }}</p>
            <p class="text-sm text-gray-400">SOL</p>
          </div>
        </div>

        <p class="text-xs text-gray-500">
          Les rewards de staking ne sont pas imposés à la réception. Ils seront imposés lors de leur vente avec un coût d'acquisition de 0 EUR.
        </p>
      </UCard>
    </template>
  </div>
</template>
