<template>
  <div class="sv-page">
    <div class="sv-entete">
      <h1 class="sv-titre">{{ titreBase }}<span v-if="lieuTitre" class="sv-lieu"> ({{ lieuTitre }})</span></h1>
      <button type="button" class="sv-ajout" @click="ouvrir('ajout')">
        <svg viewBox="0 0 24 24" class="sv-ajout__icone" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        Ajouter un servant
      </button>
    </div>

    <p v-if="message" class="sv-message" role="status">{{ message }}</p>

    <div class="sv-carte">
      <div class="sv-filtres">
        <span v-if="auth.isAdminGlobal" class="sv-select">
          <select v-model="lieu" aria-label="Lieu de culte" class="sv-champ">
            <option value="tous">Tous les lieux</option>
            <option v-for="l in store.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
          </select>
        </span>
        <span class="sv-select">
          <select v-model="grade" aria-label="Grade" class="sv-champ">
            <option value="tous">Tous les grades</option>
            <option v-for="g in GRADES" :key="g">{{ g }}</option>
          </select>
        </span>
        <span class="sv-select">
          <select v-model="statut" aria-label="Statut" class="sv-champ">
            <option value="tous">Tous</option>
            <option value="actif">Actif</option>
            <option value="inactif">Désactivé</option>
          </select>
        </span>
        <span class="sv-recherche">
          <svg viewBox="0 0 24 24" class="sv-recherche__icone" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14" /></svg>
          <input v-model="q" type="search" placeholder="Rechercher…" aria-label="Rechercher un servant" class="sv-champ sv-champ--recherche" />
        </span>
      </div>

      <div class="sv-tablewrap">
        <table class="sv-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nom complet</th>
              <th scope="col">Grade</th>
              <th v-if="auth.isAdminGlobal" scope="col">Lieu</th>
              <th scope="col">Statut</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!visibles.length"><td :colspan="auth.isAdminGlobal ? 6 : 5" class="sv-vide">Aucun servant ne correspond à votre recherche.</td></tr>
            <tr v-for="(s, i) in visibles" :key="s.id">
              <td>{{ (page - 1) * parPage + i + 1 }}</td>
              <td class="sv-nom"><span class="flex items-center gap-3"><Avatar :nom="`${s.prenom} ${s.nom}`" :photo="s.photo || null" taille="h-9 w-9 text-xs" />{{ s.prenom }} {{ s.nom }}</span></td>
              <td class="sv-grade">{{ s.grade }}</td>
              <td v-if="auth.isAdminGlobal" class="sv-grade">{{ store.nomLieu(s.lieu) }}</td>
              <td><span class="sv-statut" :class="{ 'sv-statut--off': !s.actif }">{{ s.actif ? 'Actif' : 'Désactivé' }}</span></td>
              <td>
                <div class="sv-actions">
                  <button v-for="a in actions(s)" :key="a.titre" type="button" :title="a.titre" :aria-label="`${a.titre} ${s.prenom} ${s.nom}`" class="sv-btn" :class="a.classe" @click="a.fn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="a.icone" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sv-pied">
        <div class="sv-pages">
          <button type="button" class="sv-num" aria-label="Page précédente" :disabled="page === 1" @click="page--">‹</button>
          <button v-for="n in totalPages" :key="n" type="button" class="sv-num" :class="{ 'sv-num--actif': n === page }" @click="page = n">{{ n }}</button>
          <button type="button" class="sv-num" aria-label="Page suivante" :disabled="page === totalPages" @click="page++">›</button>
        </div>
        <label class="sv-parpage">
          <span class="sv-select">
            <select v-model.number="parPage" class="sv-champ" aria-label="Éléments par page"><option :value="5">5</option><option :value="10">10</option><option :value="20">20</option></select>
          </span>
          éléments par page
        </label>
      </div>
    </div>

    <Teleport to="body"><ServantFormModal v-if="modal" :mode="modal.mode" :servant="modal.servant" :lieux="lieuxDisponibles"
      :lieu-fixe="auth.isAdminGlobal ? null : auth.user.lieu" @fermer="modal = null" @enregistrer="enregistrer" /></Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useServantsStore, GRADES } from '@/stores/servants'
import ServantFormModal from '@/components/ServantFormModal.vue'
import Avatar from '@/components/Avatar.vue'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const store = useServantsStore()
const route = useRoute()

const q = ref('')
const lieu = ref(route.query.lieu || 'tous')
const grade = ref('tous')
const statut = ref('tous')
const page = ref(1)
const parPage = ref(5)
const modal = ref(null)
const message = ref('')

const titreBase = computed(() => (auth.isAdminGlobal ? 'Servants' : 'Servants de votre lieu de culte'))
const lieuTitre = computed(() => (auth.isAdminGlobal ? '' : store.nomLieu(auth.user.lieu)))
const lieuxDisponibles = computed(() => (auth.isAdminGlobal ? store.lieux : store.lieux.filter((l) => l.id === auth.user.lieu)))

const filtres = computed(() => store.liste.filter((s) =>
  (auth.isAdminGlobal ? lieu.value === 'tous' || s.lieu === lieu.value : s.lieu === auth.user.lieu) &&
  (grade.value === 'tous' || s.grade === grade.value) &&
  (statut.value === 'tous' || (statut.value === 'actif') === s.actif) &&
  `${s.prenom} ${s.nom}`.toLowerCase().includes(q.value.toLowerCase())
))
const totalPages = computed(() => Math.max(1, Math.ceil(filtres.value.length / parPage.value)))
const visibles = computed(() => filtres.value.slice((page.value - 1) * parPage.value, page.value * parPage.value))
watch([q, lieu, grade, statut, parPage], () => { page.value = 1 })
store.purgerPhotos()

const ICONES = {
  voir: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  modifier: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  desactiver: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  reactiver: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5'
}
const actions = (s) => [
  { titre: 'Voir', icone: ICONES.voir, classe: 'sv-btn--voir', fn: () => ouvrir('voir', s) },
  { titre: 'Modifier', icone: ICONES.modifier, classe: 'sv-btn--edit', fn: () => ouvrir('edition', s) },
  s.actif
    ? { titre: 'Désactiver', icone: ICONES.desactiver, classe: 'sv-btn--supp', fn: () => basculer(s) }
    : { titre: 'Réactiver', icone: ICONES.reactiver, classe: 'sv-btn--reac', fn: () => basculer(s) }
]

function ouvrir(mode, servant = null) { modal.value = { mode, servant } }
function notifier(t) { message.value = t; setTimeout(() => (message.value = ''), 3500) }

function enregistrer(data) {
  const donnees = { ...data, lieu: auth.isAdminGlobal ? data.lieu : auth.user.lieu }
  if (modal.value.mode === 'ajout') { store.ajouter(donnees); notifier('Servant ajouté.') }
  else { store.modifier(modal.value.servant.id, donnees); notifier('Servant modifié.') }
  modal.value = null
}

function basculer(s) {
  const etaitActif = s.actif
  if (etaitActif && !confirm(`Désactiver ${s.prenom} ${s.nom} ? Son historique sera conservé.`)) return
  store.basculerStatut(s.id)
  notifier(etaitActif ? 'Servant désactivé.' : 'Servant réactivé.')
}
</script>
