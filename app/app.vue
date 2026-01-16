<script setup lang="ts">
const colorMode = useColorMode()

// Set dark mode by default
onMounted(() => {
  if (colorMode.preference === 'system') {
    colorMode.preference = 'dark'
  }
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
