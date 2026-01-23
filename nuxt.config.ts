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

  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    }
  },

  compatibilityDate: '2025-01-16'
})
