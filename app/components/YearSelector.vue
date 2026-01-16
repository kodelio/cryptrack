<script setup lang="ts">
const props = defineProps<{
  years: number[]
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function selectYear(year: number) {
  emit('update:modelValue', year)
}
</script>

<template>
  <div class="flex gap-2">
    <UButton
      v-for="year in years"
      :key="year"
      :color="modelValue === year ? 'primary' : 'neutral'"
      :variant="modelValue === year ? 'solid' : 'outline'"
      class="cursor-pointer"
      @click="selectYear(year)"
    >
      {{ year }}
    </UButton>
  </div>
</template>
