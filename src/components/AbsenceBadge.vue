<template>
  <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" :class="niveau.classe">
    <span class="h-2 w-2 rounded-full" :class="niveau.point" />{{ niveau.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { niveauAbsence } from '@/utils/niveau'

const props = defineProps({ absences: { type: Number, required: true } })
const niveau = computed(() => niveauAbsence(props.absences))
</script>