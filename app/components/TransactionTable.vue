<script setup lang="ts">
import type { Transaction } from '~/types'

const props = defineProps<{
  transactions: Transaction[]
}>()

const { formatPrice } = useCryptoPrices()

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
  if (tx.type === 'Reward') return 'bg-purple-500/20 text-purple-400'
  return tx.tradeType === 'Buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
}

function formatAmount(amount: number | null, currency: string | null): string {
  if (amount === null || currency === null) return '-'
  if (currency === 'EUR') {
    return formatPrice(amount)
  }
  // Show fewer decimals for display
  const decimals = amount < 0.001 ? 8 : amount < 1 ? 6 : 4
  return `${amount.toFixed(decimals)} ${currency}`
}

const currentPage = ref(1)
const pageSize = 20

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return props.transactions.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(props.transactions.length / pageSize))
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left text-gray-400 text-sm border-b border-gray-800">
            <th class="pb-3 pr-4">Date</th>
            <th class="pb-3 pr-4">Type</th>
            <th class="pb-3 pr-4">Reçu</th>
            <th class="pb-3 pr-4">Envoyé</th>
            <th class="pb-3">Frais</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="tx in paginatedTransactions"
            :key="tx.externalId"
            class="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
          >
            <td class="py-3 pr-4 text-gray-300 text-sm">
              {{ formatDate(tx.date) }}
            </td>
            <td class="py-3 pr-4">
              <span
                :class="['px-2 py-1 rounded text-xs font-medium', getTypeColor(tx)]"
              >
                {{ getTypeLabel(tx) }}
              </span>
            </td>
            <td class="py-3 pr-4 text-gray-300">
              <span v-if="tx.receivedAmount > 0" class="text-green-400">
                +{{ formatAmount(tx.receivedAmount, tx.receivedCurrency) }}
              </span>
              <span v-else class="text-gray-600">-</span>
            </td>
            <td class="py-3 pr-4 text-gray-300">
              <span v-if="tx.sentAmount" class="text-red-400">
                -{{ formatAmount(tx.sentAmount, tx.sentCurrency) }}
              </span>
              <span v-else class="text-gray-600">-</span>
            </td>
            <td class="py-3 text-gray-500 text-sm">
              {{ tx.feeAmount > 0 ? formatAmount(tx.feeAmount, tx.feeCurrency) : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 border-t border-gray-800">
      <span class="text-sm text-gray-400">
        Page {{ currentPage }} sur {{ totalPages }} ({{ transactions.length }} transactions)
      </span>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <UIcon name="i-heroicons-chevron-left" />
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <UIcon name="i-heroicons-chevron-right" />
        </UButton>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="transactions.length === 0" class="text-center py-12 text-gray-500">
      <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-4" />
      <p>Aucune transaction trouvee</p>
    </div>
  </div>
</template>
