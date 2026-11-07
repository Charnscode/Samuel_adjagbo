<template>
  <div class="sv-page">
    <h1 class="sv-titre">{{ titre }}</h1>
    <div class="sv-carte sv-bientot">
      <p>Bientôt disponible : cette page sera réalisée dans une prochaine étape.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const titre = computed(() => route.meta.titre)
</script>
