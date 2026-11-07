<template>
  <div class="page-fond page-fond--fiche">
    <PageDeco />
    <div class="page-contenu">
      <RouterLink to="/classements" class="page-bloc__lien fiche__retour"><span aria-hidden="true">←</span> Retour aux classements</RouterLink>
      <h1 class="page-titre">Détail d&rsquo;un servant</h1>

      <p v-if="chargement" class="page-vide">Chargement…</p>
      <p v-else-if="!servant" class="page-vide">Servant introuvable.</p>
      <template v-else>
        <section class="fiche__tete">
          <div class="fiche__id">
            <img v-if="photo" :src="photo" :alt="`Photo de ${servant.nomComplet}`" class="fiche__photo" />
            <span v-else class="fiche__avatar" aria-hidden="true">{{ initiales }}</span>
            <div>
              <h2 class="fiche__nom">{{ servant.nomComplet }}</h2>
              <p class="fiche__grade">{{ servant.grade }}</p>
              <p class="fiche__lieu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                {{ servant.lieuType }} · {{ servant.lieu }}
              </p>
              <div class="fiche__abs"><AbsenceBadge :absences="servant.absences" /></div>
            </div>
          </div>
          <div class="fiche__rang">
            <p class="fiche__rang-titre">Poste &agrave; la messe de la semaine</p>
            <p class="fiche__rang-ligne">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /></svg>
              <span class="fiche__rang-val">{{ servant.posteSemaine || 'Non attribu&eacute;' }}</span>
            </p>
            <hr class="fiche__rang-sep" />
            <p class="fiche__rang-titre">Poste &agrave; la messe du dimanche</p>
            <p class="fiche__rang-val">{{ servant.posteDimanche || 'Non attribu&eacute;' }}</p>
          </div>
        </section>

        <section class="page-bloc">
          <div class="fiche__outils">
            <div class="seg" role="tablist" aria-label="Section de la fiche">
              <button v-for="o in onglets" :key="o.id" type="button" role="tab" :aria-selected="onglet === o.id"
                class="seg__bouton" :class="{ 'seg__bouton--actif': onglet === o.id }" @click="onglet = o.id">{{ o.label }}</button>
            </div>
            <select v-model="periode" aria-label="Période" class="champ !mt-0 page-select">
              <option v-for="p in periodes" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>

          <h2 class="page-bloc__titre fiche__soustitre">
            {{ onglet === 'classements' ? 'Postes occupés' : 'Absences' }} <span>({{ libellePeriode }})</span>
          </h2>

          <div class="table-defile">
            <table v-if="onglet === 'classements'" class="table-pub">
              <caption class="sr-only">Postes occupés par le servant sur la période</caption>
              <thead><tr><th>Date</th><th>Culte</th><th>Poste</th></tr></thead>
              <tbody>
                <tr v-if="chargementHisto"><td colspan="3" class="page-vide">Chargement…</td></tr>
                <tr v-else-if="!histo.postes.length"><td colspan="3" class="page-vide">Aucun poste sur cette période.</td></tr>
                <tr v-for="c in histo.postes" v-else :key="c.date + c.type">
                  <td class="fiche__cap">{{ jour(c.date) }}</td>
                  <td class="table-pub__doux">{{ culte(c.type) }}</td>
                  <td>{{ c.poste }}</td>
                </tr>
              </tbody>
            </table>
            <table v-else class="table-pub">
              <caption class="sr-only">Absences du servant sur la période</caption>
              <thead><tr><th>Date</th><th>Culte</th><th>Statut</th></tr></thead>
              <tbody>
                <tr v-if="chargementHisto"><td colspan="3" class="page-vide">Chargement…</td></tr>
                <tr v-else-if="!histo.absences.length"><td colspan="3" class="page-vide">Aucune absence sur cette période.</td></tr>
                <tr v-for="a in histo.absences" v-else :key="a.date + a.type">
                  <td class="fiche__cap">{{ jour(a.date) }}</td>
                  <td class="table-pub__doux">{{ culte(a.type) }}</td>
                  <td><span class="fiche__absent"><span class="fiche__absent-point" aria-hidden="true"></span>Absent</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AbsenceBadge from '@/components/AbsenceBadge.vue'
import PageDeco from '@/components/PageDeco.vue'
import { PUBLIC, VISUELS } from '@/config'
import { publicApi } from '@/services/api'

const route = useRoute()
const servant = ref(null)
const histo = ref({ postes: [], absences: [] })
const chargement = ref(true)
const chargementHisto = ref(false)
const onglet = ref('classements')
const periode = ref('mois')
const onglets = [{ id: 'classements', label: 'Postes' }, { id: 'absences', label: 'Absences' }]
const periodes = [
  { id: 'mois', label: 'Mois en cours' },
  { id: 'precedent', label: 'Mois précédent' },
  { id: 'trimestre', label: '3 derniers mois' }
]


const jour = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const culte = (t) => (t === 'dimanche' ? 'Messe du dimanche' : 'Messe de la semaine')
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const libellePeriode = computed(() => (periodes.find((p) => p.id === periode.value) || periodes[0]).label.toLowerCase())
const photo = computed(() => (PUBLIC.photos ? servant.value?.photo || null : null))
const initiales = computed(() => {
  if (!servant.value) return ''
  return servant.value.nomComplet.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
})

function bornes(id) {
  const n = new Date()
  const a = n.getFullYear()
  const m = n.getMonth()
  if (id === 'precedent') return { debut: iso(new Date(a, m - 1, 1)), fin: iso(new Date(a, m, 0)) }
  if (id === 'trimestre') return { debut: iso(new Date(a, m - 2, 1)), fin: iso(n) }
  return { debut: iso(new Date(a, m, 1)), fin: iso(n) }
}

async function chargerHisto() {
  chargementHisto.value = true
  const { debut, fin } = bornes(periode.value)
  histo.value = (await publicApi.servantHistorique(route.params.id, debut, fin)) || { postes: [], absences: [] }
  chargementHisto.value = false
}

onMounted(async () => {
  servant.value = await publicApi.servant(route.params.id)
  chargement.value = false
  if (servant.value) chargerHisto()
})
watch(periode, chargerHisto)
</script>