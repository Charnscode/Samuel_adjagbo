<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-navy-900">Utilisateurs</h1>
      <div class="flex flex-wrap gap-2">
        <button class="btn-primary" @click="ouvrir(null, 'responsable_lieu')">+ Ajouter un responsable</button>
        <button class="btn-primary" @click="ouvrir(null, 'parent')">+ Ajouter un parent</button>
      </div>
    </div>

    <p v-if="message" class="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700" role="status">{{ message }}</p>
    <p class="mt-3 text-sm text-slate-600">Un parent re&ccedil;oit les alertes, les &eacute;v&eacute;nements et la photo de son enfant seulement apr&egrave;s la cr&eacute;ation de son compte par l&rsquo;administrateur, sur sa demande.</p>

    <div class="card mt-5 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr><th class="px-4 py-3">Nom</th><th class="px-4 py-3">Identifiant</th><th class="px-4 py-3">R&ocirc;le</th><th class="px-4 py-3">Lieu ou enfants</th><th class="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="u in users.liste" :key="u.id" class="border-t border-slate-100">
            <td class="px-4 py-3"><span class="flex items-center gap-3 font-semibold text-navy-900"><Avatar :nom="u.nom" />{{ u.nom }}</span></td>
            <td class="px-4 py-3 text-slate-600">{{ u.identifiant }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="classeRole(u)">{{ libelleRole(u) }}</span>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ detail(u) }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <template v-if="u.role !== 'admin_global'">
                <button class="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft" @click="ouvrir(u)">Modifier</button>
                <button class="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100" @click="reinitialiser(u)">R&eacute;initialiser le mot de passe</button>
                <button class="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50" @click="supprimer(u)">Supprimer</button>
              </template>
              <span v-else class="text-xs text-slate-400">Compte prot&eacute;g&eacute;</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DemandesAcces @creer="depuisDemande" />

    <div v-if="modal" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" @click.self="modal = null">
      <form class="card w-full max-w-md space-y-4 p-6" role="dialog" aria-modal="true" :aria-label="titre" @submit.prevent="enregistrer">
        <h2 class="text-lg font-bold text-navy-900">{{ titre }}</h2>
        <p v-if="modal.resume" class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{{ modal.resume }}</p>
        <label class="block text-sm font-medium">Nom complet<input v-model.trim="f.nom" v-saisie="'nom'" required class="champ" /></label>
        <label class="block text-sm font-medium">Identifiant<input v-model.trim="f.identifiant" v-saisie="'identifiant'" required autocomplete="off" class="champ" /></label>
        <label v-if="modal.role !== 'parent'" class="block text-sm font-medium">Lieu de culte
          <select v-model="f.lieu" required class="champ"><option v-for="l in servants.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option></select>
        </label>
        <fieldset v-else class="text-sm font-medium">
          <legend>Enfants rattach&eacute;s</legend>
          <input v-model="recherche" type="search" class="champ" placeholder="Rechercher un servant&hellip;" aria-label="Rechercher un servant" />
          <div class="mt-2 max-h-48 space-y-1 overflow-y-auto">
            <label v-for="s in candidats" :key="s.id" class="flex items-center gap-2 text-sm font-normal">
              <input v-model="f.enfants" type="checkbox" :value="s.id" />
              <span>{{ s.prenom }} {{ s.nom }} <span class="text-xs text-slate-500">({{ servants.nomLieu(s.lieu) }}, {{ s.grade }})</span></span>
            </label>
            <p v-if="!candidats.length" class="text-xs text-slate-500">Aucun servant trouv&eacute;.</p>
          </div>
        </fieldset>
        <label v-if="!modal.id" class="block text-sm font-medium">Mot de passe
          <input v-model="f.motDePasse" type="password" required minlength="4" autocomplete="new-password" class="champ" />
        </label>
        <p v-if="erreur" class="text-sm text-red-600" role="alert">{{ erreur }}</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn border border-slate-300" @click="modal = null">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useUsersStore } from "@/stores/users"
import { useServantsStore } from "@/stores/servants"
import Avatar from "@/components/Avatar.vue"
import DemandesAcces from "@/components/DemandesAcces.vue"
import { useDemandesStore } from "@/stores/demandes"
import { vSaisie, verifierNom, verifierIdentifiant } from "@/utils/saisie"

const users = useUsersStore()
const servants = useServantsStore()
const demandes = useDemandesStore()

function verifierCompte(c) {
  return verifierNom(c.nom, "Nom complet") || verifierIdentifiant(c.identifiant)
}

const modal = ref(null) // { id?, role }
const f = ref({})
const recherche = ref("")
const erreur = ref("")
const message = ref("")

const titre = computed(() => {
  const parent = modal.value?.role === "parent"
  if (modal.value?.id) return parent ? "Modifier le parent" : "Modifier le responsable"
  return parent ? "Ajouter un parent" : "Ajouter un responsable"
})
const norm = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
const candidats = computed(() => {
  const t = norm(recherche.value.trim())
  return servants.liste
    .filter((s) => s.actif && (!t || norm(`${s.prenom} ${s.nom}`).includes(t)))
    .sort((a, b) => a.lieu.localeCompare(b.lieu) || a.nom.localeCompare(b.nom))
})

const libelleRole = (u) => (u.role === "admin_global" ? "Admin global" : u.role === "parent" ? "Parent" : "Responsable de lieu")
const classeRole = (u) => (u.role === "admin_global" ? "bg-brand-soft text-brand" : u.role === "parent" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-700")
function detail(u) {
  if (u.role === "parent") {
    const noms = (u.enfants || []).map((id) => servants.liste.find((s) => s.id === id)).filter(Boolean).map((s) => `${s.prenom} ${s.nom}`)
    return noms.length ? noms.join(", ") : "Aucun enfant"
  }
  return u.lieu ? servants.nomLieu(u.lieu) : "Tous les lieux"
}

function depuisDemande(d) {
  erreur.value = ""
  recherche.value = d.nomEnfant
  f.value = { nom: d.nomParent, identifiant: "", motDePasse: "", lieu: servants.lieux[0].id, enfants: [] }
  modal.value = { id: undefined, role: "parent", demande: d.id, resume: "Demande de " + d.nomParent + " : enfant " + d.nomEnfant + (d.lieu ? " (" + d.lieu + ")" : "") + ". Cochez l enfant, puis choisissez un identifiant et un mot de passe a remettre au parent." }
}

function notifier(t) { message.value = t; setTimeout(() => (message.value = ""), 3500) }

function ouvrir(u = null, role = "responsable_lieu") {
  erreur.value = ""
  recherche.value = ""
  f.value = u
    ? { nom: u.nom, identifiant: u.identifiant, lieu: u.lieu, enfants: [...(u.enfants || [])] }
    : { nom: "", identifiant: "", motDePasse: "", lieu: servants.lieux[0].id, enfants: [] }
  modal.value = { id: u ? u.id : undefined, role: u ? u.role : role }
}

function enregistrer() {
  try {
    const parent = modal.value.role === "parent"
    const verif = verifierCompte(f.value)
    if (verif) throw new Error(verif)
    if (modal.value.id) {
      users.modifier(modal.value.id, f.value)
      notifier(parent ? "Parent modifi\u00e9." : "Responsable modifi\u00e9.")
    } else {
      users.ajouter({ ...f.value, role: modal.value.role })
      if (modal.value.demande) demandes.traiter(modal.value.demande, "acceptee")
      notifier(parent ? "Parent ajout\u00e9." : "Responsable ajout\u00e9.")
    }
    modal.value = null
  } catch (err) {
    erreur.value = err.message
  }
}

function reinitialiser(u) {
  const mdp = prompt(`Nouveau mot de passe pour ${u.nom} (4 caract\u00e8res minimum) :`)
  if (!mdp) return
  if (mdp.length < 4) return alert("Mot de passe trop court.")
  users.reinitialiser(u.id, mdp)
  notifier("Mot de passe r\u00e9initialis\u00e9.")
}

function supprimer(u) {
  if (!confirm(`Supprimer le compte de ${u.nom} ?`)) return
  users.supprimer(u.id)
  notifier("Compte supprim\u00e9.")
}
</script>
