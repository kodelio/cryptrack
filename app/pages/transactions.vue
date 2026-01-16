<script setup lang="ts">
import type { Transaction } from '~/types'

const { fetchAllTransactions, loading } = useTransactions()
const { formatPrice } = useCryptoPrices()

const transactions = ref<Transaction[]>([])
const selectedYear = ref<number | null>(null)
const selectedType = ref<string | null>(null)
const selectedCrypto = ref<string | null>(null)

const years = [
  { label: 'Toutes', value: null },
  { label: '2024', value: 2024 },
  { label: '2025', value: 2025 },
  { label: '2026', value: 2026 }
]

const types = [
  { label: 'Tous', value: null },
  { label: 'Achats', value: 'Buy' },
  { label: 'Ventes', value: 'Sell' },
  { label: 'Rewards', value: 'Reward' }
]

const cryptos = [
  { label: 'Toutes', value: null },
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' },
  { label: 'SOL', value: 'SOL' }
]

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value]

  if (selectedYear.value) {
    filtered = filtered.filter(t => t.date.getFullYear() === selectedYear.value)
  }

  if (selectedType.value) {
    if (selectedType.value === 'Reward') {
      filtered = filtered.filter(t => t.type === 'Reward')
    } else {
      filtered = filtered.filter(t => t.type === 'Trade' && t.tradeType === selectedType.value)
    }
  }

  if (selectedCrypto.value) {
    filtered = filtered.filter(t =>
      t.receivedCurrency === selectedCrypto.value ||
      t.sentCurrency === selectedCrypto.value
    )
  }

  // Sort by date descending
  return filtered.sort((a, b) => b.date.getTime() - a.date.getTime())
})

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'type', label: 'Type' },
  { key: 'received', label: 'Reçu' },
  { key: 'sent', label: 'Envoyé' },
  { key: 'fee', label: 'Frais' }
]

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function getTypeLabel(tx: Transaction): string {
  if (tx.type === 'Reward') return 'Reward'
  return tx.tradeType === 'Buy' ? 'Achat' : 'Vente'
}

function getTypeColor(tx: Transaction): string {
  if (tx.type === 'Reward') return 'text-purple-400'
  return tx.tradeType === 'Buy' ? 'text-green-400' : 'text-red-400'
}

function formatAmount(amount: number, currency: string): string {
  if (currency === 'EUR') {
    return formatPrice(amount)
  }
  return `${amount.toFixed(8)} ${currency}`
}

onMounted(async () => {
  transactions.value = await fetchAllTransactions()
})

const tableData = computed(() => {
  return filteredTransactions.value.map(tx => ({
    date: formatDate(tx.date),
    type: tx,
    received: tx.receivedAmount > 0 ? formatAmount(tx.receivedAmount, tx.receivedCurrency) : '-',
    sent: tx.sentAmount ? formatAmount(tx.sentAmount, tx.sentCurrency || '') : '-',
    fee: tx.feeAmount > 0 ? formatAmount(tx.feeAmount, tx.feeCurrency) : '-'
  }))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-white">Transactions</h1>
      <p class="text-gray-400 mt-1">Historique de toutes vos transactions crypto</p>
    </div>

    <!-- Filters -->
    <UCard class="bg-gray-900 border-gray-800">
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Année:</span>
          <div class="flex gap-1">
            <UButton
              v-for="year in years"
              :key="year.label"
              :color="selectedYear === year.value ? 'primary' : 'neutral'"
              :variant="selectedYear === year.value ? 'solid' : 'outline'"
              size="sm"
              class="cursor-pointer"
              @click="selectedYear = year.value"
            >
              {{ year.label }}
            </UButton>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Type:</span>
          <div class="flex gap-1">
            <UButton
              v-for="type in types"
              :key="type.label"
              :color="selectedType === type.value ? 'primary' : 'neutral'"
              :variant="selectedType === type.value ? 'solid' : 'outline'"
              size="sm"
              class="cursor-pointer"
              @click="selectedType = type.value"
            >
              {{ type.label }}
            </UButton>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Crypto:</span>
          <div class="flex gap-1">
            <UButton
              v-for="crypto in cryptos"
              :key="crypto.label"
              :color="selectedCrypto === crypto.value ? 'primary' : 'neutral'"
              :variant="selectedCrypto === crypto.value ? 'solid' : 'outline'"
              size="sm"
              class="cursor-pointer"
              @click="selectedCrypto = crypto.value"
            >
              {{ crypto.label }}
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Stats -->
    <div class="flex gap-4 text-sm text-gray-400">
      <span>{{ filteredTransactions.length }} transactions</span>
      <span>|</span>
      <span>{{ filteredTransactions.filter(t => t.type === 'Trade' && t.tradeType === 'Buy').length }} achats</span>
      <span>|</span>
      <span>{{ filteredTransactions.filter(t => t.type === 'Trade' && t.tradeType === 'Sell').length }} ventes</span>
      <span>|</span>
      <span>{{ filteredTransactions.filter(t => t.type === 'Reward').length }} rewards</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
    </div>

    <!-- Table -->
    <UCard v-else class="bg-gray-900 border-gray-800">
      <TransactionTable :transactions="filteredTransactions" />
    </UCard>
  </div>
</template>
