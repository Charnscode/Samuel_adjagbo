<template>
  <img v-if="photo" :src="photo" :alt="nom" class="rounded-full object-cover" :class="taille" />
  <span v-else class="inline-flex items-center justify-center rounded-full bg-brand-soft font-bold text-brand" :class="taille" aria-hidden="true">{{ initiales }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  nom: { type: String, required: true },
  photo: { type: String, default: null },
  taille: { type: String, default: 'h-8 w-8 text-xs' }
})
const initiales = computed(() => props.nom.split(' ').map((m) => m[0]).slice(0, 2).join('').toUpperCase())
</script>