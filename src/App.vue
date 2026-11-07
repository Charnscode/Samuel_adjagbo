<template>
  <component :is="layout">
    <RouterView />
  </component>
  <GuideTour />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import GuideTour from '@/components/GuideTour.vue'

const route = useRoute()
const layouts = { public: PublicLayout, admin: AdminLayout, blank: BlankLayout }
const layout = computed(() => layouts[route.meta.layout] || PublicLayout)
</script>
