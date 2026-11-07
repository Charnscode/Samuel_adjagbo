<template>
  <div>
    <h1 class="tb-titre">Tableau de bord</h1>
    <span class="tb-trait" aria-hidden="true"></span>
    <p class="tb-sous">{{ sousTitre }}</p>

    <p v-if="!data" class="page-vide">Chargement…</p>
    <template v-else>
      <div class="tb-kpis">
        <div v-for="k in kpis" :key="k.label" class="kpi" :class="k.classe">
          <span class="kpi__icone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="k.icone" /></svg>
          </span>
          <div>
            <p class="kpi__label">{{ k.label }}</p>
            <p class="kpi__valeur">{{ k.valeur }}</p>
            <p class="kpi__sous">{{ k.sous }}</p>
          </div>
        </div>
      </div>

      <div class="tb-duo">
        <section class="tb-carte">
          <h2 class="tb-carte__titre">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
            Répartition des servants par lieu de culte
          </h2>
          <div class="tb-repartition">
            <svg viewBox="0 0 120 120" class="donut" role="img" aria-label="Répartition des servants par lieu de culte">
              <circle cx="60" cy="60" r="44" class="donut__fond" />
              <circle v-for="(s, i) in segments" :key="s.id" cx="60" cy="60" r="44" class="donut__anneau" :class="`donut-s${(i % 3) + 1}`"
                :stroke-dasharray="`${s.longueur} ${circ - s.longueur}`" :stroke-dashoffset="-s.debut" transform="rotate(-90 60 60)" />
              <text x="60" y="58" text-anchor="middle" class="donut__total">{{ data.servants }}</text>
              <text x="60" y="73" text-anchor="middle" class="donut__label">Total</text>
            </svg>
            <ul class="tb-legende">
              <li v-for="(s, i) in segments" :key="s.id">
                <span class="tb-legende__point" :class="`tb-pt-${(i % 3) + 1}`"></span>
                <span class="tb-legende__nom">{{ s.nom }}</span>
                <span class="tb-legende__val">{{ s.total }} ({{ s.pct }} %)</span>
              </li>
            </ul>
          </div>
        </section>

        <section class="tb-carte">
          <h2 class="tb-carte__titre">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            Activités récentes
          </h2>
          <p v-if="!data.activites.length" class="page-vide">Aucune activité récente.</p>
          <ul class="tb-activites">
            <li v-for="a in data.activites" :key="a.id" class="tb-activite">
              <span class="tb-activite__icone" :class="icone(a.type).classe">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icone(a.type).d" /></svg>
              </span>
              <div>
                <p class="tb-activite__texte">{{ a.texte }}</p>
                <p class="tb-activite__detail">{{ a.detail }}</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/services/api'

const auth = useAuthStore()
const data = ref(null)
const circ = 2 * Math.PI * 44
const TIRET = '-'

const sousTitre = computed(() => (auth.isAdminGlobal
  ? 'Vue d\u2019ensemble de la plateforme de gestion'
  : 'Vue d\u2019ensemble de votre lieu de culte'))

onMounted(async () => { data.value = await adminApi.dashboard(auth.user) })

const kpis = computed(() => [
  { label: 'Servants', valeur: data.value.servants, sous: 'Inscrits', classe: 'kpi--bleu', icone: 'M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 20v-1a3 3 0 0 0-2-2.8' },
  { label: 'Présents', valeur: data.value.presents ?? TIRET, sous: 'Cette semaine', classe: 'kpi--vert', icone: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4M9 15l2 2 4-4' },
  { label: 'Absents', valeur: data.value.absents ?? TIRET, sous: 'Cette semaine', classe: 'kpi--orange', icone: 'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0' },
  { label: 'Sanctions', valeur: data.value.sanctions, sous: 'En cours', classe: 'kpi--rouge', icone: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 9v4M12 16h.01' }
])

const ICONES = {
  servant: { classe: 'kpi--bleu', d: 'M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 8v6M16 11h6' },
  sanction: { classe: 'kpi--rouge', d: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z' },
  presence: { classe: 'kpi--vert', d: 'M9 12l2 2 4-4M5 4h14v16H5z' },
  classement: { classe: 'kpi--orange', d: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z' }
}
const icone = (type) => ICONES[type] || ICONES.classement

const segments = computed(() => {
  let debut = 0
  return data.value.repartition.map((r) => {
    const part = r.total / (data.value.servants || 1)
    const s = { ...r, debut, longueur: part * circ, pct: Math.round(part * 100) }
    debut += s.longueur
    return s
  })
})
</script>