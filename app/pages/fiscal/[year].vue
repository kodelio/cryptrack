<script setup lang="ts">
import type { Transaction } from '~/types'

const route = useRoute()
const year = computed(() => parseInt(route.params.year as string))

const { fetchAllTransactions, loading } = useTransactions()
const { calculateTaxSummary, getTaxRate } = useTaxCalculator()
const { formatPrice } = useCryptoPrices()
const { generateForm2086Data, downloadCSV } = useForm2086()
const toast = useToast()

const transactions = ref<Transaction[]>([])

const summary = computed(() => calculateTaxSummary(transactions.value, year.value))

const taxRate = computed(() => getTaxRate(year.value))

const yearTransactions = computed(() =>
  transactions.value.filter(t => t.date.getFullYear() === year.value)
)

const taxableTransactions = computed(() =>
  yearTransactions.value.filter(t => t.type === 'Trade' && t.tradeType === 'Sell')
)

function generateForm2086() {
  try {
    const formData = generateForm2086Data(transactions.value, year.value)
    downloadCSV(formData)

    toast.add({
      title: 'Formulaire 2086 généré',
      description: `${formData.cessions.length} cession(s) exportée(s) pour l'année ${year.value}`,
      color: 'success'
    })
  } catch (e) {
    console.error('Erreur lors de la génération du formulaire 2086:', e)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de générer le formulaire 2086',
      color: 'error'
    })
  }
}

onMounted(async () => {
  transactions.value = await fetchAllTransactions()
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white flex items-center gap-3">
          Rapport fiscal
          <span class="text-primary-400">{{ year }}</span>
        </h1>
      </div>
      <div class="flex gap-2">
        <UButton
          v-if="year > 2024"
          :to="`/fiscal/${year - 1}`"
          color="neutral"
          variant="outline"
          size="sm"
        >
          <UIcon name="i-heroicons-arrow-left" class="mr-1" />
          {{ year - 1 }}
        </UButton>
        <UButton
          v-if="year < 2026"
          :to="`/fiscal/${year + 1}`"
          color="neutral"
          variant="outline"
          size="sm"
        >
          {{ year + 1 }}
          <UIcon name="i-heroicons-arrow-right" class="ml-1" />
        </UButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
    </div>

    <template v-else>
      <!-- Main Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Gain sur l'année fiscale -->
        <UCard class="bg-gray-900 border-gray-800">
          <div class="space-y-3">
            <h3 class="text-sm font-medium text-gray-400">Gain sur l'année fiscale</h3>
            <div class="flex items-center gap-3">
              <div class="p-3 bg-green-500/10 rounded-lg">
                <UIcon name="i-heroicons-banknotes" class="w-6 h-6 text-green-400" />
              </div>
              <div class="text-3xl font-bold" :class="summary.taxableGains > 0 ? 'text-green-400' : 'text-gray-300'">
                {{ formatPrice(summary.taxableGains) }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- Montant d'imposition -->
        <UCard class="bg-gray-900 border-gray-800">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-400">Montant d'imposition</h3>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-gray-500" />
            </div>
            <div class="flex items-center gap-3">
              <div class="p-3 bg-orange-500/10 rounded-lg">
                <UIcon name="i-heroicons-scale" class="w-6 h-6 text-orange-400" />
              </div>
              <div class="text-3xl font-bold text-orange-400">
                {{ formatPrice(summary.taxDue) }}
              </div>
            </div>
            <p class="text-xs text-gray-500">
              Mode de déclaration : Flat Tax {{ (taxRate * 100).toFixed(1) }}%
            </p>
          </div>
        </UCard>
      </div>

      <!-- Stats Row -->
      <UCard class="bg-gray-900 border-gray-800">
        <div class="grid grid-cols-3 divide-x divide-gray-800">
          <div class="px-6 py-4">
            <div class="text-3xl font-bold text-white text-center">{{ yearTransactions.length }}</div>
            <div class="text-sm text-gray-400 text-center mt-1">Transactions sur l'année</div>
          </div>
          <div class="px-6 py-4">
            <div class="text-3xl font-bold text-center" :class="taxableTransactions.length > 0 ? 'text-orange-400' : 'text-green-400'">
              {{ taxableTransactions.length }}
            </div>
            <div class="text-sm text-gray-400 text-center mt-1">Transactions imposables sur l'année</div>
          </div>
          <div class="px-6 py-4">
            <div class="text-3xl font-bold text-white text-center">EUR</div>
            <div class="text-sm text-gray-400 text-center mt-1">Devise</div>
          </div>
        </div>
      </UCard>

      <!-- Détails fiscaux -->
      <UCard class="bg-gray-900 border-gray-800">
        <template #header>
          <h3 class="text-lg font-semibold text-white">Détails fiscaux</h3>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-800">
              <span class="text-gray-400">Résidence fiscale</span>
              <span class="text-white font-medium">France</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-800">
              <span class="text-gray-400">Méthode de calcul</span>
              <span class="text-white font-medium">Calcul moyen pondéré (PAMP)</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-800">
              <span class="text-gray-400">Total investi</span>
              <span class="text-white font-medium">{{ formatPrice(summary.totalInvestedEUR) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-800">
              <span class="text-gray-400">Total frais</span>
              <span class="text-white font-medium">{{ formatPrice(summary.totalFeesEUR) }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Staking Rewards Info -->
      <UCard class="bg-blue-900/20 border-blue-800">
        <div class="flex gap-4">
          <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div class="space-y-3">
            <h4 class="font-semibold text-blue-400">Rewards de Staking {{ year }}</h4>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-blue-900/30 rounded-lg">
                <p class="text-lg font-bold text-orange-400">{{ summary.stakingRewards.BTC.toFixed(8) }}</p>
                <p class="text-xs text-gray-400 mt-1">BTC</p>
              </div>
              <div class="text-center p-3 bg-blue-900/30 rounded-lg">
                <p class="text-lg font-bold text-blue-400">{{ summary.stakingRewards.ETH.toFixed(6) }}</p>
                <p class="text-xs text-gray-400 mt-1">ETH</p>
              </div>
              <div class="text-center p-3 bg-blue-900/30 rounded-lg">
                <p class="text-lg font-bold text-purple-400">{{ summary.stakingRewards.SOL.toFixed(6) }}</p>
                <p class="text-xs text-gray-400 mt-1">SOL</p>
              </div>
            </div>
            <p class="text-sm text-gray-300">
              ℹ️ Les rewards de staking ne sont <strong>pas imposés à la réception</strong>.
              Ils seront imposés uniquement lors de leur vente avec un coût d'acquisition de 0 EUR.
            </p>
          </div>
        </div>
      </UCard>

      <!-- Formulaire 2086 -->
      <UCard v-if="taxableTransactions.length > 0" class="bg-gray-900 border-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Remplir le formulaire 2086</h3>
              <p class="text-sm text-gray-400 mt-1">
                L'ensemble des cessions imposables effectuées lors de l'année doivent être déclarées.
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div class="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <p class="text-sm text-gray-300">
              <strong>Vous avez {{ taxableTransactions.length }} cession(s) imposable(s)</strong>
            </p>
            <p class="text-xs text-gray-400 mt-2">
              Le formulaire 2086 doit être rempli avec les informations de chaque vente effectuée durant l'année fiscale.
            </p>
          </div>

          <div class="flex gap-3">
            <UButton color="primary" size="lg" class="flex-1" @click="generateForm2086">
              <UIcon name="i-heroicons-document-text" class="mr-2" />
              Générer le formulaire 2086
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              to="https://www.waltio.com/fr/blog/fiscalite/declaration-crypto-formulaire-2086/"
              target="_blank"
            >
              <UIcon name="i-heroicons-information-circle" class="mr-2" />
              Guide
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Info si pas de ventes -->
      <UCard v-else class="bg-green-900/20 border-green-800">
        <div class="flex gap-4">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-400 flex-shrink-0" />
          <div>
            <h4 class="font-medium text-green-400 mb-1">Aucune déclaration nécessaire</h4>
            <p class="text-sm text-gray-300">
              Vous n'avez effectué aucune vente en {{ year }}. Le formulaire 2086 n'est pas requis.
            </p>
            <p class="text-xs text-gray-400 mt-2">
              Note : Le formulaire 3916-bis reste obligatoire si vous détenez des comptes crypto à l'étranger.
            </p>
          </div>
        </div>
      </UCard>

      <!-- Explication calcul -->
      <UCard class="bg-gray-900 border-gray-800">
        <template #header>
          <h3 class="text-lg font-semibold text-white">Comment est calculé votre impôt ?</h3>
        </template>

        <div class="space-y-4 text-sm text-gray-300">
          <div>
            <h4 class="font-medium text-white mb-2">1. Calcul du prix d'acquisition moyen pondéré (PAMP)</h4>
            <p class="text-gray-400">
              A chaque achat, le PAMP est recalculé : <code class="bg-gray-800 px-2 py-1 rounded text-xs">PAMP = (Valeur totale + Nouvel achat) / Quantité totale</code>
            </p>
          </div>

          <div>
            <h4 class="font-medium text-white mb-2">2. Calcul de la plus-value a la vente</h4>
            <p class="text-gray-400">
              <code class="bg-gray-800 px-2 py-1 rounded text-xs">Plus-value = Prix de vente - (PAMP × Quantité vendue) - Frais</code>
            </p>
          </div>

          <div>
            <h4 class="font-medium text-white mb-2">3. Application de la Flat Tax</h4>
            <p class="text-gray-400">
              Taux : {{ (taxRate * 100).toFixed(1) }}% (12.8% IR + {{ year >= 2026 ? '18.6%' : '17.2%' }} PS)
            </p>
            <p class="text-gray-400 mt-1">
              Exonération si plus-values totales &lt; 305 EUR/an
            </p>
          </div>

          <div v-if="taxableTransactions.length === 0" class="p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <p class="text-green-400 font-medium">
              ✅ Vous n'avez effectué aucune vente en {{ year }}. Aucune imposition n'est due.
            </p>
          </div>
        </div>
      </UCard>

      <!-- Actions -->
      <div class="flex gap-4">
        <UButton to="/transactions" color="neutral" variant="outline">
          <UIcon name="i-heroicons-list-bullet" class="mr-2" />
          Voir les transactions
        </UButton>
        <UButton :to="`/tax/${year}`" color="neutral" variant="outline">
          <UIcon name="i-heroicons-calculator" class="mr-2" />
          Analyse détaillée
        </UButton>
      </div>
    </template>
  </div>
</template>
