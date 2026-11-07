<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-navy-900">Liste des sanctions</h1>
      <button class="btn-primary" @click="ouvrir">+ Ajouter une sanction</button>
    </div>

    <p v-if="message" class="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700" role="status">{{ message }}</p>

    <div class="mt-5 flex flex-wrap gap-3">
      <select v-model="lieu" aria-label="Lieu de culte" class="champ !mt-0 w-auto">
        <option value="tous">Tous les lieux</option>
        <option v-for="l in servants.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
      </select>
      <select v-model="statut" aria-label="Statut" class="champ !mt-0 w-auto">
        <option value="active">Sanctions actives</option>
        <option value="tous">Toutes (historique)</option>
        <option value="levee">Levées</option>
      </select>
    </div>

    <div class="card mt-4 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-3">Date</th><th class="px-4 py-3">Nom complet</th><th class="px-4 py-3">Lieu</th>
            <th class="px-4 py-3">Motif</th><th class="px-4 py-3">Statut</th><th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length"><td colspan="6" class="px-4 py-8 text-center text-slate-500">Aucune sanction à afficher.</td></tr>
          <tr v-for="s in rows" :key="s.id" class="border-t border-slate-100">
            <td class="px-4 py-3 whitespace-nowrap">{{ date(s.date) }}</td>
            <td class="px-4 py-3 font-semibold text-navy-900">{{ s.nomComplet }}</td>
            <td class="px-4 py-3 text-slate-600">{{ servants.nomLieu(s.lieu) }}</td>
            <td class="px-4 py-3">{{ s.motif }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="s.statut === 'active' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">
                {{ s.statut === 'active' ? 'Active' : 'Levée' }}
              </span>
              <span v-if="s.dateLevee" class="ml-2 text-xs text-slate-500">le {{ date(s.dateLevee) }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button v-if="s.statut === 'active' && peutGerer(s.lieu)" class="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft" @click="lever(s)">Lever</button>
              <span v-else-if="s.statut === 'active'" class="text-xs text-slate-400">Lecture seule</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="modal = false">
      <form class="card w-full max-w-md space-y-4 p-6" role="dialog" aria-modal="true" aria-label="Ajouter une sanction" @submit.prevent="ajouter">
        <h2 class="text-lg font-bold text-navy-900">Ajouter une sanction</h2>
        <label class="block text-sm font-medium">Servant
          <select v-model.number="form.servantId" required class="champ">
            <option :value="null" disabled>Choisir un servant…</option>
            <option v-for="x in candidats" :key="x.id" :value="x.id">{{ x.prenom }} {{ x.nom }} : {{ servants.nomLieu(x.lieu) }}</option>
          </select>
        </label>
        <label class="block text-sm font-medium">Motif
          <textarea v-model.trim="form.motif" v-saisie="'motif'" required rows="3" class="champ" placeholder="Décrivez le motif de la sanction" />
        </label>
        <p v-if="erreurMotif" class="text-sm text-red-600" role="alert">{{ erreurMotif }}</p>
        <p class="text-xs text-slate-500">Durée indéterminée : la sanction reste active jusqu’à sa levée manuelle.</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn border border-slate-300" @click="modal = false">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useServantsStore } from '@/stores/servants'
import { useSanctionsStore } from '@/stores/sanctions'
import { vSaisie, verifierMotif } from '@/utils/saisie'

const auth = useAuthStore()
const servants = useServantsStore()
const sanctions = useSanctionsStore()

const lieu = ref('tous')
const statut = ref('active')
const modal = ref(false)
const erreurMotif = ref("")
const message = ref('')
const form = ref({ servantId: null, motif: '' })

// RG9 : l'admin global agit sur tous les lieux, un responsable sur le sien
const peutGerer = (l) => auth.isAdminGlobal || auth.user.lieu === l
const date = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR')

const rows = computed(() =>
  sanctions.liste
    .map((s) => {
      const x = servants.liste.find((v) => v.id === s.servantId)
      return { ...s, nomComplet: x ? `${x.prenom} ${x.nom}` : 'Servant inconnu', lieu: x?.lieu }
    })
    .filter((s) => (lieu.value === 'tous' || s.lieu === lieu.value) && (statut.value === 'tous' || s.statut === statut.value))
)

const candidats = computed(() => servants.liste.filter((x) => x.actif && peutGerer(x.lieu)))

function notifier(t) { message.value = t; setTimeout(() => (message.value = ''), 3500) }
function ouvrir() { form.value = { servantId: null, motif: '' }; modal.value = true; erreurMotif.value = "" }

function ajouter() {
  const e = verifierMotif(form.value.motif)
  if (e) { erreurMotif.value = e; return }
  erreurMotif.value = ""
  sanctions.ajouter({ ...form.value, par: auth.user.nom })
  modal.value = false
  notifier('Sanction enregistrée.')
}

function lever(s) {
  if (!confirm(`Lever la sanction de ${s.nomComplet} ?`)) return
  sanctions.lever(s.id)
  notifier('Sanction levée. L’historique est conservé.')
}
</script>