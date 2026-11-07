<template>
  <span class="logo-rond" :class="'logo-rond--' + taille">
    <img :src="LOGO.paroisse" alt="Logo de la paroisse d&rsquo;Adjagbo" width="120" height="120" />
  </span>
</template>

<script setup>
import { LOGO } from '@/config'

// Logo de la paroisse (image JPEG du porteur) affiche en rond. Tailles : site, admin, pied, carte, hero.
defineProps({ taille: { type: String, default: 'site' } })
</script>