<template>
  <div class="page-fond">
    <PageDeco />
    <div class="page-contenu">
      <div class="page-entete">
        <h1 class="page-titre">Les servants</h1>
        <p class="page-sous">Les servants de messe de la paroisse d&rsquo;Adjagbo et de ses stations. Cliquez sur un nom pour ouvrir sa fiche.</p>
      </div>

      <section class="page-bloc">
        <div class="srv-barre">
          <input v-model="q" type="search" class="champ !mt-0 srv-recherche" placeholder="Rechercher un servant&hellip;" aria-label="Rechercher un servant" />
          <select v-model="lieu" aria-label="Lieu de culte" class="champ !mt-0 page-select">
            <option value="tous">Tous les lieux</option>
            <option v-for="l in lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
          </select>
          <select v-model="grade" aria-label="Grade" class="champ !mt-0 page-select">
            <option value="tous">Tous les grades</option>
            <option v-for="g in GRADES" :key="g">{{ g }}</option>
          </select>
        </div>
        <p class="page-sous">{{ visibles.length }} servant{{ visibles.length > 1 ? "s" : "" }}</p>
        <div class="table-defile">
          <table class="table-pub">
            <caption class="sr-only">Liste des servants</caption>
            <thead><tr><th>Nom complet</th><th>Grade</th><th>Lieu</th><th>Suivi des absences</th></tr></thead>
            <tbody>
              <tr v-if="chargement"><td colspan="4" class="page-vide">Chargement&hellip;</td></tr>
              <tr v-else-if="!visibles.length"><td colspan="4" class="page-vide">Aucun servant ne correspond &agrave; la recherche.</td></tr>
              <tr v-for="s in visibles" :key="s.id">
                <td>
                  <RouterLink :to="{ name: 'servant', params: { id: s.id } }" class="table-pub__lien srv-nom">
                    <span class="srv-initiales" aria-hidden="true">{{ initiales(s.nomComplet) }}</span>{{ s.nomComplet }}
                  </RouterLink>
                </td>
                <td class="table-pub__doux">{{ s.grade }}</td>
                <td class="table-pub__doux">{{ s.lieu }}</td>
                <td><AbsenceBadge :absences="s.absences" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import AbsenceBadge from "@/components/AbsenceBadge.vue"
import PageDeco from "@/components/PageDeco.vue"
import { publicApi } from "@/services/api"
import { GRADES } from "@/stores/servants"

const route = useRoute()
const servants = ref([])
const lieux = ref([])
const chargement = ref(true)
const q = ref("")
const lieu = ref(typeof route.query.lieu === "string" ? route.query.lieu : "tous")
const grade = ref("tous")

const norm = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
const initiales = (nom) => nom.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase()

const visibles = computed(() => {
  const t = norm(q.value.trim())
  return servants.value
    .filter((s) => lieu.value === "tous" || s.lieuId === lieu.value)
    .filter((s) => grade.value === "tous" || s.grade === grade.value)
    .filter((s) => !t || norm(s.nomComplet).includes(t))
})

onMounted(async () => {
  lieux.value = await publicApi.lieux()
  servants.value = await publicApi.servants()
  chargement.value = false
})
</script>
