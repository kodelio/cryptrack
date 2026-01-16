<script setup lang="ts">
const route = useRoute()

const navigation = [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/'
  },
  {
    label: 'Transactions',
    icon: 'i-heroicons-list-bullet',
    to: '/transactions'
  }
]

const fiscalYears = [2024, 2025, 2026]
const taxYears = [2024, 2025, 2026]
</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <!-- Logo -->
      <div class="p-4 border-b border-gray-800">
        <h1 class="text-xl font-bold text-white flex items-center gap-2">
          <UIcon name="i-heroicons-chart-pie" class="text-primary-500" />
          CrypTrack
        </h1>
        <p class="text-xs text-gray-500 mt-1">Suivi fiscal crypto</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <ul class="space-y-1">
          <li v-for="item in navigation" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              :class="{ 'bg-gray-800 text-white': route.path === item.to }"
            >
              <UIcon :name="item.icon" class="w-5 h-5" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>

        <!-- Fiscal Reports Section -->
        <div class="mt-8">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Rapport fiscal
          </h3>
          <ul class="space-y-1">
            <li v-for="year in fiscalYears" :key="`fiscal-${year}`">
              <NuxtLink
                :to="`/fiscal/${year}`"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                :class="{ 'bg-gray-800 text-white': route.path === `/fiscal/${year}` }"
              >
                <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
                {{ year }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Tax Analysis Section -->
        <div class="mt-8">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Analyse détaillée
          </h3>
          <ul class="space-y-1">
            <li v-for="year in taxYears" :key="`tax-${year}`">
              <NuxtLink
                :to="`/tax/${year}`"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                :class="{ 'bg-gray-800 text-white': route.path === `/tax/${year}` }"
              >
                <UIcon name="i-heroicons-calculator" class="w-5 h-5" />
                {{ year }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-800">
        <p class="text-xs text-gray-500">
          Flat Tax: 30% (2024-2025) / 31.4% (2026)
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto bg-gray-950">
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
