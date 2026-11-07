<template>
  <span class="logo">
    <img v-if="fond !== 'sombre'" :src="LOGO.clair" alt="" class="logo-img" :class="fond === 'auto' ? 'logo-img--theme-clair' : ''" />
    <img v-if="fond !== 'clair'" :src="LOGO.sombre" alt="" class="logo-img" :class="fond === 'auto' ? 'logo-img--theme-sombre' : ''" />
  </span>
</template>

<script setup>
import { LOGO } from '@/config'

// 'auto' suit le thème ; 'clair' ou 'sombre' fixe (le pied de page est toujours sombre)
defineProps({ fond: { type: String, default: 'auto' } })
</script>
