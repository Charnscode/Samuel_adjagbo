<template>
  <div class="sv-page">
    <div class="sv-entete">
      <div>
        <h1 class="sv-titre">Service de messe<span class="sv-lieu"> ({{ store.nomLieu(lieu) }})</span></h1>
        <p class="pre-date">{{ libelleDate }}</p>
      </div>
      <label class="sv-btn sv-btn--voir pre-calendrier" title="Choisir la date">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
        <input v-model="date" type="date" class="pre-date-input" aria-label="Choisir la date" @click="ouvrirDate" />
      </label>
    </div>

    <p v-if="infoLecture" class="sv-message pre-info" role="status">{{ infoLecture }}</p>
    <p v-if="avertissement" class="sv-message pre-alerte" role="alert">{{ avertissement }}</p>
    <p v-if="message" class="sv-message" role="status">{{ message }}</p>

    <div class="sv-carte">
      <div class="sv-filtres">

        <span class="sv-select">
          <select v-model="lieu" class="sv-champ" aria-label="Station">
            <option v-for="l in store.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
          </select>
        </span>
      </div>

      <div class="sv-tablewrap">
        <table class="sv-table">
          <thead>
            <tr><th scope="col">Poste</th><th scope="col">Servant choisi</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in POSTES" :key="p.id">
              <td class="sv-nom">{{ p.label }}</td>
              <td>
                <span class="sv-select">
                  <select v-model.number="choix[p.id]" class="sv-champ" :disabled="!peutEditer" :aria-label="'Servant au poste ' + p.label">
                    <option value="">Non attribu&eacute;</option>
                    <option v-for="s in servantsLieu" :key="s.id" :value="s.id">{{ s.prenom }} {{ s.nom }} ({{ s.grade }})</option>
                  </select>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pre-bas">
        <p class="pre-resume">{{ nbAttribues }} poste(s) attribu&eacute;(s) sur {{ POSTES.length }}</p>
        <div v-if="peutEditer" class="pre-actions-bas">
          <button type="button" class="pre-secondaire" @click="effacer">Tout effacer</button>
          <button type="button" class="sv-ajout" :disabled="!enregistrable" @click="enregistrer">Enregistrer le service</button>
        </div>
      </div>
    </div>

    <div v-if="seances.length" class="sv-carte pre-seances">
      <h2 class="pre-seances__titre">Services enregistr&eacute;s</h2>
      <ul class="pre-seances__liste">
        <li v-for="x in seances" :key="x.cle">
          <button type="button" class="pre-seance" :class="{ 'pre-seance--actif': x.cle === cle }" @click="ouvrir(x)">
            <span>{{ libelleCourt(x.date) }}</span>
            <small>{{ x.nb }} poste(s) attribu&eacute;(s)</small>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useServantsStore } from '@/stores/servants'
import { POSTES } from '@/utils/grades'

const auth = useAuthStore()
const store = useServantsStore()

const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
const aujourdhui = () => iso(new Date())

const lieu = ref(auth.isAdminGlobal ? store.lieux[0].id : auth.user.lieu)
const date = ref(aujourdhui())
const choix = reactive({})
const message = ref('')

const jour = computed(() => new Date(date.value + 'T00:00:00'))
const libelleDate = computed(() => jour.value.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
const libelleCourt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
// La messe a lieu tous les jours : la date est libre. Le type (dimanche / semaine) se deduit de la date. Concu par coherence, a valider.
const type = computed(() => (jour.value.getDay() === 0 ? 'dimanche' : 'semaine'))

// Comme les presences (RG3) : seul le responsable du lieu choisit les servants de son lieu.
const peutEditer = computed(() => auth.user.role === 'responsable_lieu' && auth.user.lieu === lieu.value)
const infoLecture = computed(() => {
  if (peutEditer.value) return ''
  if (auth.isAdminGlobal) return 'Lecture seule : le service est organisé par le responsable de chaque lieu. Connectez-vous avec un compte responsable : dome, adjagbo ou ayimlonfide.'
  return 'Lecture seule : ce lieu n’est pas le vôtre.'
})

const servantsLieu = computed(() => store.liste.filter((s) => s.lieu === lieu.value && s.actif).sort((a, b) => a.nom.localeCompare(b.nom)))
const cle = computed(() => type.value + '|' + date.value + '|' + lieu.value)
const seances = computed(() => store.seancesService(lieu.value))

const doublons = computed(() => {
  const vus = {}
  const d = []
  POSTES.forEach((p) => {
    const id = choix[p.id]
    if (!id) return
    if (vus[id] && !d.includes(id)) d.push(id)
    vus[id] = true
  })
  return d
})
const avertissement = computed(() => {
  if (doublons.value.length) return 'Un servant ne peut tenir qu’un seul poste par messe.'
  return ''
})
const nbAttribues = computed(() => POSTES.filter((p) => choix[p.id]).length)
const enregistrable = computed(() => peutEditer.value && !avertissement.value)

function charger() {
  const sauve = store.affectations[cle.value] || {}
  POSTES.forEach((p) => { choix[p.id] = sauve[p.id] || '' })
}
watch(cle, charger, { immediate: true })

function ouvrirDate(e) {
  try { if (e.target.showPicker) e.target.showPicker() } catch (err) { /* navigateur sans showPicker */ }
}
function ouvrir(x) {
  date.value = x.date
}
function effacer() {
  if (!peutEditer.value) return
  POSTES.forEach((p) => { choix[p.id] = '' })
}
function enregistrer() {
  if (!enregistrable.value) return
  const valeurs = {}
  POSTES.forEach((p) => { if (choix[p.id]) valeurs[p.id] = choix[p.id] })
  store.enregistrerAffectation(cle.value, valeurs)
  message.value = 'Service enregistré : ' + Object.keys(valeurs).length + ' poste(s) attribué(s).'
  setTimeout(() => { message.value = '' }, 4000)
}
</script>