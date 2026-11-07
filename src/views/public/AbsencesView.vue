<template>
  <div class="page-fond page-fond--absences">
    <PageDeco />
    <div class="page-contenu">
      <div class="page-entete">
        <div>
          <h1 class="page-titre">Suivi des absences</h1>
          <p class="page-sous">Consultez le niveau d'absence des servants pour le mois en cours.</p>
        </div>
      </div>

      <div class="page-barre">
        <LieuTabs v-model="lieu" :lieux="onglets" />
      </div>

      <section class="page-bloc">
        <div class="table-defile">
          <table class="table-pub">
            <caption class="sr-only">Niveau d'absence du mois par servant</caption>
            <thead>
              <tr><th>Nom complet</th><th>Grade</th><th>Niveau d'absence</th></tr>
            </thead>
            <tbody>
              <tr v-if="chargement"><td colspan="3" class="page-vide">Chargement…</td></tr>
              <tr v-else-if="!lignes.length"><td colspan="3" class="page-vide">Aucun servant en absence ce mois-ci.</td></tr>
              <tr v-for="x in lignes" v-else :key="x.id">
                <td><RouterLink :to="{ name: 'servant', params: { id: x.id } }" class="table-pub__lien">{{ x.nomComplet }}</RouterLink></td>
                <td class="table-pub__doux">{{ x.grade }}</td>
                <td><AbsenceBadge :absences="x.absences" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <ul class="legende">
        <li v-for="l in legende" :key="l.label"><span class="legende__point" :class="l.point" />{{ l.label }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LieuTabs from '@/components/LieuTabs.vue'
import AbsenceBadge from '@/components/AbsenceBadge.vue'
import PageDeco from '@/components/PageDeco.vue'
import { niveauAbsence } from '@/utils/niveau'
import { publicApi } from '@/services/api'

const route = useRoute()
const legende = [
  { label: '1 absence dans le mois', point: niveauAbsence(1).point },
  { label: '2 absences', point: niveauAbsence(2).point },
  { label: '3 absences ou plus', point: niveauAbsence(3).point }
]

const lieux = ref([])
const lieu = ref(route.query.lieu || 'tous')
const donnees = ref([])
const chargement = ref(true)
const onglets = computed(() => [{ id: 'tous', nom: 'Tous les lieux' }, ...lieux.value])
const lignes = computed(() => donnees.value.filter((x) => x.absences >= 1).sort((a, b) => b.absences - a.absences || a.nomComplet.localeCompare(b.nomComplet)))

async function charger() {
  chargement.value = true
  donnees.value = await publicApi.absences(lieu.value)
  chargement.value = false
}

onMounted(async () => { lieux.value = await publicApi.lieux(); charger() })
watch(lieu, charger)
</script>
