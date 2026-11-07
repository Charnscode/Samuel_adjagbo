<!-- ClassementServiceView (lot 28b) : page publique Classements = postes de service attribues par les responsables. A valider avec le client. -->
<template>
  <div class="page-fond">
    <PageDeco />
    <div class="page-contenu">
      <h1 class="page-titre">Classements</h1>
      <p class="page-sous">Les postes de service &agrave; l&rsquo;autel, attribu&eacute;s par le responsable de chaque lieu de culte, pour la messe du dimanche et pour celle de la semaine.</p>

      <p v-if="chargement" class="page-vide">Chargement&hellip;</p>
      <p v-else-if="erreur" class="page-vide">{{ erreur }}</p>
      <template v-else>
        <p v-if="lieuFiltre" class="fiche__texte">
          <RouterLink :to="{ name: 'classements' }">Voir tous les lieux de culte</RouterLink>
        </p>
        <section v-for="l in lieuxAffiches" :key="l.id" class="page-bloc">
          <h2 class="page-bloc__titre">{{ l.nom }}</h2>
          <div class="cs-grille">
            <div v-for="t in TYPES" :key="t.id">
              <h3 class="cs-sous">
                {{ t.label }}
                <span v-if="donnees[l.id + '|' + t.id] && donnees[l.id + '|' + t.id].date" class="cs-date">&middot; {{ dateFr(donnees[l.id + '|' + t.id].date) }}</span>
              </h3>
              <ul v-if="lignes(l.id, t.id).length" class="cs-liste">
                <li v-for="x in lignes(l.id, t.id)" :key="x.posteId" class="cs-ligne">
                  <span class="cs-poste">{{ x.poste }}</span>
                  <span class="cs-nom">{{ x.nomComplet }}<small>{{ x.grade }}</small></span>
                </li>
              </ul>
              <p v-else class="fiche__texte">Aucun poste attribu&eacute; pour le moment.</p>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { publicApi } from '@/services/api'
import PageDeco from '@/components/PageDeco.vue'

const TYPES = [
  { id: 'dimanche', label: 'Messe du dimanche' },
  { id: 'semaine', label: 'Messe de la semaine' }
]
const route = useRoute()
const lieux = ref([])
const donnees = ref({})
const chargement = ref(true)
const erreur = ref('')

const lieuFiltre = computed(() => {
  const q = route.query.lieu
  return typeof q === 'string' && lieux.value.some((l) => String(l.id) === q) ? q : ''
})
const lieuxAffiches = computed(() => (lieuFiltre.value ? lieux.value.filter((l) => String(l.id) === lieuFiltre.value) : lieux.value))
const lignes = (lieu, type) => (donnees.value[lieu + '|' + type] ? donnees.value[lieu + '|' + type].lignes : [])
const dateFr = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

onMounted(async () => {
  try {
    lieux.value = await publicApi.lieux()
    const reponses = await Promise.all(lieux.value.flatMap((l) => TYPES.map(async (t) => [l.id + '|' + t.id, await publicApi.classementService(l.id, t.id)])))
    donnees.value = Object.fromEntries(reponses)
  } catch (e) {
    erreur.value = 'Les classements ne sont pas disponibles pour le moment. R\u00e9essayez plus tard.'
  } finally {
    chargement.value = false
  }
})
</script>

<style scoped>
.cs-grille { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
.cs-sous { font-weight: 700; margin-bottom: 0.5rem; }
.cs-date { font-weight: 400; opacity: 0.7; }
.cs-liste { list-style: none; margin: 0; padding: 0; }
.cs-ligne { display: flex; justify-content: space-between; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid color-mix(in srgb, currentColor 18%, transparent); }
.cs-poste { font-weight: 600; }
.cs-nom { text-align: right; }
.cs-nom small { display: block; opacity: 0.7; font-size: 0.75rem; }
</style>