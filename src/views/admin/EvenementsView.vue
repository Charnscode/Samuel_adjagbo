<template>
  <div class="sv-page">
    <div class="sv-entete">
      <h1 class="sv-titre">&Eacute;v&eacute;nements<span v-if="lieuTitre" class="sv-lieu"> ({{ lieuTitre }})</span></h1>
      <button type="button" class="sv-ajout" @click="ouvrir()">
        <svg viewBox="0 0 24 24" class="sv-ajout__icone" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        Ajouter un &eacute;v&eacute;nement
      </button>
    </div>

    <p v-if="message" class="sv-message" role="status">{{ message }}</p>

    <div class="sv-carte">
      <div class="sv-filtres">
        <span v-if="auth.isAdminGlobal" class="sv-select">
          <select v-model="lieu" aria-label="Lieu de culte" class="sv-champ">
            <option value="tous">Tous les lieux</option>
            <option v-for="l in servants.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
          </select>
        </span>
        <span class="sv-select">
          <select v-model="statut" aria-label="Statut" class="sv-champ">
            <option value="tous">Tous</option>
            <option value="en_cours">En cours</option>
            <option value="a_venir">&Agrave; venir</option>
            <option value="termine">Termin&eacute;s</option>
          </select>
        </span>
        <span class="sv-recherche">
          <svg viewBox="0 0 24 24" class="sv-recherche__icone" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14" /></svg>
          <input v-model="q" type="search" placeholder="Rechercher&hellip;" aria-label="Rechercher un &eacute;v&eacute;nement" class="sv-champ sv-champ--recherche" />
        </span>
      </div>

      <div class="sv-tablewrap">
        <table class="sv-table">
          <thead>
            <tr>
              <th scope="col">&Eacute;v&eacute;nement</th>
              <th scope="col">Lieu</th>
              <th scope="col">Date</th>
              <th scope="col">Statut</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!visibles.length"><td colspan="5" class="sv-vide">Aucun &eacute;v&eacute;nement. Utilisez le bouton Ajouter un &eacute;v&eacute;nement pour en cr&eacute;er un.</td></tr>
            <tr v-for="e in visibles" :key="e.id">
              <td class="sv-nom">{{ e.titre }}<span class="sv-lieu"> &middot; {{ e.type }}</span></td>
              <td class="sv-grade">{{ nomLieu(e.lieu) }}</td>
              <td class="sv-grade">{{ libellePeriode(e) }}</td>
              <td><span class="sv-statut" :class="classeStatut(e)">{{ libelleStatut(e) }}</span></td>
              <td>
                <div v-if="modifiable(e)" class="sv-actions">
                  <button type="button" title="Modifier" :aria-label="`Modifier ${e.titre}`" class="sv-btn sv-btn--edit" @click="ouvrir(e)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                  </button>
                  <button type="button" title="Supprimer" :aria-label="`Supprimer ${e.titre}`" class="sv-btn sv-btn--supp" @click="supprimer(e)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                  </button>
                </div>
                <span v-else class="sv-grade">Lecture seule</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body"><div v-if="modal" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" @click.self="modal = false">
      <form class="card w-full max-w-xl space-y-4 p-6" role="dialog" aria-modal="true" aria-label="&Eacute;v&eacute;nement" @submit.prevent="enregistrer">
        <h2 class="text-lg font-bold text-navy-900">{{ edition ? "Modifier l&rsquo;&eacute;v&eacute;nement" : "Ajouter un &eacute;v&eacute;nement" }}</h2>
        <label class="block text-sm font-medium">Titre
          <input v-model.trim="form.titre" required class="champ" placeholder="Ex. Messe de la rentr&eacute;e" />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block text-sm font-medium">Type
            <select v-model="form.type" class="champ"><option v-for="t in TYPES_EVENEMENT" :key="t">{{ t }}</option></select>
          </label>
          <label class="block text-sm font-medium">Lieu de culte
            <select v-model="form.lieu" class="champ" :disabled="!auth.isAdminGlobal">
              <option v-if="auth.isAdminGlobal" value="tous">Tous les lieux</option>
              <option v-for="l in servants.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
            </select>
          </label>
        </div>
        <label class="block text-sm font-medium">Servants concern&eacute;s
          <select v-model="form.concernes" class="champ"><option v-for="p in PUBLICS" :key="p.id" :value="p.id">{{ p.label }}</option></select>
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block text-sm font-medium">Date de d&eacute;but<input v-model="form.dateDebut" type="date" required class="champ" /></label>
          <label class="block text-sm font-medium">Heure de d&eacute;but<input v-model="form.heureDebut" type="time" class="champ" /></label>
          <label class="block text-sm font-medium">Date de fin<input v-model="form.dateFin" type="date" class="champ" /></label>
          <label class="block text-sm font-medium">Heure de fin<input v-model="form.heureFin" type="time" class="champ" /></label>
        </div>
        <label class="block text-sm font-medium">Lieu pr&eacute;cis
          <input v-model.trim="form.lieuPrecis" class="champ" placeholder="Ex. Salle paroissiale" />
        </label>
        <label class="block text-sm font-medium">Description
          <textarea v-model.trim="form.description" rows="3" class="champ"></textarea>
        </label>
        <label class="block text-sm font-medium">Consignes
          <textarea v-model.trim="form.consignes" rows="2" class="champ" placeholder="Ex. Tenue, heure d&rsquo;arriv&eacute;e"></textarea>
        </label>
        <label class="block text-sm font-medium">Responsable de l&rsquo;&eacute;v&eacute;nement
          <input v-model.trim="form.responsable" class="champ" />
        </label>
        <label v-if="auth.isAdminGlobal" class="block text-sm font-medium">Contact du responsable
          <input v-model.trim="form.contact" class="champ" />
          <span class="text-xs text-slate-500">Visible seulement dans l&rsquo;administration, jamais en public.</span>
        </label>
        <ImageChamp v-model="form.image" label="Image de l&rsquo;&eacute;v&eacute;nement" forme="carre" :cote="900" />
        <p v-if="erreurForm" class="text-sm text-red-600" role="alert">{{ erreurForm }}</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn border border-slate-300" @click="modal = false">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div></Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useServantsStore } from "@/stores/servants"
import { useEvenementsStore, TYPES_EVENEMENT, PUBLICS, statutEvenement, libellePeriode, debutDe } from "@/stores/evenements"
import ImageChamp from "@/components/ImageChamp.vue"

const auth = useAuthStore()
const servants = useServantsStore()
const store = useEvenementsStore()
const lieu = ref("tous")
const statut = ref("tous")
const q = ref("")
const message = ref("")
const modal = ref(false)
const edition = ref(null)
const erreurForm = ref("")

const vide = () => ({
  titre: "", type: "Messe", lieu: auth.isAdminGlobal ? "tous" : auth.user.lieu, concernes: "tous",
  dateDebut: "", heureDebut: "", dateFin: "", heureFin: "", lieuPrecis: "", description: "", consignes: "",
  responsable: "", contact: "", image: null
})
const form = ref(vide())

const lieuTitre = computed(() => (auth.isAdminGlobal ? "" : servants.nomLieu(auth.user.lieu)))
const nomLieu = (id) => (id === "tous" ? "Tous les lieux" : servants.nomLieu(id))
const portee = (e) => auth.isAdminGlobal || e.lieu === "tous" || e.lieu === auth.user.lieu
const modifiable = (e) => auth.isAdminGlobal || e.lieu === auth.user.lieu

const visibles = computed(() => {
  const t = q.value.trim().toLowerCase()
  return store.liste
    .filter(portee)
    .filter((e) => lieu.value === "tous" || e.lieu === lieu.value)
    .filter((e) => statut.value === "tous" || statutEvenement(e) === statut.value)
    .filter((e) => !t || `${e.titre} ${e.type} ${e.lieuPrecis}`.toLowerCase().includes(t))
    .sort((a, b) => debutDe(b).localeCompare(debutDe(a)))
})

const classeStatut = (e) => ({ en_cours: "", a_venir: "sv-statut--venir", termine: "sv-statut--off" })[statutEvenement(e)]
const libelleStatut = (e) => ({ en_cours: "En cours", a_venir: "\u00c0 venir", termine: "Termin\u00e9" })[statutEvenement(e)]

function notifier(t) { message.value = t; setTimeout(() => (message.value = ""), 3500) }
function ouvrir(e) {
  erreurForm.value = ""
  edition.value = e ? e.id : null
  form.value = e ? { ...vide(), ...e } : vide()
  modal.value = true
}
function enregistrer() {
  const f = { ...form.value }
  if (!auth.isAdminGlobal) f.lieu = auth.user.lieu
  try {
    if (edition.value) store.modifier(edition.value, f)
    else store.ajouter(f)
    modal.value = false
    notifier(edition.value ? "\u00c9v\u00e9nement modifi\u00e9." : "\u00c9v\u00e9nement ajout\u00e9.")
  } catch (err) {
    erreurForm.value = err.message
  }
}
function supprimer(e) {
  if (!confirm(`Supprimer l\u2019\u00e9v\u00e9nement \u00ab ${e.titre} \u00bb ?`)) return
  store.supprimer(e.id)
  notifier("\u00c9v\u00e9nement supprim\u00e9.")
}
</script>
