<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-navy-900">Suivi des absences</h1>
        <p class="mt-1 text-sm capitalize text-slate-600">Absences du mois · {{ mois }}</p>
      </div>
      <select v-model="lieu" aria-label="Lieu de culte" class="champ !mt-0 w-auto">
        <option value="tous">Tous les lieux</option>
        <option v-for="l in store.lieux" :key="l.id" :value="l.id">{{ l.nom }}</option>
      </select>
    </div>

    <div class="card mt-5 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <caption class="sr-only">Présence de la semaine et niveau d’absence du mois</caption>
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-3">Nom complet</th><th class="px-4 py-3">Grade</th>
            <th v-if="lieu === 'tous'" class="px-4 py-3">Lieu</th>
            <th v-for="j in jours" :key="j" class="px-2 py-3 text-center">{{ j }}</th>
            <th class="px-4 py-3">Absences</th><th class="px-4 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length"><td colspan="12" class="px-4 py-8 text-center text-slate-500">Aucun servant actif.</td></tr>
          <tr v-for="x in rows" :key="x.id" class="border-t border-slate-100">
            <td class="px-4 py-3"><span class="flex items-center gap-3 font-semibold text-navy-900"><Avatar :nom="x.nomComplet" />{{ x.nomComplet }}</span></td>
            <td class="px-4 py-3 text-slate-600">{{ x.grade }}</td>
            <td v-if="lieu === 'tous'" class="px-4 py-3 text-slate-600">{{ store.nomLieu(x.lieu) }}</td>
            <td v-for="(p, i) in x.jours" :key="i" class="px-2 py-3 text-center">
              <span class="inline-block h-3 w-3 rounded-full" :class="point(p, x.absences)" :title="titre(p)" />
            </td>
            <td class="px-4 py-3 font-semibold">{{ x.absences }}</td>
            <td class="px-4 py-3"><AbsenceBadge :absences="x.absences" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
      <li v-for="l in legende" :key="l.label" class="flex items-center gap-2"><span class="h-3 w-3 rounded-full" :class="l.point" />{{ l.label }}</li>
    </ul>
    <section class="mt-8" aria-labelledby="bilan-titre">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="bilan-titre" class="text-lg font-bold text-navy-900">Bilan des r&eacute;unions du samedi</h2>
          <p class="mt-1 text-sm text-slate-600">Nombre de fois o&ugrave; chaque servant a &eacute;t&eacute; pr&eacute;sent, absent ou permissionn&eacute;. Un permissionn&eacute; n&rsquo;est compt&eacute; ni comme absent ni comme servant.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="periode" aria-label="P&eacute;riode du bilan" class="champ !mt-0 w-auto">
            <option value="mois">Mois en cours</option>
            <option value="trimestre">Trimestre en cours</option>
          </select>
          <RouterLink v-if="peutSaisir" to="/admin/presences?type=reunion" class="btn-primary">Saisir une r&eacute;union</RouterLink>
        </div>
      </div>
      <div class="card mt-4 overflow-x-auto">
        <table class="w-full text-left text-sm">
          <caption class="sr-only">Bilan des pr&eacute;sences aux r&eacute;unions du samedi</caption>
          <thead class="bg-slate-50 text-slate-600">
            <tr><th class="px-4 py-3">Nom complet</th><th class="px-4 py-3">Grade</th><th v-if="lieu === 'tous'" class="px-4 py-3">Lieu</th><th class="px-4 py-3">Pr&eacute;sences</th><th class="px-4 py-3">Absences</th><th class="px-4 py-3">Permissionn&eacute;s</th></tr>
          </thead>
          <tbody>
            <tr v-if="aucuneReunion"><td :colspan="lieu === 'tous' ? 6 : 5" class="px-4 py-8 text-center text-slate-500">Aucune r&eacute;union enregistr&eacute;e sur cette p&eacute;riode.</td></tr>
            <tr v-for="x in bilan" v-else :key="x.lieuNom + x.id" class="border-t border-slate-100">
              <td class="px-4 py-3"><span class="flex items-center gap-3 font-semibold text-navy-900"><Avatar :nom="x.nomComplet" />{{ x.nomComplet }}</span></td>
              <td class="px-4 py-3 text-slate-600">{{ x.grade }}</td>
              <td v-if="lieu === 'tous'" class="px-4 py-3 text-slate-600">{{ x.lieuNom }}</td>
              <td class="px-4 py-3 font-semibold">{{ x.presents }}</td>
              <td class="px-4 py-3 font-semibold">{{ x.absents }}</td>
              <td class="px-4 py-3">{{ x.permissions }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useServantsStore } from '@/stores/servants'
import { useAuthStore } from '@/stores/auth'
import { niveauAbsence } from '@/utils/niveau'
import Avatar from '@/components/Avatar.vue'
import AbsenceBadge from '@/components/AbsenceBadge.vue'

const store = useServantsStore()
const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
const lieu = ref('tous')
const auth = useAuthStore()
const peutSaisir = computed(() => !!auth.user && auth.user.role === 'responsable_lieu')
const periode = ref('mois')
const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
const bornes = computed(() => {
  const n = new Date()
  const m0 = periode.value === 'mois' ? n.getMonth() : Math.floor(n.getMonth() / 3) * 3
  const m1 = periode.value === 'mois' ? m0 : m0 + 2
  return { debut: iso(new Date(n.getFullYear(), m0, 1)), fin: iso(new Date(n.getFullYear(), m1 + 1, 0)) }
})
const bilan = computed(() => {
  const lieux = lieu.value === 'tous' ? store.lieux : store.lieux.filter((l) => l.id === lieu.value)
  return lieux.flatMap((l) => store.bilan(l.id, bornes.value.debut, bornes.value.fin).map((x) => ({ ...x, lieuNom: l.nom })))
})
const aucuneReunion = computed(() => bilan.value.every((x) => !x.presents && !x.absents && !x.permissions))

const legende = [
  { label: 'Présent', point: 'bg-green-500' },
  { label: '1 absence', point: 'bg-alerte-noir' },
  { label: '2 absences', point: 'bg-alerte-orange' },
  { label: '3 absences ou plus', point: 'bg-alerte-rouge' },
  { label: 'Permissionn\u00e9 (ni absence, ni compt\u00e9)', point: 'bg-sky-400' },
  { label: 'Non renseigné', point: 'bg-slate-300' }
]

const rows = computed(() =>
  store.liste
    .filter((x) => x.actif && (lieu.value === 'tous' || x.lieu === lieu.value))
    .map((x) => ({ id: x.id, lieu: x.lieu, nomComplet: `${x.prenom} ${x.nom}`, grade: x.grade, ...store.stats(x.id) }))
    .sort((a, b) => b.absences - a.absences || a.nomComplet.localeCompare(b.nomComplet))
)

const point = (p, absences) => (p === 'p' ? 'bg-green-500' : p === 'a' ? niveauAbsence(absences).point : p === 'e' ? 'bg-sky-400' : 'bg-slate-300')
const titre = (p) => (p === 'p' ? 'Présent' : p === 'a' ? 'Absent' : p === 'e' ? 'Permissionn\u00e9' : 'Non renseigné')
</script>