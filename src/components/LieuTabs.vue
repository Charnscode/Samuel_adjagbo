<template>
  <div class="flex flex-wrap gap-2" role="tablist" aria-label="Lieu de culte">
    <button v-for="l in lieux" :key="l.id" role="tab" :aria-selected="l.id === modelValue"
      class="tab" :class="{ 'tab-active': l.id === modelValue }" @click="$emit('update:modelValue', l.id)">
      {{ l.nom }}
    </button>
  </div>
</template>

<script setup>
defineProps({ lieux: { type: Array, required: true }, modelValue: { type: String, required: true } })
defineEmits(['update:modelValue'])
</script>
