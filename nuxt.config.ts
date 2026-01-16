export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  modules: ['@nuxt/ui'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-side only (not exposed to client)
    coinGeckoApiKey: process.env.COINGECKO_API_KEY || ''
  },

  compatibilityDate: '2025-01-16'
})
