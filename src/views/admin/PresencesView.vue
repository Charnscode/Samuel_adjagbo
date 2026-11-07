<template>
  <div class="sv-page">
    <div class="sv-entete">
      <div>
        <h1 class="sv-titre">Marquer les présences<span class="sv-lieu"> ({{ store.nomLieu(lieu) }})</span></h1>
        <p class="pre-date">{{ libelleDate }}</p>
      </div>
      <label class="sv-btn sv-btn--voir pre-calendrier" title="Choisir la date">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
        <input v-model="date" type="date" :max="aujourdhui" class="pre-date-input" aria-label="Choisir la date" @click="ouvrirDate" />
      </label>
    </div>

    <p v-if="infoLecture" class="sv-message pre-info" role="status">{{ infoLecture }}</p>
    <p v-if="avertissement" class="sv-message pre-alerte" role="alert">{{ avertissement }}</p>
    <p v-if="message" class="sv-message" role="status">{{ message }}</p>

    <div class="sv-carte">
      <div class="sv-filtres">
        <span class="sv-select">
          <select v-model="nature" class="sv-champ" aria-label="Nature de la s&eacute;ance">
            <option value="messe">Messe</option>
            <option value="reunion">R&eacute;union / r&eacute;p&eacute;tition</option>
          </select>
        </span>
        <span class="sv-select">
          <select v-model="groupe" class="sv-champ" aria-label="Groupe">
            <option value="">Tous les groupes</option>
            <option v-for="g in GRADES" :key="g" :value="g">{{ g }}</option>
          </select>
        </span>
        <span class="sv-select">
          <select v-model="lieu" class="sv-champ" aria-label="Station">
            <option v-for="l in store.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
          </select>
        </span>
        <span class="sv-recherche">
          <svg viewBox="0 0 24 24" class="sv-recherche__icone" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14" /></svg>
          <input v-model="recherche" type="search" placeholder="Rechercher…" aria-label="Rechercher un servant" class="sv-champ sv-champ--recherche" />
        </span>
      </div>

      <div class="sv-tablewrap">
        <table class="sv-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nom complet</th>
              <th scope="col">Grade</th>
              <th scope="col">Présence</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!lignes.length"><td colspan="5" class="sv-vide">Aucun servant à afficher.</td></tr>
            <tr v-for="(s, i) in lignes" :key="s.id">
              <td>{{ (pageCourante - 1) * parPage + i + 1 }}</td>
              <td class="sv-nom">{{ s.prenom }} {{ s.nom }}</td>
              <td class="sv-grade">{{ s.grade }}</td>
              <td>
                <div class="pre-choix" role="group" :aria-label="`Présence de ${s.prenom} ${s.nom}`">
                  <button v-for="o in optionsVisibles(s.id)" :key="o.id" type="button" class="pre-opt"
                    :class="[o.classe, { 'pre-opt--actif': choix[s.id] === o.id }]" :disabled="!peutCocher"
                    :aria-pressed="choix[s.id] === o.id" :title="o.titre" @click="definir(s.id, o.id)">{{ o.label }}</button>
                </div>
              </td>
              <td>
                <div class="sv-actions">
                  <router-link :to="`/servants/${s.id}`" class="sv-btn sv-btn--voir" :aria-label="`Voir ${s.prenom} ${s.nom}`" title="Voir">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6" /></svg>
                  </router-link>
                  <router-link to="/admin/servants" class="sv-btn sv-btn--edit" :aria-label="`Modifier ${s.prenom} ${s.nom}`" title="Modifier">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                  </router-link>
                  <button v-if="peutGerer" type="button" class="sv-btn sv-btn--supp" :aria-label="`Désactiver ${s.prenom} ${s.nom}`" title="Désactiver" @click="desactiver(s)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sv-pied">
        <div class="sv-pages">
          <button type="button" class="sv-num" aria-label="Page précédente" :disabled="pageCourante === 1" @click="page = pageCourante - 1">‹</button>
          <button v-for="n in nbPages" :key="n" type="button" class="sv-num" :class="{ 'sv-num--actif': n === pageCourante }" @click="page = n">{{ n }}</button>
          <button type="button" class="sv-num" aria-label="Page suivante" :disabled="pageCourante === nbPages" @click="page = pageCourante + 1">›</button>
        </div>
        <label class="sv-parpage">
          <span class="sv-select">
            <select v-model.number="parPage" class="sv-champ" aria-label="Éléments par page"><option :value="5">5</option><option :value="10">10</option><option :value="20">20</option></select>
          </span>
          éléments par page
        </label>
      </div>

      <div class="pre-bas">
        <p class="pre-resume">{{ compte.present }} présent(s) · {{ compte.absent }} absent(s) · {{ compte.permission }} permissionn&eacute;(s)<span v-if="dejaEnregistree"> · séance déjà enregistrée : vos changements la remplacent</span></p>
        <div v-if="peutCocher" class="pre-actions-bas">
          <button type="button" class="pre-secondaire" @click="toutPresent">Tous présents</button>
          <button type="button" class="sv-ajout" :disabled="!enregistrable" @click="enregistrer">
            <svg viewBox="0 0 24 24" class="sv-ajout__icone" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M19 8v6M22 11h-6M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" /></svg>
            Enregistrer la présence
          </button>
        </div>
      </div>
    </div>

    <div v-if="seances.length" class="sv-carte pre-seances">
      <h2 class="pre-seances__titre">Séances enregistrées</h2>
      <ul class="pre-seances__liste">
        <li v-for="x in seances" :key="x.cle">
          <button type="button" class="pre-seance" :class="{ 'pre-seance--actif': x.cle === cle }" @click="ouvrir(x)">
            <span>{{ libelleType(x.type) }} · {{ libelleCourt(x.date) }}</span>
            <small>{{ x.presents }} présent(s) · {{ x.absents }} absent(s) · {{ x.permissions }} permissionn&eacute;(s)</small>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { useServantsStore, GRADES } from '@/stores/servants'
import { STATUTS } from '@/utils/presence'
import { USE_MOCK } from '@/config'

const auth = useAuthStore()
const store = useServantsStore()

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const aujourdhui = iso(new Date())


const lieu = ref(auth.isAdminGlobal ? store.lieux[0].id : auth.user.lieu)
const route = useRoute()
const nature = ref(route.query.type === 'reunion' ? 'reunion' : 'messe')
const date = ref(aujourdhui)
const groupe = ref('')
const recherche = ref('')
const page = ref(1)
const parPage = ref(5)
const choix = reactive({})
const message = ref('')

const jour = computed(() => new Date(`${date.value}T00:00:00`))
const estDimanche = computed(() => jour.value.getDay() === 0)
const libelleDate = computed(() => jour.value.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
// Date libre : le type de messe se deduit de la date (dimanche ou semaine). Concu par coherence, a valider.
const type = computed(() => (nature.value === 'reunion' ? 'reunion' : estDimanche.value ? 'dimanche' : 'semaine'))
const libelleType = (t) => (t === 'dimanche' ? 'Messe (dimanche)' : t === 'reunion' ? 'R\u00e9union' : 'Messe (semaine)')
const libelleCourt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

// RG3 : seul le responsable du lieu marque les présences de son lieu. L'admin global et les autres lieux : lecture seule.
const peutCocher = computed(() => auth.user.role === 'responsable_lieu' && auth.user.lieu === lieu.value)
const peutGerer = computed(() => auth.isAdminGlobal || auth.user.lieu === lieu.value)
const infoLecture = computed(() => {
  if (peutCocher.value) return ''
  if (auth.isAdminGlobal) {
    return USE_MOCK
      ? 'Lecture seule : l’administrateur global ne marque pas les présences (RG3). Connectez-vous avec un compte responsable : dome, adjagbo ou ayimlonfide.'
      : 'Lecture seule : l’administrateur global ne marque pas les présences (RG3). Connectez-vous avec un compte responsable de lieu.'
  }
  return 'Lecture seule : ce lieu n’est pas le vôtre.'
})
const avertissement = computed(() => {
  if (date.value > aujourdhui) return 'La date choisie est dans le futur : choisissez aujourd’hui ou une date passée.'
  return ''
})

const servantsLieu = computed(() => store.liste.filter((s) => s.lieu === lieu.value && s.actif))
const filtres = computed(() => {
  const q = recherche.value.trim().toLowerCase()
  return servantsLieu.value.filter((s) =>
    (!groupe.value || s.grade === groupe.value) &&
    (!q || `${s.prenom} ${s.nom}`.toLowerCase().includes(q)))
})
const nbPages = computed(() => Math.max(1, Math.ceil(filtres.value.length / parPage.value)))
const pageCourante = computed(() => Math.min(page.value, nbPages.value))
const lignes = computed(() => filtres.value.slice((pageCourante.value - 1) * parPage.value, pageCourante.value * parPage.value))
const cle = computed(() => `${type.value}|${date.value}|${lieu.value}`)
const dejaEnregistree = computed(() => !!store.presences[cle.value])
const seances = computed(() => store.seances(lieu.value))
const enregistrable = computed(() => peutCocher.value && !avertissement.value && servantsLieu.value.length > 0)
const compte = computed(() => {
  const c = { present: 0, absent: 0, permission: 0 }
  servantsLieu.value.forEach((s) => { c[choix[s.id] || 'present']++ })
  return c
})

const optionsVisibles = (id) => (peutCocher.value ? STATUTS : STATUTS.filter((o) => o.id === choix[id]))

// Remplit les servants sans choix : séance existante, sinon « Présent » par défaut.
function completer() {
  const sauve = store.presences[cle.value] || {}
  servantsLieu.value.forEach((s) => { if (choix[s.id] === undefined) choix[s.id] = sauve[s.id] ?? 'present' })
}
function reinitialiser() {
  Object.keys(choix).forEach((k) => delete choix[k])
  completer()
}
watch(cle, reinitialiser, { immediate: true })
watch(servantsLieu, completer)
watch([groupe, recherche, parPage, lieu], () => { page.value = 1 })

function ouvrirDate(e) {
  try { if (e.target.showPicker) e.target.showPicker() } catch (err) { /* navigateur sans showPicker */ }
}
function definir(id, statut) {
  if (!peutCocher.value) return
  choix[id] = statut
}
function toutPresent() {
  if (!peutCocher.value) return
  servantsLieu.value.forEach((s) => { choix[s.id] = 'present' })
}
function ouvrir(x) {
  nature.value = x.type === 'reunion' ? 'reunion' : 'messe'
  date.value = x.date
}
function desactiver(s) {
  if (!peutGerer.value) return
  if (!window.confirm(`Désactiver ${s.prenom} ${s.nom} ? Son historique sera conservé.`)) return
  store.basculerStatut(s.id) // RG8 : désactivation, jamais de suppression
}
function enregistrer() {
  if (!enregistrable.value) return
  const valeurs = {}
  servantsLieu.value.forEach((s) => { valeurs[s.id] = choix[s.id] || 'present' })
  store.enregistrerPresences(cle.value, valeurs)
  const c = compte.value
  message.value = `Séance enregistrée : ${c.present} présent(s), ${c.absent} absent(s), ${c.permission} permissionn\u00e9(s).`
  setTimeout(() => { message.value = '' }, 4000)
}
</script>
